# Generated by Django 4.2 on 2025-05-04 09:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0055_alter_notification_error_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="testresult",
            name="test_duration",
            field=models.IntegerField(
                default=0, verbose_name="Длительность теста (в секундах)"
            ),
        ),
    ]
