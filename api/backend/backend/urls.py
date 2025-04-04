"""
URL-маршруты Django проекта.

Этот модуль определяет URL-маршруты для вашего Django приложения.
Он включает маршруты для административной панели, отображения документации API
и подключения URL-маршрутов из ваших приложений api и users.

"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path(
        'redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'
    ),
]
