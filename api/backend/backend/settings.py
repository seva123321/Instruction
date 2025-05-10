import datetime
import os
from pathlib import Path

from celery.schedules import crontab
from dotenv import load_dotenv
import pytz

from backend.constants import (
    MORNING_MINUTE,
    MORNING_HOUR,
    DAY_HOUR,
    DAY_MINUTE,
    EVENING_HOUR,
    EVENING_MINUTE,
    GAME_HOUR,
    GAME_MINUTE,
)

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.getenv("SECRET_KEY", "some_key")

DEBUG = os.getenv("DEBUG", "false").lower() == "true"

ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS", default="127.0.0.1,localhost"
).split(",")

AUTH_USER_MODEL = "api.User"
TEST_QUESTIONS_LIMIT = 10
FACE_MATCH_THRESHOLD = 0.6


INSTALLED_APPS = [
    "unfold",
    "unfold.contrib.filters",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "drf_spectacular",
    "api.apps.ApiConfig",
    "django_otp",
    "django_otp.plugins.otp_static",
    "django_otp.plugins.otp_totp",
    "two_factor",
    "django_celery_beat",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django_otp.middleware.OTPMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


DATABASES = {
    "default": {}
}
if os.getenv("USE_SQLITE", False):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    DATABASES["default"] = {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "instruction_db"),
        "USER": os.getenv("POSTGRES_USER", "instruction_user"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "instruction_password"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", 5432),
    }


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 5,
    "DEFAULT_THROTTLE_RATES": {
        "user": "5/day",
    },
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

CELERY_BROKER_URL = "redis://localhost:6379/0"
CELERY_RESULT_BACKEND = "redis://localhost:6379/0"
CELERY_TIMEZONE = "Europe/Moscow"
CELERY_TASK_DEFAULT_QUEUE = "default"
CELERY_IMPORTS = ("api.tasks",)

CELERY_BEAT_SCHEDULE = {
    "send-morning-reminders": {
        "task": "api.tasks.send_instruction_reminders",
        "schedule": crontab(
            hour=MORNING_HOUR,
            minute=MORNING_MINUTE,
            nowfun=lambda: datetime.now(pytz.timezone("Europe/Moscow")),
        ),
    },
    "send-day-reminders": {
        "task": "api.tasks.send_instruction_reminders",
        "schedule": crontab(
            hour=DAY_HOUR,
            minute=DAY_MINUTE,
            nowfun=lambda: datetime.now(pytz.timezone("Europe/Moscow")),
        ),
    },
    "send-evening-reminders": {
        "task": "api.tasks.send_instruction_reminders",
        "schedule": crontab(
            hour=EVENING_HOUR,
            minute=EVENING_MINUTE,
            nowfun=lambda: datetime.now(pytz.timezone("Europe/Moscow")),
        ),
    },
    "send-game-notification": {
        "task": "api.tasks.send_game_notification",
        "schedule": crontab(
            hour=GAME_HOUR,
            minute=GAME_MINUTE,
            nowfun=lambda: datetime.now(pytz.timezone("Europe/Moscow")),
        ),
    },
}

LOGIN_URL = "two_factor:login"


TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
CORS_EXPOSE_HEADERS = ['Set-Cookie']
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_AGE = 1209600
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_HTTPONLY = False
CSRF_USE_SESSIONS = False
# for developing with ReactVite
SESSION_COOKIE_SAMESITE = 'Lax' 
CSRF_COOKIE_SAMESITE = 'Lax'

SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE")
CSRF_COOKIE_SECURE = os.getenv("CSRF_COOKIE_SECURE")

SPECTACULAR_SETTINGS = {
    "TITLE": "Instruction API",
    "DESCRIPTION": "API documentation for Instruction",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "ENUM_NAME_OVERRIDES": {
        "ValidationErrorEnum": ["invalid", "not_found", "permission_denied"]
    },
    "COMPONENT_SPLIT_REQUEST": True,
    "SCHEMA_COERCE_PATH_PK": False,
}

LANGUAGE_CODE = "ru-RU"

TIME_ZONE = "Europe/Moscow"

USE_I18N = True

USE_TZ = True

STATIC_URL = "static/"
STATICFILES_DIRS = [BASE_DIR / "staticfiles"]
STATIC_ROOT = BASE_DIR / "static"

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

UNFOLD = {
    "SITE_TITLE": "Админ-панель системы инструктажей",
    "SITE_HEADER": "Панель администратора",
    "DASHBOARD_CALLBACK": "api.admin.dashboard_callback",
}

DEFAULT_POSITION_ICON_URL = "/static/media/default.png"

