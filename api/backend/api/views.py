from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from api.models import User, Instruction, InstructionAgreement
from api.serializers import (
    AdminUserSerializer,
    InstructionSerializer,
    UserSerializer
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
    tags=['Instruction'],
    description='Получение интруктажей.'
)
class InstructionDetailAPIView(generics.RetrieveAPIView):
    """Представление для получения инструктажа."""

    queryset = Instruction.objects.all()
    serializer_class = InstructionSerializer
    # TODO: IsAuthenticated
    permission_classes = (AllowAny,)
