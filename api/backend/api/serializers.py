import random

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
    Video,
    UserAnswer,
    NormativeLegislation,
    InstructionAgreementResult,
    Notification,
    Badge,
    Rank
)
from api.utils.utils import is_face_already_registered
from api.utils.validators import normalize_phone_number



class AdminUserSerializer(serializers.ModelSerializer):
    """Базовый сериализатор для операций с моделью User."""

    class Meta:
        model = User
        exclude = ('password',)


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для данных пользователя (профиль)."""

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "middle_name",
            "mobile_phone",
            "birthday",
            "position",
            "role",
            "experience_points",
            "current_rank",
        )
        extra_kwargs = {
            "email": {"read_only": True},
            "role": {"read_only": True},
            "experience_points": {"read_only": True},
            "current_rank": {"read_only": True},
            "position": {"read_only": True},
            "mobile_phone": {"required": False},
            "first_name": {"required": False},
            "last_name": {"required": False},
            "middle_name": {"required": False},
            "birthday": {"required": False},
        }


class BadgeSerializer(serializers.ModelSerializer):
    """Сериализатор для значков пользователя."""

    class Meta:
        model = Badge
        fields = ("id", "name", "description", "required_count", "icon")


class UserProfileSerializer(serializers.ModelSerializer):
    """Сериализатор для расширенного профиля пользователя."""

    current_rank = serializers.StringRelatedField()
    badges = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + (
            "badges",
        )
        extra_kwargs = {**UserSerializer.Meta.extra_kwargs}

    def get_badges(self, obj):
        """Получаем список значков пользователя через промежуточную модель."""
        return BadgeSerializer(
            Badge.objects.filter(userbadge__user=obj),
            many=True,
            context=self.context
        ).data


class SignUpSerializer(serializers.Serializer):
    """Сериализатор для регистрации нового пользователя."""

    email = serializers.EmailField(
        max_length=MAX_LENGTH_EMAIL_ADDRESS, required=True
    )
    password = serializers.CharField(
        max_length=MAX_LENGTH_PASSWORD,
        required=True,
        write_only=True,
        style={'input_type': 'password'},
    )
    first_name = serializers.CharField(
        max_length=MAX_LENGTH_FIRST_NAME, required=True
    )
    last_name = serializers.CharField(
        max_length=MAX_LENGTH_LAST_NAME, required=True
    )
    mobile_phone = serializers.CharField(
        max_length=MAX_LENGTH_PHONE, required=True
    )
    face_descriptor = serializers.ListField(
        child=serializers.FloatField(), max_length=MAX_LENGTH_FACE_DESCRIPTOR
    )

    def validate(self, data):
        errors = {}

        if User.objects.filter(email=data['email']).exists():
            errors['email'] = 'Пользователь с таким email уже существует'

        if User.objects.filter(mobile_phone=data['mobile_phone']).exists():
            errors['mobile_phone'] = (
                'Пользователь с таким номером телефона уже существует'
            )

        try:
            input_descriptor = np.array(
                data['face_descriptor'], dtype=np.float32
            )
            if is_face_already_registered(input_descriptor):
                errors['face_descriptor'] = (
                    'Пользователь с таким лицом уже существует'
                )
        except Exception as e:
            errors['face_descriptor'] = str(e)

        if errors:
            raise serializers.ValidationError(errors)

        return data

    def validate_face_descriptor(self, value):
        try:
            input_descriptor = np.array(value, dtype=np.float32)
        except:
            raise serializers.ValidationError(
                'Неправильный формат дескриптора лица'
            )

        if len(input_descriptor) != 128:
            raise serializers.ValidationError(
                'Дескриптор лица должен содержать 128 элементов'
            )

        if is_face_already_registered(input_descriptor):
            raise serializers.ValidationError(
                'Пользователь с таким дескриптором лица уже существует'
            )

        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'Пользователь с таким email уже существует'
            )
        return value

    def validate_mobile_phone(self, value):
        normalized_phone = normalize_phone_number(value)

        if not normalized_phone:
            raise serializers.ValidationError(
                'Номер телефона должен быть в формате +79999999999, 89999999999 или 79999999999'
            )

        # Проверяем уникальность
        if User.objects.filter(mobile_phone=normalized_phone).exists():
            raise serializers.ValidationError(
                'Пользователь с таким номером телефона уже существует'
            )

        return normalized_phone

    def create(self, validated_data):
        face_descriptor = validated_data.pop("face_descriptor")
        try:
            if not isinstance(face_descriptor, np.ndarray):
                face_descriptor = np.array(face_descriptor, dtype=np.float32)

            validated_data["face_descriptor"] = str(face_descriptor.tolist())
        except Exception as e:
            raise serializers.ValidationError(
                {"face_descriptor": f"Ошибка обработки дескриптора: {str(e)}"}
            )

        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Сериализатор для получения токена аутентификации пользователя."""

    email = serializers.EmailField(
        max_length=MAX_LENGTH_EMAIL_ADDRESS, required=True
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

    instruction_agreement = serializers.SerializerMethodField()  # Изменяем на метод
    type_of_instruction = TypeOfInstructionSerializer(read_only=True)

    class Meta:
        model = Instruction
        fields = (
            "id",
            "type_of_instruction",
            "name",
            "text",
            "instruction_agreement",
        )

    def get_instruction_agreement(self, obj):
        """Возвращает соглашения в случайном порядке."""
        agreements = list(obj.instruction_agreement.all())
        random.shuffle(agreements)
        return InstructionAgreementSerializer(agreements, many=True).data


class InstructionListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка Instruction."""

    class Meta:
        model = Instruction
        fields = ('id', 'name', 'type_of_instruction')


class InstructionResultSerializer(serializers.ModelSerializer):
    """Сериализатор для результатов инструктажа с проверкой ключей согласий."""

    instruction_agreement = serializers.ListField(
        child=serializers.DictField(child=serializers.BooleanField()),
        required=True,
    )
    face_descriptor = serializers.ListField(
        child=serializers.FloatField(), write_only=True, required=True
    )

    class Meta:
        model = InstructionResult
        fields = [
            'instruction_id',
            'instruction_agreement',
            'face_descriptor',
            'result',
        ]
        extra_kwargs = {
            'instruction_id': {'source': 'instruction', 'required': True},
            'result': {'read_only': True},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.valid_agreement_keys = set(
            InstructionAgreement.objects.values_list('name', flat=True)
        )

    def validate_instruction_agreement(self, value):
        """Проверяем, что все ключи согласий существуют в InstructionAgreement."""
        for agreement_dict in value:
            agreement_key = list(agreement_dict.keys())[0]
            if agreement_key not in self.valid_agreement_keys:
                raise serializers.ValidationError(
                    f"Неизвестный тип согласия: '{agreement_key}'. "
                    f"Допустимые значения: {', '.join(sorted(self.valid_agreement_keys))}"
                )
        return value

    def validate_face_descriptor(self, value):
        """Проверяем, что лицо соответствует зарегистрированному пользователю."""
        try:
            input_descriptor = np.array(value, dtype=np.float32)
            if len(input_descriptor) != MAX_LENGTH_FACE_DESCRIPTOR:
                raise serializers.ValidationError(
                    'Дескриптор лица должен содержать 128 элементов'
                )

            if not is_face_already_registered(input_descriptor):
                raise serializers.ValidationError(
                    'Лицо не распознано. Пройдите аутентификацию.'
                )

            return input_descriptor
        except Exception as e:
            raise serializers.ValidationError(
                f'Ошибка обработки дескриптора лица: {str(e)}'
            )

    def validate(self, data):
        """Проверяем, что хотя бы одно согласие получено."""
        agreements = data.get('instruction_agreement', [])

        if not any(list(agreement.values())[0] for agreement in agreements):
            raise serializers.ValidationError(
                'Необходимо подтвердить хотя бы одно согласие'
            )
        return data

    def create(self, validated_data):
        """Создаем запись о результате инструктажа с сохранением согласий."""
        request = self.context.get('request')
        agreements_data = validated_data.pop('instruction_agreement')
        face_descriptor = validated_data.pop('face_descriptor')

        is_passed = any(
            list(agreement.values())[0] for agreement in agreements_data
        )

        instruction_result = InstructionResult.objects.create(
            user=request.user,
            instruction=validated_data['instruction'],
            result=is_passed,
        )

        agreement_instances = []
        for agreement_data in agreements_data:
            for agreement_type, agreed in agreement_data.items():
                agreement_instances.append(
                    InstructionAgreementResult(
                        instruction_result=instruction_result,
                        agreement_type=agreement_type,
                        agreed=agreed,
                    )
                )

        InstructionAgreementResult.objects.bulk_create(agreement_instances)

        return instruction_result


class AnswerSerializer(serializers.ModelSerializer):
    """Сериализатор для ответов."""

    class Meta:
        model = Answer
        fields = ('id', 'name', 'is_correct')


class ReferenceLinkSerializer(serializers.ModelSerializer):
    """Сериализатор для модели ReferenceLink."""

    class Meta:
        model = ReferenceLink
        fields = ('id', 'title', 'source')


class QuestionSerializer(serializers.ModelSerializer):
    """Сериализатор для вопросов с ответами."""

    answers = AnswerSerializer(many=True, read_only=True)
    reference_link = ReferenceLinkSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = (
            'id',
            'name',
            'question_type',
            'points',
            'answers',
            'explanation',
            'reference_link',
            'image',
        )

    def to_representation(self, instance):
        """Переопределяем представление для исключения
        explanation при необходимости."""
        data = super().to_representation(instance)
        if self.context.get('test_is_control', False):
            data.pop('explanation', None)
        return data


class UserAnswerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='question.id')
    selected_id = serializers.IntegerField(source='selected_answer.id')

    class Meta:
        model = UserAnswer
        fields = ('id', 'selected_id', 'is_correct')


class TestResultSerializer(serializers.ModelSerializer):
    """Сериализатор для результатов теста."""

    class Meta:
        model = TestResult
        fields = (
            'id',
            'is_passed',
            'mark',
            'score',
            'total_points',
            'start_time',
            'completion_time',
            'test_duration',
        )


class TestResultCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания результатов теста."""

    user_answers = UserAnswerSerializer(many=True, required=False)

    class Meta:
        model = TestResult
        fields = (
            'test',
            'mark',
            'is_passed',
            'start_time',
            'completion_time',
            'test_duration',
            'score',
            'total_points',
            'user_answers',
        )
        extra_kwargs = {
            'test': {'required': True},
            'mark': {'required': True},
        }

    def create(self, validated_data):
        user_answers_data = validated_data.pop("user_answers", [])
        test_result = TestResult.objects.create(**validated_data)

        for answer_data in user_answers_data:
            UserAnswer.objects.create(
                test_result=test_result,
                question_id=answer_data['question']['id'],
                selected_answer_id=answer_data['selected_answer']['id'],
                is_correct=answer_data['is_correct'],
                points_earned=answer_data.get('points_earned', 0),
            )

        return test_result


class BaseTestSerializer(serializers.ModelSerializer):
    """Базовый сериализатор для тестов с общими полями"""

    test_results = serializers.SerializerMethodField()

    def get_test_results(self, obj):
        """Общий метод для получения результатов теста"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TestResultSerializer(
                obj.test_results.filter(user=request.user),
                many=True,
                context=self.context,
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
            'test_results',
        )


class TestSerializer(BaseTestSerializer):
    """Сериализатор для детального просмотра теста"""

    questions = serializers.SerializerMethodField()
    total_points = serializers.SerializerMethodField()

    class Meta:
        model = Tests
        fields = (
            'id',
            'name',
            'description',
            'test_is_control',
            'passing_score',
            'total_points',
            'test_results',
            'questions',
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
            questions, many=True, context=question_context
        ).data

    def get_total_points(self, obj):
        """Вычисляем сумму баллов выбранных вопросов"""
        questions = self.get_questions(obj)
        return sum(q['points'] for q in questions)


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ('id', 'type', 'url', 'title', 'file', 'date')


class NormativeLegislationSerializer(serializers.ModelSerializer):
    """Сериализатор для нормативно-правовых актов (только чтение)."""

    class Meta:
        model = NormativeLegislation
        fields = ('id', 'title', 'description', 'url', 'file', 'date')
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    test_result = serializers.HyperlinkedRelatedField(
        view_name="testresult-detail", read_only=True
    )
    instruction_result = serializers.HyperlinkedRelatedField(
        view_name="instructionresult-detail", read_only=True
    )

    class Meta:
        model = Notification
        fields = (
            "id",
            "notification_type",
            "created_at",
            "is_read",
            "test_result",
            "instruction_result",
            "employee",
        )
        read_only_fields = ("created_at",)
