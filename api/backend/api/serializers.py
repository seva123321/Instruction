from rest_framework import serializers

from api.models import (
    User,
    Instruction,
    InstructionAgreement,
    InstructionResult,
    TypeOfInstruction,
    Tests,
    Question,
    Answer
)


class AdminUserSerializer(serializers.ModelSerializer):
    """Базовый сериализатор для операций с моделью User."""

    class Meta:
        model = User
        fields = ('__all__',)


class UserSerializer(AdminUserSerializer):
    """Сериализатор для базовых операций с моделью User."""

    class Meta:
        read_only_fields = (
            'role'
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
        exclude = ('id', 'date')


class InstructionSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Instruction."""
    instruction_agreement = InstructionAgreementSerializer(read_only=True)
    type_of_instruction = TypeOfInstructionSerializer(read_only=True)

    class Meta:
        model = Instruction
        fields = (
            'id',
            'type_of_instruction',
            'name',
            'text',
            'instruction_agreement'
        )


class InstructionResultSerializer(serializers.ModelSerializer):
    """Сериализатор для модели InstructionResult."""

    class Meta:
        model = InstructionResult
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Answer."""

    class Meta:
        model = Question
        fields = '__all__'


class TestSerializer(serializers.ModelSerializer):
    """Сериализатор для модели InstructionResult."""

    class Meta:
        model = Tests
        fields = (
            'id',
            'name',
            'description',
            'passing_score',
        )
