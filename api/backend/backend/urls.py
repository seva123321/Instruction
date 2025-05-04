"""
URL-маршруты Django проекта.

Этот модуль определяет URL-маршруты для вашего Django приложения.
Он включает маршруты для административной панели, отображения документации API
и подключения URL-маршрутов из ваших приложений api и users.

"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView

from api.utils.utils import export_to_excel

urlpatterns = [
    path("admin/export/excel/", export_to_excel, name="export_excel"),
    path(
        "admin/",
        include(("two_factor.urls", "two_factor"), namespace="two_factor"),
    ),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"
    ),
]
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )
