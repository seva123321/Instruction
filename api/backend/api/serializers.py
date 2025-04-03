from django.conf import settings
import numpy as np
from rest_framework import serializers

from backend.constants import (
    MAX_LENGTH_FACE_DESCRIPTOR,
    MAX_LENGTH_EMAIL_ADDRESS,
    MAX_LENGTH_FIRST_NAME,
    MAX_LENGTH_LAST_NAME,
    MAX_LENGTH_PHONE,
    MAX_LENGTH_PASSWORD,
    MAX_LENGTH_PASSING_SCORE,
    MIN_LENGTH_PASSING_SCORE
)
from api.models import (
    User,
    Instruction,
    InstructionAgreement,
    InstructionResult,
    TypeOfInstruction,
    Tests,
    Question,
    Answer,
    ReferenceLink,
    TestResult,
    Video
)
from api.utils import is_face_already_registered


class AdminUserSerializer(serializers.ModelSerializer):
    """Базовый сериализатор для операций с моделью User."""

    class Meta:
        model = User
        exclude = ('password',)


class UserSerializer(AdminUserSerializer):
    """Сериализатор для базовых операций с моделью User."""

    class Meta:
        read_only_fields = (
            'role'
        )


class SignUpSerializer(serializers.Serializer):
    """Сериализатор для регистрации нового пользователя."""

    email = serializers.EmailField(
        max_length=MAX_LENGTH_EMAIL_ADDRESS,
        required=True
    )
    password = serializers.CharField(
        max_length=MAX_LENGTH_PASSWORD,
        required=True,
        write_only=True,
        style={'input_type': 'password'},
    )
    first_name = serializers.CharField(
        max_length=MAX_LENGTH_FIRST_NAME,
        required=True
    )
    last_name = serializers.CharField(
        max_length=MAX_LENGTH_LAST_NAME,
        required=True
    )
    mobile_phone = serializers.CharField(
        max_length=MAX_LENGTH_PHONE,
    )
    face_descriptor = serializers.ListField(
        child=serializers.FloatField(),
        max_length=MAX_LENGTH_FACE_DESCRIPTOR
    )


    def validate_face_descriptor(self, value):
        try:
            input_descriptor = np.array(value, dtype=np.float32)
        except:
            raise serializers.ValidationError(
                'Invalid face descriptor format'
            )

        if len(input_descriptor) != 128:
            raise serializers.ValidationError(
                'Face descriptor must have 128 elements'
            )

        if is_face_already_registered(input_descriptor):
            raise serializers.ValidationError(
                'User with similar face already exists'
            )

        return value


class LoginSerializer(serializers.Serializer):
    """Сериализатор для получения токена аутентификации пользователя."""

    email = serializers.EmailField(
        max_length=MAX_LENGTH_EMAIL_ADDRESS,
        required=True
    )
    password = serializers.CharField(
        max_length=MAX_LENGTH_PASSWORD,
        required=True,
        write_only=True,
        style={'input_type': 'password'},
    )


class TypeOfInstructionSerializer(serializers.ModelSerializer):
    """Сериализатор для модели TypeOfInstruction."""

    class Meta:
        model = TypeOfInstruction
        fields = ('id', 'name')


class InstructionAgreementSerializer(serializers.ModelSerializer):
    """Сериализатор для модели InstructionAgreement."""

    class Meta:
        model = InstructionAgreement
        exclude = ('id',)


class InstructionSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Instruction."""
    instruction_agreement = InstructionAgreementSerializer(
        many=True,
        read_only=True
    )
    type_of_instruction = TypeOfInstructionSerializer(
        read_only=True
    )

    class Meta:
        model = Instruction
        fields = (
            'id',
            'type_of_instruction',
            'name',
            'text',
            'instruction_agreement'
        )


class InstructionListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка Instruction."""

    class Meta:
        model = Instruction
        fields = ('id', 'name', 'type_of_instruction')


class InstructionResultSerializer(serializers.ModelSerializer):
    """Сериализатор для модели InstructionResult."""

    class Meta:
        model = InstructionResult
        fields = '__all__'


class AnswerSerializer(serializers.ModelSerializer):
    """Сериализатор для ответов."""

    class Meta:
        model = Answer
        fields = ('id', 'name', 'is_correct')


class ReferenceLinkSerializer(serializers.ModelSerializer):
    """Сериализатор для модели ReferenceLink."""

    class Meta:
        model = ReferenceLink
        fields = ('id', 'title', 'url')


class QuestionSerializer(serializers.ModelSerializer):
    """Сериализатор для вопросов с ответами."""

    answers = AnswerSerializer(many=True, read_only=True)
    reference_link = ReferenceLinkSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = (
            'id',
            'name',
            'answers',
            'explanation',
            'reference_link',
            'image'
        )

    def to_representation(self, instance):
        """Переопределяем представление для исключения
        explanation при необходимости."""
        data = super().to_representation(instance)
        if self.context.get('test_is_control', False):
            data.pop('explanation', None)
        return data



class TestResultSerializer(serializers.ModelSerializer):
    """Сериализатор для TestResultSerializer."""

    class Meta:
        model = TestResult
        fields = ('id', 'result', 'mark', 'date', 'time')


class BaseTestSerializer(serializers.ModelSerializer):
    """Базовый сериализатор для тестов с общими полями"""
    test_results = serializers.SerializerMethodField()

    def get_test_results(self, obj):
        """Общий метод для получения результатов теста"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TestResultSerializer(
                obj.test_results.filter(user=request.user),
                many=True
            ).data
        return []


class TestListSerializer(BaseTestSerializer):
    """Сериализатор для списка тестов"""

    class Meta:
        model = Tests
        fields = (
            'id',
            'name',
            'description',
            'test_is_control',
            'test_results'
        )


class TestSerializer(BaseTestSerializer):
    """Сериализатор для детального просмотра теста"""
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Tests
        fields = (
            'id',
            'name',
            'description',
            'test_is_control',
            'passing_score',
            'test_results',
            'questions'
        )

    def get_questions(self, obj):
        """Метод для получения вопросов теста"""
        questions = obj.questions.all()

        limit = getattr(settings, 'TEST_QUESTIONS_LIMIT')
        if limit:
            questions = questions.order_by('?')[:limit]

        question_context = self.context.copy()
        question_context['test_is_control'] = obj.test_is_control

        return QuestionSerializer(
            questions,
            many=True,
            context=question_context
        ).data


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ('id', 'type', 'url', 'title', 'date')
