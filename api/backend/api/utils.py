import numpy as np
from django.conf import settings

from api.models import User


def is_face_already_registered(input_descriptor):
    """
    Проверяет, есть ли в системе пользователь с похожим дескриптором лица
    :param input_descriptor: numpy array с дескриптором лица
    :return: True если найден похожий пользователь, иначе False
    """
    for user in User.objects.exclude(face_descriptor__isnull=True):
        stored_descriptor = np.array(eval(user.face_descriptor), dtype=np.float32)
        distance = np.linalg.norm(input_descriptor - stored_descriptor)
        if distance < settings.FACE_MATCH_THRESHOLD:
            return True
    return False