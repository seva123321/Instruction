from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


# TODO: Add this to venv
SECRET_KEY = (
    'django-insecure-b4ddw)^afp4i+bpu!g*fvi*soq*l39m2x6gu-yjub-w7=ufc%u'
)

# TODO: Change before production
DEBUG = True

# TODO: Add domain, host, etc.
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

AUTH_USER_MODEL = 'api.User'
TEST_QUESTIONS_LIMIT = 10
FACE_MATCH_THRESHOLD = 0.6


INSTALLED_APPS = [
    'unfold',
    'unfold.contrib.filters',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'drf_spectacular',
    'api.apps.ApiConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# TODO: CHANGE BEFORE PRODUCTION
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 5,
    'DEFAULT_THROTTLE_RATES': {
        'user': '5/day',
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}


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
SESSION_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SAMESITE = 'None'

# TODO: Change before production
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

SPECTACULAR_SETTINGS = {
    'TITLE': 'Instruction API',
    'DESCRIPTION': 'API documentation for Instruction',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'ENUM_NAME_OVERRIDES': {
        'ValidationErrorEnum': ['invalid', 'not_found', 'permission_denied']
    },
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_COERCE_PATH_PK': False,
}

LANGUAGE_CODE = 'ru-RU'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

UNFOLD = {
    "SITE_TITLE": "Аналитика инструктажей",
    "SITE_HEADER": "Панель администратора",
    "SITE_ICON": {
        "light": lambda request: "/icon-light.svg",
        "dark": lambda request: "/icon-dark.svg",
    },
}
