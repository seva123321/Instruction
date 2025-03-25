from rest_framework import serializers

from backend.constants import (
    MAX_LENGTH_FACE_DESCRIPTOR,
    MAX_LENGTH_EMAIL_ADDRESS,
    MAX_LENGTH_FIRST_NAME,
    MAX_LENGTH_LAST_NAME,
    MAX_LENGTH_PHONE
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
    ReferenceLink
)


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
    reference_link = ReferenceLinkSerializer(read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'name', 'answers', 'reference_link')


class TestListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка Test."""

    class Meta:
        model = Tests
        fields = ('id', 'name', 'description')


class TestSerializer(serializers.ModelSerializer):
    """Сериализатор для конкретного Test."""

    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Tests
        fields = (
            'id',
            'name',
            'description',
            'passing_score',
            'questions'
        )
