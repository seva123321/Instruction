from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError, models
from drf_spectacular.utils import extend_schema
import numpy as np
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from api.models import (
    User,
    Instruction,
    Tests,
    Video,
    NormativeLegislation,
    Notification,
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
    NotificationSerializer,
)
from api.permissions import IsAdminPermission
from backend.constants import ME


@extend_schema(
    tags=['User'],
    description='Получение, создание, изменение и удаление пользователей.',
)
class UserViewSet(ModelViewSet):
    """Представление для операций с пользователями."""

    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = (IsAdminPermission,)
    filter_backends = (SearchFilter,)
    search_fields = ('last_name',)
    http_method_names = ('get', 'post', 'patch', 'delete')

    def get_queryset(self):
        """Оптимизация запросов к БД."""
        queryset = super().get_queryset()
        if self.action == 'profile':
            return queryset.prefetch_related(
                'badges__badge',
                'current_rank'
            )
        return queryset

    def get_serializer_class(self):
        """Определяем сериализатор в зависимости от действия."""
        if self.action == 'profile':
            return UserProfileSerializer  # Меняем на новый сериализатор
        return super().get_serializer_class()

    @action(
        detail=False,
        methods=['GET', 'PATCH'],
        url_path=ME,
        url_name=ME,
        permission_classes=(IsAuthenticated,),
    )
    def profile(self, request):
        """Представление профиля текущего пользователя."""
        user = request.user

        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'PATCH':
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
                    {'error': f'Ошибка сохранения данных. {e}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )


@extend_schema(tags=['SignUp'], description='Регистрация пользователей.')
class SignUpView(APIView):
    """Представление для регистрации новых пользователей."""

    permission_classes = (AllowAny,)

    def post(self, request):
        """Создает нового пользователя."""
        serializer = SignUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Используем serializer.save() вместо прямого создания
            user = serializer.save()
        except IntegrityError as e:
            error_messages = {
                'api_user_email': {
                    'email': 'Пользователь с таким email уже существует'
                },
                'api_user_mobile_phone': {
                    'mobile_phone': 'Пользователь с таким номером телефона уже существует'
                },
                'api_user_face_descriptor': {
                    'face_descriptor': 'Такой дескриптор лица уже существует'
                },
            }

            for db_error, message in error_messages.items():
                if db_error in str(e):
                    raise ValidationError(message)

            raise ValidationError(
                {'detail': 'Ошибка при создании пользователя'}
            )
        except Exception as e:
            raise ValidationError({'detail': str(e)})

        return Response(
            {'id': user.id, 'email': user.email},
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=['Login'], description='Аутентификация.')
class LoginView(APIView):
    """Представление для входа через сессии"""

    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {
                    'detail': 'Требуется email и пароль',
                    'errors': {
                        'email': 'Обязательное поле' if not email else None,
                        'password': (
                            'Обязательное поле' if not password else None
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
                    error_msg = 'Неверный пароль'
                    error_field = 'password'
                except User.DoesNotExist:
                    error_msg = 'Пользователь с таким email не найден'
                    error_field = 'email'

                return Response(
                    {
                        'detail': 'Ошибка аутентификации',
                        'errors': {error_field: error_msg},
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
                    'detail': 'Успешный вход',
                    'user_id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {'detail': 'Произошла ошибка при входе', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@extend_schema(tags=['LoginFace'], description='Аутентификация по лицу.')
class FaceLoginView(APIView):
    """Аутентификация по лицу"""

    permission_classes = (AllowAny,)

    def post(self, request):
        # 1. Получаем дескриптор лица из запроса
        face_descriptor = request.data.get("face_descriptor")
        if not face_descriptor or len(face_descriptor) != 128:
            return Response(
                {
                    'error': 'Неправильный формат дескриптора'
                    ' - должно быть 128 элементов'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 2. Преобразуем в numpy array
        try:
            input_descriptor = np.array(face_descriptor, dtype=np.float32)
        except Exception as e:
            return Response(
                {'error': f'Неправильный формат дескриптора: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 3. Ищем ближайшего пользователя
        best_match = None
        min_distance = float('inf')

        for user in User.objects.exclude(face_descriptor__isnull=True):
            try:
                # Преобразуем дескриптор из БД
                stored_descriptor = np.array(
                    eval(user.face_descriptor), dtype=np.float32
                )

                # Проверяем размерность дескриптора
                if stored_descriptor.shape != (128,):
                    continue  # Пропускаем некорректные записи

                # Вычисляем евклидово расстояние
                distance = np.linalg.norm(input_descriptor - stored_descriptor)

                # Проверяем пороговое значение
                if (
                    distance < min_distance
                    and distance < settings.FACE_MATCH_THRESHOLD
                ):
                    min_distance = distance
                    best_match = user

            except Exception as e:
                print(
                    f'Error processing user {user.id} face descriptor: {str(e)}'
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
                    'detail': 'Успешный вход',
                    'user_id': best_match.id,
                    'email': best_match.email,
                    'first_name': best_match.first_name,
                }
            )

        return Response(
            {'error': 'Лицо не распознано или пользователь не существует'},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class LogoutView(APIView):
    """Представление для выхода из системы"""

    permission_classes = (AllowAny,)

    def post(self, request):
        logout(request)
        return Response(
            {'detail': 'Успешный выход'}, status=status.HTTP_200_OK
        )


@extend_schema(tags=['Instruction'], description='Получение интруктажей.')
class InstructionViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения инструктажа."""

    queryset = Instruction.objects.all()
    serializer_class = InstructionSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        first_instruction = Instruction.objects.first()
        if first_instruction:
            response.data['first_instruction'] = InstructionSerializer(
                first_instruction, context=self.get_serializer_context()
            ).data

        return response

    def get_serializer_class(self):
        """Определяет сериализатор в зависимости от действия."""
        if self.action == 'list':
            return InstructionListSerializer
        return InstructionSerializer

    def get_queryset(self):
        user_position = self.request.user.position
        return Instruction.objects.filter(
            models.Q(position=user_position) | models.Q(position__isnull=True)
        )


@extend_schema(tags=['Tests'], description='Получение тестов.')
class TestViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения тестов."""

    queryset = Tests.objects.prefetch_related(
        'questions', 'questions__answers', 'questions__reference_link'
    ).all()
    serializer_class = TestSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        """Определяет сериализатор в зависимости от действия."""
        if self.action == 'list':
            return TestListSerializer
        return TestSerializer

    def get_queryset(self):
        user_position = self.request.user.position
        return Tests.objects.filter(
            models.Q(position=user_position) | models.Q(position__isnull=True)
        ).prefetch_related(
            'questions',
            'questions__answers',
            'questions__reference_link'
        )

@extend_schema(
    tags=['TestResult'],
    description='Сохранение результатов тестов пользователя.',
)
class TestResultCreateView(APIView):
    """API для сохранения результатов тестирования."""

    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = TestResultCreateSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.validated_data['user'] = request.user
        test_result = serializer.save()

        return Response(
            TestResultSerializer(
                test_result, context={'request': request}
            ).data,
            status=status.HTTP_201_CREATED,
        )


@extend_schema(tags=['NLAs'], description='Получение НПА.')
class NormativeLegislationViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения видео."""

    queryset = NormativeLegislation.objects.all()
    serializer_class = NormativeLegislationSerializer
    permission_classes = (IsAuthenticated,)
    ordering = ('-date',)
    ordering_fields = ('date', 'title')


@extend_schema(tags=['Tests'], description='Получение видео.')
class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения видео."""

    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = (IsAuthenticated,)
    ordering = ('-date',)


@extend_schema(
    tags=['InstructionResult'],
    description='Сохранение результатов прохождения инструктажа пользователя.',
)
class InstructionResultView(APIView):
    """API для сохранения результатов прохождения инструктажа."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InstructionResultSerializer(
            data=request.data, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        try:
            instruction_result = serializer.save()
            return Response(
                {
                    'status': 'success',
                    'instruction_result_id': instruction_result.id,
                    'is_passed': instruction_result.result,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, status=status.HTTP_400_BAD_REQUEST
            )

@extend_schema(
    tags=['Notification'],
    description='Получение, чтение уведомлений.',
)
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True
        )
        return Response({'status': 'all marked as read'})
