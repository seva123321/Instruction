import base64
import json
import os

from Crypto.Cipher import AES
from dotenv import load_dotenv
from django.conf import settings
import numpy as np

from api.models import User


load_dotenv()

AES_TRANSPORT_KEY = os.getenv("AES_TRANSPORT_KEY")
AES_STORAGE_KEY = os.getenv("AES_STORAGE_KEY")

AES_TRANSPORT_KEY = AES_TRANSPORT_KEY.encode()
AES_STORAGE_KEY = AES_STORAGE_KEY.encode()


def is_face_already_registered(input_descriptor):
    """
    Проверяет, есть ли в системе пользователь с похожим дескриптором лица
    :param input_descriptor: numpy array с дескриптором лица
    :return: True если найден похожий пользователь, иначе False
    """
    for user in User.objects.exclude(face_descriptor__isnull=True):
        try:
            encrypted_data = json.loads(user.face_descriptor)
            stored_descriptor = np.array(
                decrypt_descriptor(
                    encrypted_data,
                    AES_STORAGE_KEY
                ), dtype=np.float32
            )

            distance = np.linalg.norm(input_descriptor - stored_descriptor)
            if distance < settings.FACE_MATCH_THRESHOLD:
                return True
        except Exception as e:
            print(f"Ошибка обработки дескриптора лица пользователя "
                  f"{user.id}: {str(e)}")
            continue
    return False


def decrypt_descriptor(encrypted_data, key):
    """Дешифрует дескриптор лица"""
    try:
        iv = base64.b64decode(encrypted_data['iv'])
        ciphertext = base64.b64decode(encrypted_data['ciphertext'])
        tag = base64.b64decode(encrypted_data['tag'])

        cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
        decrypted = cipher.decrypt_and_verify(ciphertext, tag)
        return json.loads(decrypted.decode('utf-8'))
    except Exception as e:
        raise ValueError(f"Ошибка дешифрования: {str(e)}")


def encrypt_descriptor(descriptor, key):
    """Шифрует дескриптор лица для хранения"""
    try:
        descriptor_json = json.dumps(
            descriptor.tolist()
            if isinstance(descriptor, np.ndarray)
            else descriptor
        )

        cipher = AES.new(key, AES.MODE_GCM)
        ciphertext, tag = cipher.encrypt_and_digest(
            descriptor_json.encode('utf-8')
        )

        return {
            'iv': base64.b64encode(cipher.nonce).decode('utf-8'),
            'ciphertext': base64.b64encode(ciphertext).decode('utf-8'),
            'tag': base64.b64encode(tag).decode('utf-8')
        }
    except Exception as e:
        raise ValueError(f"Ошибка шифрования: {str(e)}")
