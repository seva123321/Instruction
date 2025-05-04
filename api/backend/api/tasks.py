from datetime import timedelta

from asgiref.sync import async_to_sync
from celery import shared_task
from django.utils import timezone
from django.conf import settings
import logging
from telegram import Bot

from .models import DutySchedule, User
from backend.constants import POWER_OF_USER


logger = logging.getLogger(__name__)


@shared_task(expires=600)
def send_instruction_reminders():
    """Отправка напоминаний о предстоящем инструктаже"""
    now = timezone.now() + timedelta(hours=3)
    reminder_time = now + timedelta(minutes=15)

    try:
        upcoming_shifts = DutySchedule.objects.filter(
            date=now.date(),
            shift__start_time=reminder_time.time().strftime("%H:%M:%S"),
        ).select_related("user", "shift", "instruction")
        for schedule in upcoming_shifts:
            if schedule.user.telegram_chat_id:
                message = (
                    f"🎮 Внимание ⚠️, {schedule.shift.name}! Новая миссия доступна! 🏗️\n"
                    f"⏱ Через 15 минут начинается: \n"
                    f"🔧 Инструктаж: {schedule.instruction.name if schedule.instruction else 'Не указан'}\n"
                    f"*Время начала*: {schedule.shift.start_time.strftime('%H:%M')}\n"
                    f"💥 Награда за выполнение: +50 XP"
                )
                try:
                    async_to_sync(_send_message)(message, schedule.user.telegram_chat_id)
                except Exception as e:
                    logger.error(
                        f"Ошибка отправки уведомления пользователю {schedule.user_id}: {str(e)}"
                    )

    except Exception as e:
        logger.error(f"Ошибка в задаче send_instruction_reminders: {str(e)}")
        raise


@shared_task(expires=600)
def send_game_notification():
    """Отправка уведомления пользователю"""
    users = User.objects.filter(
        telegram_chat_id__isnull=False,
        role="user"
    ).select_related("power_of_user")
    try:
        for user in users:
            user.power_of_user.power = POWER_OF_USER
            user.power_of_user.save()
            message = (f'🎮 Внимание ⚠️, {user.first_name},\n'
                       f'💪 Твои *МЕГАСИЛЫ* восстановлены! 🆙✅\n'
                       '💥 Попробуй их в игре! 💥\n')
            async_to_sync(_send_message)(message, user.telegram_chat_id)
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления пользователю {str(e)}")


async def _send_message(message: str, telegram_chat_id: str):
    """Асинхронная отправка сообщения в Telegram"""
    try:
        bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)

        await bot.send_message(
            chat_id=telegram_chat_id,
            text=message,
            parse_mode="Markdown"
        )
    except Exception as e:
        logger.error(f"Ошибка отправки уведомления: {str(e)}")
