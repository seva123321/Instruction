import json

from django.conf import settings
import numpy as np

from api.models import User


def is_face_already_registered(input_descriptor):
    """
    Проверяет, есть ли в системе пользователь с похожим дескриптором лица
    :param input_descriptor: numpy array с дескриптором лица
    :return: True если найден похожий пользователь, иначе False
    """
    for user in User.objects.exclude(face_descriptor__isnull=True):
        try:
            stored_descriptor = np.array(
                json.loads(user.face_descriptor),
                dtype=np.float32
            )
            distance = np.linalg.norm(input_descriptor - stored_descriptor)
            if distance < settings.FACE_MATCH_THRESHOLD:
                return True
        except (json.JSONDecodeError, TypeError) as e:
            print(f'Ошибка обработки дескриптора лица пользователя {user.id}: {str(e)}')
            continue
    return False
