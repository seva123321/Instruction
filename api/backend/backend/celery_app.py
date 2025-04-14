import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
app = Celery("backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


# Это нужно только если вы используете декоратор @shared_task
@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
