from rest_framework import serializers

from api.backend.api.models import User


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
