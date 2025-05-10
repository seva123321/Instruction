import base64
import json
import os

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.cache import cache
from django.db import IntegrityError, models
from django.db.models import Prefetch
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from dotenv import load_dotenv
import numpy as np
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from api.models import (
    User,
    Instruction,
    Tests,
    TestResult,
    Video,
    NormativeLegislation,
    InstructionResult,
    GameSwiper
)
from api.serializers import (
    AdminUserSerializer,
    InstructionSerializer,
    InstructionListSerializer,
    UserProfileSerializer,
    TestSerializer,
    TestListSerializer,
    SignUpSerializer,
    TestResultSerializer,
    VideoSerializer,
    TestResultCreateSerializer,
    NormativeLegislationSerializer,
    InstructionResultSerializer,
    InstructionResultGetSerializer,
    RatingSerializer,
    GameSwiperSerializer,
    GameSwiperResultSerializer
)
from api.permissions import IsAdminPermission
from api.utils.utils import decrypt_descriptor
from backend.constants import (
    GAME_HOUR,
    GAME_MINUTE,
    LIMIT_GAME_SWIPER_QUESTIONS,
    ME,
    POWER_OF_USER
)


load_dotenv()

AES_STORAGE_KEY = os.getenv("AES_STORAGE_KEY")
AES_STORAGE_KEY = AES_STORAGE_KEY.encode()


@extend_schema(
    tags=["User"],
    description="Получение, создание, изменение и удаление пользователей.",
)
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для операций с пользователями."""

    serializer_class = AdminUserSerializer
    permission_classes = (IsAdminPermission,)

    def get_queryset(self):
        """Оптимизация запросов к БД."""
        if self.action == "profile":
            return (
                User.objects.prefetch_related("badges__badge")
                .select_related("current_rank")
                .prefetch_related("groups", "user_permissions__content_type")
            )
        return User.objects.prefetch_related("groups", "user_permissions__content_type")

    def get_serializer_class(self):
        """Определяем сериализатор в зависимости от действия."""
        if self.action == "profile":
            return UserProfileSerializer
        return super().get_serializer_class()

    @action(
        detail=False,
        methods=["GET", "PATCH"],
        url_path=ME,
        url_name=ME,
        permission_classes=(IsAuthenticated,),
    )
    def profile(self, request):
        """Представление профиля текущего пользователя."""
        user = request.user

        user = (
            User.objects.select_related("current_rank")
            .prefetch_related("badges__badge")
            .get(id=user.id)
        )

        if request.method == "GET":
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == "PATCH":
            serializer = self.get_serializer(
                user,
                data=request.data,
                partial=True,
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)

            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            except IntegrityError as e:
                return Response(
                    {"error": f"Ошибка сохранения данных. {e}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )


@extend_schema(tags=["Rating"], description="Рейтинг пользователей.")
class RatingViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения рейтинга пользователей."""

    serializer_class = RatingSerializer
    permission_classes = (IsAuthenticated,)
    http_method_names = ("get",)

    def get_queryset(self):
        """Оптимизация запросов к БД."""
        return (
            User.objects
            .prefetch_related("badges__badge")
            .select_related("current_rank", "position")
            .order_by("-experience_points")
        )


@extend_schema(tags=["SignUp"], description="Регистрация пользователей.")
class SignUpView(APIView):
    """Представление для регистрации новых пользователей."""

    permission_classes = (AllowAny,)

    def post(self, request):
        """Создает нового пользователя."""
        serializer = SignUpSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        try:
            user = serializer.save()
            login(request, user)
        except IntegrityError as e:
            error_messages = {
                "api_user_email": {
                    "email": "Пользователь с таким email уже существует"
                },
                "api_user_mobile_phone": {
                    "mobile_phone": "Пользователь с таким номером телефона уже существует"
                },
                "api_user_face_descriptor": {
                    "face_descriptor": "Такой дескриптор лица уже существует"
                },
            }

            for db_error, message in error_messages.items():
                if db_error in str(e):
                    raise ValidationError(message)

            raise ValidationError(
                {"detail": "Ошибка при создании пользователя"}
            )
        except Exception as e:
            raise ValidationError({"detail": str(e)})

        return Response(
            {"id": user.id, "email": user.email},
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Login"], description="Аутентификация.")
class LoginView(APIView):
    """Представление для входа через сессии"""

    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {
                    "detail": "Требуется email и пароль",
                    "errors": {
                        "email": "Обязательное поле" if not email else None,
                        "password": (
                            "Обязательное поле" if not password else None
                        ),
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = authenticate(request, username=email, password=password)

            if user is None:
                try:
                    User.objects.get(email=email)
                    error_msg = "Неверный пароль"
                    error_field = "password"
                except User.DoesNotExist:
                    error_msg = "Пользователь с таким email не найден"
                    error_field = "email"

                return Response(
                    {
                        "detail": "Ошибка аутентификации",
                        "errors": {error_field: error_msg},
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            if user.is_staff:
                return Response(
                    {
                        "detail": "Администраторы могут входить только через /admin/login/",
                        "errors": {"admin": "/admin/login/"},
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            login(request, user)

            return Response(
                {
                    "detail": "Успешный вход",
                    "user_id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"detail": "Произошла ошибка при входе", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

@extend_schema(tags=["GenerateAESKey"], description="Получение ключа для шифрования дескриптора.")
class GenerateAESKeyView(APIView):
    """Ручка для генерации временного AES-ключа."""
    permission_classes = (AllowAny,)

    def get(self, request):
        raw_key = os.urandom(32)
        key_id = os.urandom(16).hex()

        cache.set(key_id, raw_key, timeout=300)

        encoded_key = base64.b64encode(raw_key).decode('utf-8')
        return Response({"key_id": key_id, "key": encoded_key})


@extend_schema(tags=["LoginFace"], description="Аутентификация по лицу.")
class FaceLoginView(APIView):
    """Аутентификация по лицу"""

    permission_classes = (AllowAny,)

    def post(self, request):
        encrypted_data = request.data.get("face_descriptor")
        if not encrypted_data or not all(
            k in encrypted_data for k in ["iv", "ciphertext", "tag"]
        ):
            return Response(
                {"error": "Неправильный формат зашифрованного дескриптора"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            encoded_key = cache.get(request.data.get("key_id"))
            if not encoded_key:
                return Response(
                    {"error": "Ключ истёк или не существует"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            decrypted_descriptor = decrypt_descriptor(encrypted_data, encoded_key)
            input_descriptor = np.array(decrypted_descriptor, dtype=np.float32)

            if len(input_descriptor) != 128:
                return Response(
                    {"error": "Дескриптор лица должен содержать 128 элементов"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return Response(
                {"error": f"Ошибка дешифрования дескриптора: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Ищем ближайшего пользователя
        best_match = None
        min_distance = float("inf")

        for user in User.objects.exclude(face_descriptor__isnull=True):
            try:
                # Дешифруем дескриптор из БД
                stored_encrypted = json.loads(user.face_descriptor)
                stored_descriptor = np.array(
                    decrypt_descriptor(stored_encrypted, AES_STORAGE_KEY),
                    dtype=np.float32,
                )

                if stored_descriptor.shape != (128,):
                    continue

                distance = np.linalg.norm(input_descriptor - stored_descriptor)

                if distance < min_distance and distance < settings.FACE_MATCH_THRESHOLD:
                    min_distance = distance
                    best_match = user

            except Exception as e:
                print(
                    f"Error processing user {user.id} face descriptor: {str(e)}"
                )
                continue

        # 4. Проверяем результат
        if best_match:
            if best_match.is_staff:
                return Response(
                    {
                        "detail": "Администраторы могут входить только через /admin/login/",
                        "errors": {"admin": "/admin/login/"},
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            login(request, best_match)
            return Response(
                {
                    "detail": "Успешный вход",
                    "user_id": best_match.id,
                    "email": best_match.email,
                    "first_name": best_match.first_name,
                }
            )

        return Response(
            {"error": "Лицо не распознано или пользователь не существует"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

@extend_schema(tags=["Logout"], description="Выход из сестемы.")
class LogoutView(APIView):
    """Представление для выхода из системы"""

    permission_classes = (AllowAny,)

    def post(self, request):
        logout(request)
        return Response(
            {"detail": "Успешный выход"}, status=status.HTTP_200_OK
        )


@extend_schema(tags=["Instruction"], description="Получение интруктажей.")
class InstructionViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения инструктажа."""

    queryset = Instruction.objects.all()
    serializer_class = InstructionSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        first_instruction = Instruction.objects.first()
        if first_instruction:
            response.data["first_instruction"] = InstructionSerializer(
                first_instruction, context=self.get_serializer_context()
            ).data

        return response

    def get_serializer_class(self):
        """Определяет сериализатор в зависимости от действия."""
        if self.action == "list":
            return InstructionListSerializer
        return InstructionSerializer

    def get_queryset(self):
        user_position = self.request.user.position
        return Instruction.objects.filter(
            models.Q(position=user_position) | models.Q(position__isnull=True)
        )


@extend_schema(tags=["Tests"], description="Получение тестов.")
class TestViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения тестов."""

    serializer_class = TestSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        """Определяет сериализатор в зависимости от действия."""
        if self.action == "list":
            return TestListSerializer
        return TestSerializer

    def get_queryset(self):
        user = self.request.user
        test_results_prefetch = Prefetch(
            "test_results",
            queryset=TestResult.objects.all(),
            to_attr="all_test_results",
        )
        return (Tests.objects.filter(
            models.Q(position=user.position) | models.Q(position__isnull=True)
        ).select_related(
        "position"
        ).prefetch_related(
            "questions",
            "questions__answers",
            "questions__reference_link",
            test_results_prefetch,
        ))


@extend_schema(
    tags=["TestResult"],
    description="Сохранение результатов тестов пользователя.",
)
class TestResultCreateView(APIView):
    """API для сохранения результатов тестирования."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = TestResultCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.validated_data["user"] = request.user
        test_result = serializer.save()

        return Response(
            TestResultSerializer(
                test_result, context={"request": request}
            ).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["NLAs"], description="Получение НПА.")
class NormativeLegislationViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения видео."""

    queryset = NormativeLegislation.objects.all()
    serializer_class = NormativeLegislationSerializer
    permission_classes = (IsAuthenticated,)
    ordering = ("-date",)
    ordering_fields = ("date", "title")


@extend_schema(tags=["Video"], description="Получение видео.")
class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения видео."""

    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = (IsAuthenticated,)
    ordering = ("-date",)


@extend_schema(
    tags=["InstructionResult"],
    description="Сохранение результатов прохождения инструктажа пользователя.",
)
class InstructionResultView(APIView):
    """API для сохранения результатов прохождения инструктажа."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Получение результатов инструктажа для текущего пользователя."""
        instruction_results = InstructionResult.objects.select_related(
            "instruction",
        ).filter(
            user=request.user
        ).order_by("-date")

        serializer = InstructionResultGetSerializer(
            instruction_results, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = InstructionResultSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        try:
            instruction_result = serializer.save()
            return Response(
                {
                    "status": "success",
                    "instruction_result_id": instruction_result.id,
                    "is_passed": instruction_result.result,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(tags=["Swiper"], description="Получение данных для свайпера.")
class GameSwiperView(APIView):
    """API для получения данных для свайпера."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Получение данных для свайпера."""
        swipers = GameSwiper.objects.filter(
            models.Q(position=self.request.user.position) | models.Q(position__isnull=True)
        ).order_by('?')[:LIMIT_GAME_SWIPER_QUESTIONS]
        serializer = GameSwiperSerializer(
            swipers,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)


@extend_schema(tags=["SwiperResult"], description="Сохранение результатов свайпера.")
class GameSwiperResultView(APIView):
    """API для сохранения результатов свайпера."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = GameSwiperResultSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.validated_data["date"] = timezone.now()
        serializer.validated_data["user"] = request.user
        swiper_result = serializer.save()

        return Response(
            {
                "user": swiper_result.user.id,
                "score": swiper_result.score,
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["PowerOfUser"], description="Получение данных об энергии.")
class PowerOfUserView(APIView):
    """API для получения данных об энергии пользователя."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Получение данных об энергии пользователя."""
        power_of_user = request.user.power_of_user

        if not power_of_user:
            return Response(
                {"error": "Данные об энергии не найдены."},
                status=status.HTTP_404_NOT_FOUND,
            )

        data = {
            "remaining_mega_powers": power_of_user.power,
            "total_daily_mega_powers": POWER_OF_USER,
            "hours": GAME_HOUR,
            "minutes": GAME_MINUTE,
        }
        return Response(data, status=status.HTTP_200_OK)


data_quiz = {
      'question':
        'Задайте правильную последовательность использования порошкового огнетушителя',
      'answer': [
        'stamp_fire-extinguisher',
        'safety_pin_fire-extinguisher',
        'hose_fire-extinguisher',
        'handle_bottom_fire-extinguisher',
      ],
      'warning':
        'Подачу огнетушащего материала необходимо производить порционно. Длительность подачи должна составлять примерно 2 секунды с небольшим перерывом.',
      'model_path': '/models/fire_extinguisher_powder.glb',
      'part_tooltips': {
        'safety_pin': 'Предохранительная чека',
        'stamp': 'Пломба',
        'hose': 'Шланг',
        'handle_bottom': 'Ручка активации',
      },
      'animation_sequence': [
        'safety_pin_fire-extinguisher',
        'stamp_fire-extinguisher',
        'hose_fire-extinguisher',
        'handle_bottom_fire-extinguisher',
      ],
    }

@extend_schema(tags=["FireSafetyQuiz"], description="Получение данных о квизе.")
class FireSafetyQuizView(APIView):
    """Получение данных для викторины."""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        """Получение данных для викторины."""
        level = request.GET.get("level")
        if level == "1":
            return Response(data_quiz, status=status.HTTP_200_OK)
        return Response({"error": "Уровень не поддерживается"})


@extend_schema(tags=["SendGlob"], description="Отправляет модель glb.")
class SendGlobView(APIView):
    """Отправляет модель glb."""

    permission_classes = (IsAuthenticated,)

    def get(self, request, filename):
        """Отправляет модель glb."""
        model_path = os.path.join(settings.STATIC_ROOT, 'models', filename)
        try:
            with open(model_path, 'rb') as file:
                glb_data = file.read()
            return Response(glb_data, content_type='application/octet-stream')
        except FileNotFoundError:
            return Response(
                {"error": "Модель не найдена"},
                status=status.HTTP_404_NOT_FOUND,
            )