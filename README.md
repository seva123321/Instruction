# Цифровая платформа для предсменного инструктажа сотрудников промышленных предприятий с элементами геймификации

[![Python](https://img.shields.io/badge/-Python-464646?style=flat-square&logo=Python)](https://www.python.org/)
[![Django](https://img.shields.io/badge/-Django-464646?style=flat-square&logo=Django)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/-Django%20REST%20Framework-464646?style=flat-square&logo=Django%20REST%20Framework)](https://www.django-rest-framework.org/)
[![JavaScript](https://img.shields.io/badge/-JavaScript-464646?style=flat-square&logo=JavaScript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/-React-464646?style=flat-square&logo=React)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-464646?style=flat-square&logo=PostgreSQL)](https://www.postgresql.org/)
[![face-api.js](https://img.shields.io/badge/-face--api.js%20v0.22.2-464646?style=flat-square)](https://github.com/justadudewhohacks/face-api.js)
[![Celery](https://img.shields.io/badge/-Celery-464646?style=flat-square&logo=Celery)](https://docs.celeryq.dev/)
[![Redis](https://img.shields.io/badge/-Redis-464646?style=flat-square&logo=Redis)](https://redis.io/)
[![Django Two-Factor Auth](https://img.shields.io/badge/-Django%20Two--Factor%20Auth-464646?style=flat-square&logo=Django)](https://django-two-factor-auth.readthedocs.io/)
[![NumPy](https://img.shields.io/badge/-NumPy-464646?style=flat-square&logo=NumPy)](https://numpy.org/)
## Описание
Цифровая платформа для автоматизации и улучшения качества предсменного инструктажа сотрудников промышленных предприятий,
направленная на повышение безопасности труда, мотивацию сотрудников и обеспечение прозрачности контроля выполнения требований.
## Основные особенности
- Прохождение инструктажей сотрудниками: 
	  Позволяет напомнить сотруднику об основных положения техники безопасности, а также узнать о состоянии/готовности сотрудника к выполнению работ. 
- Тестирование сотрудников: Несколько вариантов тестов в зависимости от ситуации.
- Офлайн-режим: Возможность скачивания материалов и прохождения тестов без интернета с синхронизацией при восстановлении связи.
- Верификация прохождения инструктажа с помощью FaceID (используется дескриптор лица сотрудника **для 100% подтверждения его личности**).
- Аутентификация пользователей: Стандартная аутентификация, а также аутентификация с использованием FaceID.
- Профиль пользователя: Позволяет пользователю отслеживать собственный прогресс, а также изменять личные данные.
- База знаний для сотрудников.
- Двухфакторная аутентификация для администратора.
- Дашборд со статистикой для руководства.
- Элементы геймификации: Добавлены звания, очки за прохождения тестов/инструктажей, а также дополнительные значки.
- Система оповещения для сотрудников и руководства через телеграмм-бот.
- Рейтинг сотрудников.
- Лаконичный и простой интерфейс.
- Выполнена адаптация проекта под мобильные устройства.
## Стек использованных технологий
+ Python 3.11
+ Django 4.2
+ DRF 3.15.2
+ JavaScript
+ React 19.0.0 (React Router DOM (v7.3.0), Redux Toolkit (v2.6.1), React Hook Form (v7.54.2), Material-UI (MUI) (v7.0.2), Emotion (v11.14.0),
  React Window (v1.8.11), React Swipeable (v7.0.2))
+ Face-api.js 0.22.2
+ Celery 5.5.1
+ Redis 5.2.1
+ PostgreSQL 13.10
+ NumPy 2.2.4
+ Django-two-factor-auth 1.17.0

## Запуск проекта

### Установка
- **Предварительно установите PostgreSQL на Вашу операционную систему!**
#### Backend
Во-первых установите Python и pip (команды для Ubuntu)
```
sudo apt-get install python
sudo apt-get install pip
```
Если вы используйте Windows, то установите Python [по ссылке](https://www.python.org/downloads/release/python-31112/).
Создайте виртуальное окружение и активируйте его.
```
python -m venv venv
source venv/bin/activate    # (Ubuntu)
./venv/Scripts/python       # (Windows)
```
Затем установите необходимые зависимости из файла requirements.txt
```
pip install -r requirements.txt
```
#### Frontend
Переходим в директорию instruction/client
```
cd instruction/client
```
Устанавливаем зависимости
```
npm install
```
## Запуск
В двух разных терминалах запускаем **backend** и **frontend**
#### Backend
Перейдите в корневую директорию проекта, где находится файл manage.py
выполните команды для создания и применения миграций, затем запустите сервер
```
python manage.py makemigrations
python manage.py migrate

python manage.py runserver
```
Если вы все правильно сделали, то высветится приглашение
```
System check identified no issues (0 silenced).
April 14, 2025 - 14:09:55
Django version 4.2, using settings 'backend.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

При возникновении ошибки
```
python: can't open file 'manage.py'[Errno 2] No such file or directory
```
убедитесь, что вы находитесь в корневой директории проекта

Далее открываем ещё два терминала и активируем работу Celery.
```
celery -A backend.celery_app worker -l info -P gevent
celery -A backend.celery_app beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```
Проверяем работу Redis
```
sudo systemctl status redis

# Вывод команды:
 redis-server.service - Advanced key-value store
     Loaded: loaded (/lib/systemd/system/redis-server.service; enabled; vendor >
     Active: **active (running)** since Mon 2025-04-14 08:25:20 MSK; 10h ago
       Docs: http://redis.io/documentation,
             man:redis-server(1)
   Main PID: 1143 (redis-server)
     Status: "Ready to accept connections"
      Tasks: 5 (limit: 18715)
     Memory: 5.1M
        CPU: 23.894s
     CGroup: /system.slice/redis-server.service
             └─1143 "/usr/bin/redis-server 127.0.0.1:6379" "" "" "" "" "" "" ""vvvvvvv
```
#### Frontend
Запускаем сервер
```
npm run dev - запуск в режиме разработки
npm run built - сборка проекта на продакшн
```
Откройте браузер и перейдите по адресу http://127.0.0.1:3000/ 

### Для успешного развертывания проекта необходимо в главной директории создать файл .env, где будут указаны следующие параметры:
- TELEGRAM_BOT_TOKEN={{YOUR_TOKEN}}
- POSTGRES_USER=instruction_user
- POSTGRES_PASSWORD=instruction_password
- POSTGRES_DB=instruction_db
- DB_NAME=instruction
- DB_HOST=db
- DB_PORT=5432
- SECRET_KEY={{SOMESECRETKEY}}
- ALLOWED_HOSTS=127.0.0.1,localhost,{{ваш_доменный_адрес}},{{ваш_IP_адрес}}
- DEBUG=False
- USE_SQLITE=False (параметр для быстрой смены БД с PostgreSQL на SQLite)
- SESSION_COOKIE_SECURE=True (для деплоя)
- CSRF_COOKIE_SECURE=True (для деплоя)

### Оптиционально
После установки виртульного окружения необходимо настроить библиотеку two_factor.
Откройте файл two_factor/urls.py, удалите последнюю строку в файле и добавьте две другие.
```
app_name = 'two_factor'  # Добавляем app_name
urlpatterns = core + profile + plugin_urlpatterns  # Убираем кортеж
```
Также добавьте в админ-панель кнопку перехода в настройки 2ФА.
Для этого откройте unfold/templates/unfold/helpers/account_likes.html
```
                {% firstof user.get_short_name user.get_username %}
            </span>
        </div>
<!--        Добавьте следующие строки-->
            <a href="account/two_factor/" class="mx-1 px-3 py-2 rounded hover:bg-base-100 hover:text-base-700 dark:hover:bg-base-700 dark:hover:text-base-200">
                Двухфакторная аутентификация
            </a>
<!--        Добавьте следующие строки-->
        {% if site_url %}
```

### Планируемые улучшение
- Развернуть проект в Docker;
- Улучшить систему геймификации;
- Улучшить систему оповещений;

## Авторы
+ [Всеволод Яковцев](https://github.com/seva123321) - Frontend Developer
+ [Александр Непочатых](https://github.com/nepa27) - Backend Developer
+ Александр Смирнов - Специалист широкого профиля
