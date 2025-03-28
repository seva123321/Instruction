from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator

from django.db import models

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
    MAX_LENGTH_TYPE_QUESTION
)


class UserManager(BaseUserManager):
    """Кастомный менеджер для модели User."""
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Создает и сохраняет пользователя с email и паролем."""
        if not email:
            raise ValueError('Email должен быть указан')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Создает обычного пользователя."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('role', User.Role.USER)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Создает суперпользователя."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Модель пользователя приложения."""

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = (
        'first_name',
        'last_name',
        'mobile_phone',
    )

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Администратор'
        USER = 'user', 'Пользователь'
        MANAGEMENT = 'management', 'Управление'

    username = None
    first_name = models.CharField(
        'Имя',
        max_length=MAX_LENGTH_FIRST_NAME,
    )
    last_name = models.CharField(
        'Фамилия',
        max_length=MAX_LENGTH_LAST_NAME,
    )
    middle_name = models.CharField(
        'Отчество',
        max_length=MAX_LENGTH_MIDDLE_NAME,
    )
    birthday = models.DateField(
        'Дата рождения',
        blank=True,
        null=True
    )
    position = models.CharField(
        'Должность',
        max_length=MAX_LENGTH_POSITION
    )
    email = models.EmailField(
        'Электронная почта',
        unique=True,
        max_length=MAX_LENGTH_EMAIL_ADDRESS,
    )
    mobile_phone = models.CharField(
        'Мобильный телефон',
        unique=True,
        max_length=MAX_LENGTH_PHONE,
    )
    role = models.CharField(
        'Роль',
        max_length=MAX_LENGTH_ROLE,
        choices=Role.choices,
        default=Role.USER,
    )
    face_descriptor = models.TextField(
        'Дескриптор лица',
        blank=True,
        null=True,
    )

    objects = UserManager()

    class Meta:
        ordering = ('last_name', 'email')
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        """Возвращает строковое представление объекта пользователя."""
        return f'{self.last_name} {self.first_name}'


class TypeOfInstruction(models.Model):
    """Модель типов инструктажей."""

    name = models.CharField(
        'Название',
        max_length=MAX_LENGTH_INSTRUCTION_TYPE,
    )
    frequency_of_passage = models.IntegerField(
        'Частота прохождения',
    )

    class Meta:
        verbose_name = 'Тип инструктажа'
        verbose_name_plural = 'Типы инструктажей'

    def __str__(self):
        """Возвращает строковое представление объекта типа инструктажа."""
        return self.name


class Instruction(models.Model):
    """Модель инструктажа пользователя."""

    name = models.CharField(
        'Название',
        max_length=MAX_LENGTH_INSTRUCTION,
    )
    type_of_instruction = models.ForeignKey(
        TypeOfInstruction,
        on_delete=models.SET_NULL,
        related_name='instructions',
        verbose_name='Тип инструктажа',
        blank=True,
        null=True
    )
    text = models.TextField(
        'Текст инструктажа',
    )
    instruction_agreement = models.ManyToManyField(
        'InstructionAgreement',
        related_name='instruction',
        verbose_name='Согласие на инструктаж',
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = 'Инструктаж'
        verbose_name_plural = 'Инструктажи'

    def __str__(self):
        """Возвращает строковое представление объекта инструктажа."""
        return self.name


class InstructionAgreement(models.Model):
    """Модель согласия на инструктаж."""

    name = models.TextField(
        'Название согласия',
        blank=True,
        null=True
    )
    text = models.TextField(
        'Текст согласия',
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = 'Согласие на инструктаж'
        verbose_name_plural = 'Согласия на инструктаж'


class Tests(models.Model):
    """Модель тестов инструктажа."""

    name = models.CharField(
        'Название',
        max_length=MAX_LENGTH_INSTRUCTION,
    )
    description = models.TextField(
        'Описание',
    )
    test_is_control = models.BooleanField(
        'Тест является контрольным',
    )
    passing_score = models.IntegerField(
        'Проходной балл',
        validators=[
            MinValueValidator(MIN_LENGTH_PASSING_SCORE),
            MaxValueValidator(MAX_LENGTH_PASSING_SCORE)
        ]
    )
    total_points = models.IntegerField(
        'Максимальное количество баллов за тест',
    )

    class Meta:
        verbose_name = 'Тест'
        verbose_name_plural = 'Тесты'

    def __str__(self):
        """Возвращает строковое представление объекта теста."""
        return self.name


class Question(models.Model):
    """Модель вопросов теста."""

    class Type(models.TextChoices):
        SINGLE = 'single', 'Один вариант'
        SEVERAL = 'several', 'Несколько вариантов'

    name = models.TextField(
        'Вопрос',
    )
    tests = models.ForeignKey(
        Tests,
        on_delete=models.SET_NULL,
        related_name='questions',
        verbose_name='Тест',
        blank=True,
        null=True
    )
    explanation = models.TextField(
        'Объяснение',
        default='',
        blank=True
    )
    image = models.URLField(
        'Изображение',
        blank=True,
        null=True
    )
    question_type = models.CharField(
        'Тип вопроса',
        max_length=MAX_LENGTH_TYPE_QUESTION,
        choices=Type.choices,
        default=Type.SINGLE,
    )

    class Meta:
        verbose_name = 'Вопрос'
        verbose_name_plural = 'Вопросы'

    def __str__(self):
        """Возвращает строковое представление объекта вопроса."""
        return self.name


class ReferenceLink(models.Model):
    """Модель объяснений вопросов."""

    title = models.TextField(
        'Заголовок',
    )
    url = models.URLField(
        'URL'
    )
    question = models.ForeignKey(
        'Question',
        on_delete=models.SET_NULL,
        related_name='reference_link',
        verbose_name='Вопрос',
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = 'Ссылка на объяснение'
        verbose_name_plural = 'Ссылки на объяснение'

    def __str__(self):
        """Возвращает строковое представление объекта объяснения."""
        return self.title


class Answer(models.Model):
    """Модель ответов на вопросы."""

    name = models.TextField(
        'Ответ',
    )
    is_correct = models.BooleanField(
        'Правильный ответ',
    )
    points = models.IntegerField(
        'Количество баллов за ответ'
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.SET_NULL,
        related_name='answers',
        verbose_name='Вопрос',
        blank=True,
        null=True
    )

    class Meta:
        verbose_name = 'Ответ'
        verbose_name_plural = 'Ответы'

    def __str__(self):
        """Возвращает строковое представление объекта ответа."""
        return self.name


class TestResult(models.Model):
    """Модель результатов тестирования."""

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='test_results',
        verbose_name='Пользователь',
        blank=True,
        null=True
    )
    test = models.ForeignKey(
        Tests,
        on_delete=models.SET_NULL,
        related_name='test_results',
        verbose_name='Тест',
        blank=True,
        null=True
    )
    result = models.BooleanField(
        'Сдал тест',
    )
    mark = models.IntegerField(
        'Оценка',
        validators=[
            MinValueValidator(MIN_LENGTH_PASSING_SCORE),
            MaxValueValidator(MAX_LENGTH_PASSING_SCORE)
        ]
    )
    date = models.DateTimeField(
        'Дата прохождения',
        auto_now_add=True,
    )
    time = models.TimeField(
        'Время прохождения',
        auto_now_add=True,
    )

    class Meta:
        verbose_name = 'Результат тестирования'
        verbose_name_plural = 'Результаты тестирования'
        ordering = ('-date',)

    def __str__(self):
        """Возвращает строковое представление объекта результата тестирования."""
        return f'{self.user} - {self.test} - {self.result}'


class InstructionResult(models.Model):
    """Модель результатов инструктажа."""

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='instruction_results',
        verbose_name='Пользователь',
        blank=True,
        null=True
    )
    instruction = models.ForeignKey(
        Instruction,
        on_delete=models.SET_NULL,
        related_name='instruction_results',
        verbose_name='Инструктаж',
        blank=True,
        null=True
    )
    result = models.BooleanField(
        'Прошёл инструктаж',
    )
    date = models.DateTimeField(
        'Дата прохождения',
        auto_now_add=True,
    )
    time = models.TimeField(
        'Время прохождения',
        auto_now_add=True,
    )

    class Meta:
        verbose_name = 'Результат инструктажа'
        verbose_name_plural = 'Результаты инструктажа'

    def __str__(self):
        """Возвращает строковое представление объекта результата инструктажа."""
        return f'{self.user} - {self.instruction} - {self.result}'


class Media(models.Model):
    """Модель медиафайлов."""

    name = models.CharField(
        'Название',
        max_length=MAX_LENGTH_MEDIA_NAME,
    )
    file = models.FileField(
        'Файл',
        upload_to='media/',
    )

    class Meta:
        verbose_name = 'Медиафайл'
        verbose_name_plural = 'Медиафайлы'

    def __str__(self):
        """Возвращает строковое представление объекта медиафайла."""
        return self.name
