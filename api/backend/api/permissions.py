"""Модуль permissions определяет пользовательские разрешения."""
from rest_framework.permissions import BasePermission


class IsAdminPermission(BasePermission):
    """UsersPermission.

    Проверяет, имеет ли пользователь
    право на доступ к конечной точке API.
    """

    def has_permission(self, request, view):
        """Определяет права доступа на уровне всего запроса."""
        return (
            request.user.is_authenticated
            and request.user.is_staff
        )
