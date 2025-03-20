from django.contrib.auth.models import AbstractUser
from django.db import models
from django_cryptography.fields import encrypt

from api.backend.backend.constants import (
    MAX_LENGTH_EMAIL_ADDRESS,
    MAX_LENGTH_FIRST_NAME,
    MAX_LENGTH_LAST_NAME,
    MAX_LENGTH_MIDDLE_NAME,
    MAX_LENGTH_POSITION,
    MAX_LENGTH_ROLE,
    MAX_LENGTH_INSTRUCTION_TYPE,
    MAX_LENGTH_INSTRUCTION,
    MAX_LENGTH_MEDIA_NAME
)


class User(AbstractUser):
    """Модель пользователя приложения."""

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = (
        'first_name',
        'last_name',
        'middle_name',
        'password',
        'birthday',
        'position',
        'mobile_phone',
        'role',
    )

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Администратор'
        USER = 'user', 'Пользователь'
        MANAGEMENT = 'management', 'Управление'

    first_name = models.CharField(
        'Имя',
        max_length=MAX_LENGTH_FIRST_NAME,
    )
    last_name = models.CharField(
        'Фамилия',
        max_length=MAX_LENGTH_LAST_NAME,
    )
    middle_name = models.CharField(
        'Фамилия',
        max_length=MAX_LENGTH_MIDDLE_NAME,
    )
    birthday = models.DateField(
        'Дата рождения'
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
    mobile_phone = models.IntegerField(
        'Мобильный телефон',
        unique=True,
    )
    role = models.CharField(
        'Роль',
        max_length=MAX_LENGTH_ROLE,
        choices=Role.choices,
        default=Role.USER,
    )

    class Meta:
        ordering = ('last_name', 'email')
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        """Возвращает строковое представление объекта пользователя."""
        return f'{self.last_name} {self.first_name}'


class Publickey(models.Model):
    """Модель публичного ключа пользователя."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='publickey',
        verbose_name='Пользователь',
    )
    public_key = encrypt(models.TextField(
        'Публичный ключ',
    ))
    created_at = models.DateTimeField(
        'Дата создания',
        auto_now_add=True,
    )

    class Meta:
        verbose_name = 'Публичный ключ'
        verbose_name_plural = 'Публичные ключи'


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
        on_delete=models.CASCADE,
        related_name='instructions',
        verbose_name='Тип инструктажа',
    )
    tests = models.OneToOneField(
        'Tests',
        on_delete=models.CASCADE,
        related_name='instruction',
        verbose_name='Тесты',
    )
    npa = models.URLField(
        'Нормативно-правовой акт',
    )

    class Meta:
        verbose_name = 'Инструктаж'
        verbose_name_plural = 'Инструктажи'

    def __str__(self):
        """Возвращает строковое представление объекта инструктажа."""
        return self.name


class Tests(models.Model):
    """Модель тестов инструктажа."""

    name = models.CharField(
        'Название',
        max_length=MAX_LENGTH_INSTRUCTION,
    )
    description = models.TextField(
        'Описание',
    )
    passing_score = models.IntegerField(
        'Проходной балл',
    )

    class Meta:
        verbose_name = 'Тест'
        verbose_name_plural = 'Тесты'

    def __str__(self):
        """Возвращает строковое представление объекта теста."""
        return self.name


class Question(models.Model):
    """Модель вопросов теста."""

    question = models.TextField(
        'Вопрос',
    )
    tests = models.ForeignKey(
        Tests,
        on_delete=models.CASCADE,
        related_name='questions',
        verbose_name='Тест',
    )

    class Meta:
        verbose_name = 'Вопрос'
        verbose_name_plural = 'Вопросы'

    def __str__(self):
        """Возвращает строковое представление объекта вопроса."""
        return self.question


class Answer(models.Model):
    """Модель ответов на вопросы."""

    answer = models.TextField(
        'Ответ',
    )
    is_correct = models.BooleanField(
        'Правильный ответ',
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name='answers',
        verbose_name='Вопрос',
    )

    class Meta:
        verbose_name = 'Ответ'
        verbose_name_plural = 'Ответы'

    def __str__(self):
        """Возвращает строковое представление объекта ответа."""
        return self.answer


class TestResult(models.Model):
    """Модель результатов тестирования."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='test_results',
        verbose_name='Пользователь',
    )
    test = models.ForeignKey(
        Tests,
        on_delete=models.CASCADE,
        related_name='test_results',
        verbose_name='Тест',
    )
    result = models.BooleanField(
        'Сдал тест',
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

    def __str__(self):
        """Возвращает строковое представление объекта результата тестирования."""
        return f'{self.user} - {self.test} - {self.result}'


class InstructionResult(models.Model):
    """Модель результатов инструктажа."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='instruction_results',
        verbose_name='Пользователь',
    )
    instruction = models.ForeignKey(
        Instruction,
        on_delete=models.CASCADE,
        related_name='instruction_results',
        verbose_name='Инструктаж',
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
