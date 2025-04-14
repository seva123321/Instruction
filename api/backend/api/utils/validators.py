import re


def normalize_phone_number(phone):
    """
    Приводит номер телефона к стандартному формату +79999999999
    Возвращает нормализованный номер или None при ошибке
    """
    if not phone:
        return None

    cleaned = re.sub(r"[^\d+]", "", str(phone))

    if cleaned.startswith("8"):
        normalized = "+7" + cleaned[1:]
    elif cleaned.startswith("7"):
        normalized = "+" + cleaned
    elif cleaned.startswith("+7"):
        normalized = cleaned
    else:
        return None

    if len(normalized) != 12:  # +7 и 10 цифр
        return None

    return normalized
