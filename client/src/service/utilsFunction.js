const formatPhoneNumber = (value) => {
  // Удаляем все символы, кроме цифр
  const cleaned = value.replace(/\D/g, '')

  // Проверяем, начинается ли номер с 8
  let formattedValue = ''
  if (cleaned.startsWith('8')) {
    // Заменяем 8 на +7
    formattedValue = cleaned.replace(/^8/, '+7')
  } else {
    formattedValue = cleaned
  }

  // Форматируем номер телефона
  const match = formattedValue.match(
    /^(\+?(\d{1,3}))?(\d{3})(\d{3})(\d{2})(\d{2})$/
  )
  if (match) {
    return `+${match[2] || ''}-${match[3]}-${match[4]}-${match[5]}-${match[6]}`
  }
  return value // Возвращаем оригинальное значение, если формат не совпадает
}

export default formatPhoneNumber
