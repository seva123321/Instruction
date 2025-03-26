from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from drf_spectacular.utils import extend_schema
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
    InstructionAgreement,
    Tests,
    Question
)
from api.serializers import (
    AdminUserSerializer,
    InstructionSerializer,
    InstructionListSerializer,
    UserSerializer,
    TestSerializer,
    TestListSerializer,
    QuestionSerializer,
    SignUpSerializer,
    LoginSerializer
)
from api.permissions import IsAdminPermission
from backend.constants import ME


@extend_schema(
    tags=['User'],
    description='Получение, создание, изменение и удаление пользователей.'
)
class UserViewSet(ModelViewSet):
    """Представление для операций с пользователями."""

    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = (IsAdminPermission,)
    filter_backends = (SearchFilter,)
    search_fields = ('last_name',)
    http_method_names = ('get', 'post', 'patch', 'delete')

    @action(
        detail=False, methods=['GET', 'PATCH'],
        url_path=ME, url_name=ME,
        permission_classes=(IsAuthenticated,)
    )
    def profile(self, request):
        """Представление профиля текущего пользователя."""
        if not request.method == 'PATCH':
            return Response(UserSerializer(
                request.user
            ).data, status=status.HTTP_200_OK)
        serializer = UserSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


@extend_schema(
    tags=['SignUp'],
    description='Регистрация пользователей.'
)
class SignUpView(APIView):
    """Представление для регистрации новых пользователей."""

    permission_classes = (AllowAny,)

    def post(self, request):
        """Создает нового пользователя."""
        serializer = SignUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.create_user(
                email=serializer.validated_data['email'],
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
                password=serializer.validated_data['password'],
                mobile_phone=serializer.validated_data['mobile_phone'],
                face_descriptor=serializer.validated_data['face_descriptor']
            )
        except IntegrityError as e:
            raise ValidationError(e)

        return Response(
            {'id': user.id, 'email': user.email},
            status=status.HTTP_201_CREATED
        )


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
                        'password': 'Обязательное поле' if not password else None
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
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
                        'errors': {
                            error_field: error_msg
                        }
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

            login(request, user)

            return Response(
                {
                    'detail': 'Успешный вход',
                    'user_id': user.id,
                    'email': user.email,
                    'first_name': user.first_name
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {
                    'detail': 'Произошла ошибка при входе',
                    'error': str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LogoutView(APIView):
    """Представление для выхода из системы"""

    def post(self, request):
        logout(request)
        return Response(
            {'detail': 'Успешный выход'},
            status=status.HTTP_200_OK
        )


@extend_schema(
    tags=['Instruction'],
    description='Получение интруктажей.'
)
class InstructionViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения инструктажа."""

    queryset = Instruction.objects.all()
    serializer_class = InstructionSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        """Определяет сериализатор в зависимости от действия."""
        if self.action == 'list':
            return InstructionListSerializer
        return InstructionSerializer


@extend_schema(
    tags=['Tests'],
    description='Получение тестов.'
)
class TestViewSet(viewsets.ReadOnlyModelViewSet):
    """Представление для получения инструктажа."""

    queryset = Tests.objects.prefetch_related(
        'questions',
        'questions__answers',
        'questions__reference_link'
    ).all()
    serializer_class = TestSerializer
    permission_classes = (IsAuthenticated,)

    def get_serializer_class(self):
        """Определяет сериализатор в зависимости от действия."""
        if self.action == 'list':
            return TestListSerializer
        return TestSerializer
