# api/migrations/0042_position_migration.py
from django.db import migrations, models
import django.db.models.deletion

def migrate_positions_forward(apps, schema_editor):
    User = apps.get_model('api', 'User')
    Position = apps.get_model('api', 'Position')

    # Собираем все существующие должности
    positions = User.objects.exclude(position__isnull=True) \
        .exclude(position__exact='') \
        .values_list('position', flat=True) \
        .distinct()

    # Создаем записи в Position
    position_map = {}
    for pos in positions:
        if pos:  # Проверка на пустые значения
            obj, created = Position.objects.get_or_create(name=pos)
            position_map[pos] = obj

    # Обновляем пользователей
    for user in User.objects.all():
        if user.position and user.position in position_map:
            user.position_fk = position_map[user.position]
            user.save()

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0041_rename_url_referencelink_source'),
    ]

    operations = [
        migrations.CreateModel(
            name='Position',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True,
                    primary_key=True,
                    serialize=False,
                    verbose_name='ID')),
                ('name', models.CharField(
                    max_length=150,
                    unique=True,
                    verbose_name='Название')),
            ],
            options={
                'verbose_name': 'Должность',
                'verbose_name_plural': 'Должности',
            },
        ),
        migrations.AddField(
            model_name='user',
            name='position_fk',
            field=models.ForeignKey(
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='users',
                to='api.position',
                verbose_name='Должность'),
        ),
        migrations.RunPython(migrate_positions_forward),
        migrations.RemoveField(
            model_name='user',
            name='position',
        ),
        migrations.RenameField(
            model_name='user',
            old_name='position_fk',
            new_name='position',
        ),
    ]