from datetime import timedelta

import asyncio
from celery import shared_task
from django.utils import timezone
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Ленивые импорты для моделей и зависимостей
def get_models():
    from .models import DutySchedule, Notification
    from telegram import Bot
    return DutySchedule, Notification, Bot

@shared_task
def send_instruction_reminders():
    """Отправка напоминаний о предстоящем инструктаже"""
    DutySchedule, _, Bot = get_models()

    now = timezone.now()
    reminder_time = now + timedelta(minutes=15)
    print(reminder_time)

    try:
        upcoming_shifts = DutySchedule.objects.filter(
        date=now.date(),
        shift__start_time__gte=(reminder_time - timedelta(minutes=1)).time(),
        shift__start_time__lte=(reminder_time + timedelta(minutes=1)).time()
    ).select_related('user', 'shift', 'instruction')
        print(upcoming_shifts.count())
        for schedule in upcoming_shifts:
            if schedule.user.telegram_chat_id:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)

                message = (
                    f"⚠️ *Напоминание*: через *15 минут* начинается инструктаж для смены {schedule.shift.name}!\n"
                    f"*Время начала*: {schedule.shift.start_time.strftime('%H:%M')}\n"
                    f"*Инструктаж*: {schedule.instruction.name if schedule.instruction else 'Не указан'}"
                )
                try:
                    asyncio.run(_send_instruction_reminders(message, schedule.user.telegram_chat_id))
                except Exception as e:
                    logger.error(
                        f"Ошибка отправки уведомления пользователю {schedule.user_id}: {str(e)}"
                    )
                finally:
                    loop.close()

    except Exception as e:
        logger.error(f"Ошибка в задаче send_instruction_reminders: {str(e)}")
        raise

async def _send_instruction_reminders(message, telegram_chat_id):
    DutySchedule, _, Bot = get_models()
    try:
        bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)

        await bot.send_message(
            chat_id=telegram_chat_id,
            text=message,
            parse_mode="Markdown"
        )
    except Exception as e:
        logger.error(e)
