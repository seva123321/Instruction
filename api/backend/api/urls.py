"""Модуль URL определяет шаблоны URL для конечных точек API."""

from django.urls import include, path

from rest_framework.routers import DefaultRouter

from api.views import (
    InstructionViewSet,
    FaceLoginView,
    UserViewSet,
    TestViewSet,
    SignUpView,
    LoginView,
    LogoutView,
    VideoViewSet,
    TestResultCreateView,
    NormativeLegislationViewSet,
    InstructionResultView,
    NotificationViewSet,
    RatingViewSet
)

router = DefaultRouter()

router.register('rating', RatingViewSet, basename='rating')
router.register('instructions', InstructionViewSet, basename='instructions')
router.register('tests', TestViewSet, basename='tests')
router.register('knowladge/videos', VideoViewSet, basename='knowladge/videos')
router.register(
    'knowladge/nlas', NormativeLegislationViewSet, basename='knowladge/nlas'
)
router.register(r'notifications', NotificationViewSet, basename='notification')

router.register('users', UserViewSet, basename='users')
auth_urls = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('face_login/', FaceLoginView.as_view(), name='face_login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]

urlpatterns = [
    path('auth/', include(auth_urls)),
    path(
        'instruction_results/',
        InstructionResultView.as_view(),
        name='instruction_results',
    ),
    path('test_results/', TestResultCreateView.as_view(), name='test_results'),
    path('', include(router.urls)),
]
