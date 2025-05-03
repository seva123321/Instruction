from asgiref.sync import sync_to_async, async_to_sync
from django.db import models, transaction
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.conf import settings
from telegram import Bot

from .utils.validators import normalize_phone_number
from backend.constants import (
    MAX_LENGTH_EMAIL_ADDRESS,
    MAX_LENGTH_FIRST_NAME,
    MAX_LENGTH_LAST_NAME,
    MAX_LENGTH_MIDDLE_NAME,
    MAX_LENGTH_POSITION,
    MAX_LENGTH_ROLE,
    MAX_LENGTH_INSTRUCTION_TYPE,
    MAX_LENGTH_INSTRUCTION,
    MAX_LENGTH_MEDIA_NAME,
    MAX_LENGTH_PHONE,
    MAX_LENGTH_PASSING_SCORE,
    MIN_LENGTH_PASSING_SCORE,
    MAX_LENGTH_TYPE_QUESTION,
)


class UserManager(BaseUserManager):
    """Кастомный менеджер для модели User."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Создает и сохраняет пользователя с email и паролем."""
        if not email:
            raise ValueError("Email должен быть указан")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Создает обычного пользователя."""
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        extra_fields.setdefault("role", User.Role.USER)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Создает суперпользователя."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Модель пользователя приложения."""

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = (
        "first_name",
        "last_name",
        "mobile_phone",
    )

    class Role(models.TextChoices):
        ADMIN = "admin", "Администратор"
        USER = "user", "Пользователь"
        MANAGEMENT = "management", "Управление"

    username = None
    first_name = models.CharField(
        "Имя",
        max_length=MAX_LENGTH_FIRST_NAME,
    )
    last_name = models.CharField(
        "Фамилия",
        max_length=MAX_LENGTH_LAST_NAME,
    )
    middle_name = models.CharField(
        "Отчество",
        max_length=MAX_LENGTH_MIDDLE_NAME,
    )
    birthday = models.DateField("Дата рождения", blank=True, null=True)
    position = models.ForeignKey(
        "Position",
        on_delete=models.SET_NULL,
        verbose_name="Название должности",
        related_name="users",
        max_length=MAX_LENGTH_POSITION,
        blank=True,
        null=True,
    )
    email = models.EmailField(
        "Электронная почта",
        unique=True,
        max_length=MAX_LENGTH_EMAIL_ADDRESS,
    )
    mobile_phone = models.CharField(
        "Мобильный телефон",
        unique=True,
        max_length=MAX_LENGTH_PHONE,
        blank=True,
        null=True,
    )
    role = models.CharField(
        "Роль",
        max_length=MAX_LENGTH_ROLE,
        choices=Role.choices,
        default=Role.USER,
    )
    face_descriptor = models.TextField(
        "Дескриптор лица",
        blank=True,
        null=True,
    )
    supervisor = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={"role": Role.MANAGEMENT},
        verbose_name="Руководитель",
        related_name="subordinates",
    )
    telegram_chat_id = models.CharField(
        "Telegram Chat ID", max_length=255, blank=True, null=True
    )
    experience_points = models.IntegerField("Очки опыта", default=0)
    current_rank = models.ForeignKey(
        "Rank",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Текущее звание",
    )

    objects = UserManager()

    class Meta:
        ordering = ("last_name", "email")
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self):
        """Возвращает строковое представление объекта пользователя."""
        return f"{self.last_name} {self.first_name}"

    def save(self, *args, **kwargs):
        # Нормализация номера телефона
        if self.mobile_phone:
            self.mobile_phone = normalize_phone_number(self.mobile_phone)

        # Флаг для проверки изменений
        update_ranks_and_badges = False
        if self.pk:
            original = User.objects.get(pk=self.pk)
            if (
                self.experience_points != original.experience_points
                or self.position != original.position
            ):
                update_ranks_and_badges = True
        else:
            update_ranks_and_badges = True

        # Первое сохранение
        super().save(*args, **kwargs)

        # Обновление рангов и значков при изменении
        if update_ranks_and_badges:
            self._update_rank()
            self._assign_badges()

    def _update_rank(self):
        """Обновление звания пользователя"""
        new_rank = (
            Rank.objects.filter(
                models.Q(position=self.position)
                | models.Q(position__isnull=True),
                required_points__lte=self.experience_points,
            )
            .order_by("-required_points")
            .first()
        )

        if new_rank != self.current_rank:
            self.current_rank = new_rank
            self.save(update_fields=["current_rank"])

    def _assign_badges(self):
        """Присвоение новых значков"""
        existing_badges_ids = self.badges.values_list("badge_id", flat=True)

        eligible_badges = Badge.objects.filter(
            models.Q(position=self.position) | models.Q(position__isnull=True),
            required_count__lte=self.experience_points,
        ).exclude(id__in=existing_badges_ids)

        for badge in eligible_badges:
            UserBadge.objects.get_or_create(user=self, badge=badge)


class Badge(models.Model):
    """Модель значков сотрудников."""

    name = models.CharField("Название", max_length=100)
    description = models.TextField("Описание")
    icon = models.ImageField("Иконка", upload_to="badges/", blank=True)
    required_count = models.IntegerField(
        "Требуемое количество очков", default=1
    )
    position = models.ForeignKey(
        "Position",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Должность",
    )

    class Meta:
        verbose_name = "Значок"
        verbose_name_plural = "Значки"

    def __str__(self):
        """Возвращает строковое представление объекта."""
        return self.name


class UserBadge(models.Model):
    """Модель присвоения значков сотрудникам."""

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="badges"
    )
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField("Дата получения", auto_now_add=True)

    class Meta:
        verbose_name = "Значок пользователя"
        verbose_name_plural = "Значки пользователей"

    def __str__(self):
        return f"Значок пользователя: {str(self.badge)}"


class Rank(models.Model):
    """Модель званий сотрудников."""

    name = models.CharField("Название", max_length=50)
    required_points = models.IntegerField("Требуемые очки")
    icon = models.ImageField("Иконка", upload_to="ranks/", blank=True)
    position = models.ForeignKey(
        "Position",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Должность",
    )

    class Meta:
        verbose_name = "Звание"
        verbose_name_plural = "Звания"

    def __str__(self):
        return self.name


class Position(models.Model):
    """Модель должности пользователя."""

    name = models.CharField(
        "Название",
        max_length=MAX_LENGTH_POSITION,
    )
    icon = models.ImageField(
        "Иконка",
        upload_to="positions/",
        blank=True,
        null=True,
        default="positions/default.png",
    )

    class Meta:
        verbose_name = "Должность"
        verbose_name_plural = "Должности"

    def __str__(self):
        """Возвращает строковое представление объекта должности."""
        return self.name


class Notification(models.Model):
    """Модель уведомлений сотрудников."""

    class NotificationType(models.TextChoices):
        TEST = "test", "Результат теста"
        INSTRUCTION = "instruction", "Результат инструктажа"

    user = models.ForeignKey(
        "User",
        on_delete=models.CASCADE,
        related_name="notifications",
        verbose_name="Руководитель",
    )
    employee = models.ForeignKey(
        "User", on_delete=models.CASCADE, verbose_name="Сотрудник"
    )
    notification_type = models.CharField(
        "Тип уведомления", max_length=20, choices=NotificationType.choices
    )
    is_read = models.BooleanField("Прочитано", default=False)
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)

    # Связи с результатами
    test_result = models.ForeignKey(
        "TestResult", on_delete=models.CASCADE, null=True, blank=True
    )
    instruction_result = models.ForeignKey(
        "InstructionResult", on_delete=models.CASCADE, null=True, blank=True
    )
    is_sent = models.BooleanField("Отправлено", default=False)
    error = models.CharField(
        "Ошибка отправки", max_length=255, null=True, blank=True
    )

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.employee} - {self.get_notification_type_display()}"

    def send_notification(self):
        """Синхронный метод для отправки уведомления"""
        async_to_sync(self._async_send_notification)()

    async def _async_send_notification(self):
        """Асинхронная логика отправки уведомления"""
        try:
            bot = Bot(token=settings.TELEGRAM_BOT_TOKEN)
            message = self._generate_message()

            await bot.send_message(
                chat_id=self.user.telegram_chat_id,
                text=message,
                parse_mode="Markdown",
            )
            await self._async_save(sent=True)
        except Exception as e:
            await self._async_save(error=str(e))
            print(f"Ошибка: {str(e)}")

    @sync_to_async
    def _async_save(self, sent=False, error=None):
        """Асинхронное сохранение статуса отправки"""
        with transaction.atomic():
            update_fields = []

            if sent:
                self.is_sent = True
                update_fields.append("is_sent")

            if error and hasattr(self, "error"):
                self.error = error[:255]
                update_fields.append("error")

            if update_fields:
                self.save(update_fields=update_fields)
            else:
                self.save()

    def _generate_message(self):
        emojis = {
            "test": "📚",
            "instruction": "🛠️",
            "achievement": "🏆",
            "reminder": "⏰",
        }

        if self.test_result:
            status_emoji = "✅" if self.test_result.is_passed else "❌"
            return (
                f"{emojis['test']} *Новый результат теста!*\n"
                f"🎮 Уровень: {self.employee.current_rank.name if self.employee.current_rank else 'Новичок'}\n"
                f"📊 Очки: {'+' if self.test_result.is_passed else '-'}{self.test_result.score * 10} XP\n"
                f"🧑💻 Сотрудник: {self.employee}\n"
                f"📝 Тест: {self.test_result.test.name}\n"
                f"🏅 Статус: {status_emoji} {'Пройден' if self.test_result.is_passed else 'Не пройден'}\n"
                f"⏱ Время: {self.test_result.completion_time.strftime('%d.%m.%Y %H:%M')}"
            )
        elif self.instruction_result:
            status_emoji = "✅" if self.instruction_result.result else "❌"
            return (
                f"{emojis['instruction']} *Результат инструктажа!*\n"
                f"🎮 Уровень: {self.employee.current_rank.name if self.employee.current_rank else 'Новичок'}\n"
                f"📊 Очки: +50 XP\n"
                f"👷 Сотрудник: {self.employee}\n"
                f"📋 Инструктаж: {self.instruction_result.instruction.name}\n"
                f"🏅 Статус: {status_emoji} {'Пройден' if self.instruction_result.result else 'Не пройден'}\n"
                f"⏱ Дата: {self.instruction_result.date.strftime('%d.%m.%Y %H:%M')}"
            )


class TypeOfInstruction(models.Model):
    """Модель типов инструктажей."""

    name = models.CharField(
        "Название",
        max_length=MAX_LENGTH_INSTRUCTION_TYPE,
    )
    frequency_of_passage = models.IntegerField(
        "Частота прохождения",
    )

    class Meta:
        verbose_name = "Тип инструктажа"
        verbose_name_plural = "Типы инструктажей"

    def __str__(self):
        """Возвращает строковое представление объекта типа инструктажа."""
        return self.name


class Instruction(models.Model):
    """Модель инструктажа пользователя."""

    name = models.CharField(
        "Название",
        max_length=MAX_LENGTH_INSTRUCTION,
    )
    type_of_instruction = models.ForeignKey(
        "TypeOfInstruction",
        on_delete=models.SET_NULL,
        related_name="instructions",
        verbose_name="Тип инструктажа",
        blank=True,
        null=True,
    )
    text = models.TextField(
        "Текст инструктажа",
    )
    instruction_agreement = models.ManyToManyField(
        "InstructionAgreement",
        related_name="instruction",
        verbose_name="Согласие на инструктаж",
        blank=True,
    )
    position = models.ForeignKey(
        "Position",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Должность",
        related_name="instructions",
    )

    class Meta:
        verbose_name = "Инструктаж"
        verbose_name_plural = "Инструктажи"

    def __str__(self):
        """Возвращает строковое представление объекта инструктажа."""
        return self.name


class InstructionAgreement(models.Model):
    """Модель согласия на инструктаж."""

    name = models.TextField("Название согласия", blank=True, null=True)
    text = models.TextField("Текст согласия", blank=True, null=True)

    class Meta:
        verbose_name = "Согласие на инструктаж"
        verbose_name_plural = "Согласия на инструктаж"

    def __str__(self):
        """Возвращает строковое представление объекта инструктажа."""
        return self.text


class Tests(models.Model):
    """Модель тестов инструктажа."""

    name = models.CharField(
        "Название",
        max_length=MAX_LENGTH_INSTRUCTION,
    )
    description = models.TextField(
        "Описание",
    )
    test_is_control = models.BooleanField(
        "Тест является контрольным",
    )
    passing_score = models.IntegerField(
        "Проходной балл",
        validators=[
            MinValueValidator(MIN_LENGTH_PASSING_SCORE),
            MaxValueValidator(MAX_LENGTH_PASSING_SCORE),
        ],
    )
    position = models.ForeignKey(
        "Position",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Должность",
        related_name="tests",
    )

    class Meta:
        verbose_name = "Тест"
        verbose_name_plural = "Тесты"

    def __str__(self):
        """Возвращает строковое представление объекта теста."""
        return self.name


class Question(models.Model):
    """Модель вопросов теста."""

    class Type(models.TextChoices):
        SINGLE = "single", "Один вариант"
        SEVERAL = "several", "Несколько вариантов"

    name = models.TextField(
        "Вопрос",
    )
    tests = models.ForeignKey(
        Tests,
        on_delete=models.SET_NULL,
        related_name="questions",
        verbose_name="Тест",
        blank=True,
        null=True,
    )
    explanation = models.TextField("Объяснение", default="", blank=True)
    image = models.URLField("Изображение", blank=True, null=True)
    question_type = models.CharField(
        "Тип вопроса",
        max_length=MAX_LENGTH_TYPE_QUESTION,
        choices=Type.choices,
        default=Type.SINGLE,
    )
    points = models.IntegerField(
        "Количество баллов за вопрос",
        validators=[
            MinValueValidator(MIN_LENGTH_PASSING_SCORE),
            MaxValueValidator(MAX_LENGTH_PASSING_SCORE),
        ],
    )

    class Meta:
        verbose_name = "Вопрос"
        verbose_name_plural = "Вопросы"

    def __str__(self):
        """Возвращает строковое представление объекта вопроса."""
        return self.name


class ReferenceLink(models.Model):
    """Модель объяснений вопросов."""

    title = models.TextField(
        "Заголовок",
    )
    source = models.TextField("Источник")
    question = models.ForeignKey(
        "Question",
        on_delete=models.SET_NULL,
        related_name="reference_link",
        verbose_name="Вопрос",
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = "Ссылка на объяснение"
        verbose_name_plural = "Ссылки на объяснение"

    def __str__(self):
        """Возвращает строковое представление объекта объяснения."""
        return self.title


class Answer(models.Model):
    """Модель ответов на вопросы."""

    name = models.TextField(
        "Ответ",
    )
    is_correct = models.BooleanField(
        "Правильный ответ",
    )
    points = models.IntegerField("Количество баллов за ответ")
    question = models.ForeignKey(
        Question,
        on_delete=models.SET_NULL,
        related_name="answers",
        verbose_name="Вопрос",
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = "Ответ"
        verbose_name_plural = "Ответы"

    def __str__(self):
        """Возвращает строковое представление объекта ответа."""
        return self.name


class TestResult(models.Model):
    """Модель результатов тестирования."""

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="test_results",
        verbose_name="Пользователь",
        blank=True,
        null=True,
    )
    test = models.ForeignKey(
        Tests,
        on_delete=models.SET_NULL,
        related_name="test_results",
        verbose_name="Тест",
        blank=True,
        null=True,
    )
    is_passed = models.BooleanField("Тест пройден", default=False)
    mark = models.FloatField(
        "Оценка",
        validators=[
            MinValueValidator(MIN_LENGTH_PASSING_SCORE),
            MaxValueValidator(MAX_LENGTH_PASSING_SCORE),
        ],
    )
    score = models.IntegerField("Набранные баллы", default=0)
    total_points = models.IntegerField("Максимальный балл", default=0)
    start_time = models.DateTimeField("Время начала теста")
    completion_time = models.DateTimeField("Время завершения теста")

    class Meta:
        verbose_name = "Результат тестирования"
        verbose_name_plural = "Результаты тестирования"
        ordering = ("-completion_time",)

    def __str__(self):
        return (
            f"{self.user} - {self.test}"
            f" - {'Пройден' if self.is_passed else 'Не пройден'}"
        )

    def create_notification(self):
        if self.user.supervisor:
            # Создаем уведомление
            notification = Notification.objects.create(
                user=self.user.supervisor,
                employee=self.user,
                notification_type=Notification.NotificationType.TEST,
                test_result=self,
            )

            # Отправляем уведомление в Телеграмм
            notification.send_notification()

    def save(self, *args, **kwargs):
        base_xp = self.score * 10
        if (
            self.is_passed and not self.pk
        ):
            time_bonus = max(
                0, 100 - self.test_duration // 10
            )  # Бонус за скорость
            self.user.experience_points += base_xp + time_bonus
            self.user.save()
        else:
            self.user.experience_points -= base_xp
            self.user.save()
        super().save(*args, **kwargs)


class UserAnswer(models.Model):
    """Модель ответов пользователя на вопросы теста."""

    test_result = models.ForeignKey(
        "TestResult",
        on_delete=models.SET_NULL,
        related_name="user_answers",
        verbose_name="Результат теста",
        null=True,
        blank=True,
    )
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, verbose_name="Вопрос"
    )
    selected_answer = models.ForeignKey(
        Answer, on_delete=models.CASCADE, verbose_name="Выбранный ответ"
    )
    is_correct = models.BooleanField("Ответ верный", default=False)
    points_earned = models.IntegerField("Полученные баллы", default=0)

    class Meta:
        verbose_name = "Ответ пользователя"
        verbose_name_plural = "Ответы пользователя"

    def __str__(self):
        return f"{self.question} - {self.selected_answer}"


class InstructionResult(models.Model):
    """Модель результатов инструктажа."""

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="instruction_results",
        verbose_name="Пользователь",
        blank=True,
        null=True,
    )
    instruction = models.ForeignKey(
        Instruction,
        on_delete=models.SET_NULL,
        related_name="instruction_results",
        verbose_name="Инструктаж",
        blank=True,
        null=True,
    )
    result = models.BooleanField(
        "Прошёл инструктаж",
    )
    date = models.DateTimeField(
        "Дата прохождения",
        auto_now_add=True,
    )
    time = models.TimeField(
        "Время прохождения",
        auto_now_add=True,
    )

    class Meta:
        verbose_name = "Результат инструктажа"
        verbose_name_plural = "Результаты инструктажа"

    def __str__(self):
        """Возвращает строковое представление объекта результата инструктажа."""
        return f"{self.user} - {self.instruction} - {self.result}"

    def create_notification(self):
        if self.user.supervisor:
            # Создаем уведомление
            notification = Notification.objects.create(
                user=self.user.supervisor,
                employee=self.user,
                notification_type=Notification.NotificationType.INSTRUCTION,
                instruction_result=self,
            )

            # Отправляем уведомление в Телеграмм
            notification.send_notification()

    def save(self, *args, **kwargs):
        if (
            self.result and not self.pk
        ):
            self.user.experience_points += 50
            self.user.save()
        super().save(*args, **kwargs)


class InstructionAgreementResult(models.Model):
    """Модель для хранения результатов согласий инструктажа."""

    instruction_result = models.ForeignKey(
        InstructionResult,
        on_delete=models.CASCADE,
        related_name="agreement_results",
    )
    agreement_type = models.CharField(max_length=50)
    agreed = models.BooleanField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Результат согласия инструктажа"
        verbose_name_plural = "Результаты согласий инструктажа"

    def __str__(self):
        return f"{self.agreement_type} - {'Согласен' if self.agreed else 'Не согласен'}"


class Video(models.Model):
    """Модель видеофайлов."""

    type = models.CharField(
        "Тип видео",
        max_length=MAX_LENGTH_MEDIA_NAME,
        choices=[
            ("youtube", "Youtube"),
            ("server", "Видео на сервере"),
        ],
        default="youtube",
    )
    url = models.URLField("URL", blank=True, null=True)
    title = models.CharField(
        "Название",
        max_length=MAX_LENGTH_MEDIA_NAME,
    )
    file = models.FileField(
        "Видеофайл",
        upload_to="videos/",
        blank=True,
    )
    date = models.DateTimeField(
        "Дата загрузки",
        auto_now_add=True,
    )

    class Meta:
        verbose_name = "Видеофайл"
        verbose_name_plural = "Видеофайлы"

    def __str__(self):
        """Возвращает строковое представление объекта видеофайла."""
        return self.title


class NormativeLegislation(models.Model):
    """Модель нормативно-правовых актов."""

    title = models.TextField("Название")
    description = models.TextField(
        "Описание",
        blank=True,
        null=True,
    )
    url = models.URLField("URL", blank=True, null=True)
    file = models.FileField(
        "НПА",
        upload_to="nlas/",
        blank=True,
    )
    date = models.DateTimeField("Дата загрузки", auto_now_add=True)

    class Meta:
        verbose_name = "Нормативно-правовой акт"
        verbose_name_plural = "Нормативно-правовые акты"

    def __str__(self):
        """Возвращает строковое представление объекта нормативно-правового акта."""
        return self.title


class Shift(models.Model):
    """Модель рабочих смен с временными интервалами."""

    name = models.CharField("Название смены", max_length=50)
    start_time = models.TimeField("Время начала")
    end_time = models.TimeField("Время окончания")

    class Meta:
        verbose_name = "Смена"
        verbose_name_plural = "Смены"

    def __str__(self):
        return f"{self.name} ({self.start_time}-{self.end_time})"


class DutySchedule(models.Model):
    """Модель графика дежурств сотрудников."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="duty_schedules",
        verbose_name="Сотрудник",
    )
    shift = models.ForeignKey(
        Shift, on_delete=models.CASCADE, verbose_name="Смена"
    )
    date = models.DateField("Дата дежурства")
    instruction = models.ForeignKey(
        Instruction,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Инструктаж для смены",
    )

    class Meta:
        verbose_name = "График дежурств"
        verbose_name_plural = "Графики дежурств"
        unique_together = ("user", "date")

    def __str__(self):
        return f"{self.user} - {self.date} ({self.shift})"


class GameSwiper(models.Model):
    """Модель для игры Swiper."""

    question = models.TextField("Вопрос",blank=True,null=True,)
    answer = models.BooleanField("Ответ")
    position = models.ForeignKey(
        "Position",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Должность",
        related_name="game_swipers",
    )

    class Meta:
        verbose_name = "Игра Swiper"
        verbose_name_plural = "Игры Swiper"

    def __str__(self):
        return f"{self.question} - {self.answer} "


class GameSwiperResult(models.Model):
    """Модель результатов игры Swiper."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="game_swiper_results",
        verbose_name="Пользователь",
    )
    date = models.DateField("Дата игры", auto_now_add=True)
    score = models.IntegerField("Очки", default=0)

    class Meta:
        verbose_name = "Результат игры Swiper"
        verbose_name_plural = "Результаты игры Swiper"

    def __str__(self):
        return f"{self.user} - {self.date} ({self.score})"

    def save(self, *args, **kwargs):
        self.user.experience_points += self.score * 10
        self.user.save()
        super().save(*args, **kwargs)
