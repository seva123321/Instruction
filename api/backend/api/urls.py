"""Модуль URL определяет шаблоны URL для конечных точек API."""
from django.urls import include, path

from rest_framework.routers import DefaultRouter

from api.views import (
    InstructionViewSet,
    UserViewSet,
    TestViewSet,
    SignUpView
)

router_v1 = DefaultRouter()

router_v1.register('instructions', InstructionViewSet, basename='instructions')
router_v1.register('tests', TestViewSet, basename='tests')

router_v1.register('users', UserViewSet, basename='users')
auth_urls = [
    path('signup/', SignUpView.as_view(), name='signup'),
]

urlpatterns = [
    path('auth/', include(auth_urls)),
    path('', include(router_v1.urls)),
]
