export const formatPhoneNumber = (value) => {
  // Удаляем все символы, кроме цифр
  const cleaned = value.replace(/\D/g, '')

  let formattedValue = ''
  if (cleaned.startsWith('8')) {
    formattedValue = cleaned.replace(/^8/, '+7')
  } else {
    formattedValue = cleaned
  }

  const match = formattedValue.match(
    /^(\+?(\d{1,3}))?(\d{3})(\d{3})(\d{2})(\d{2})$/
  )
  if (match) {
    return `+${match[2] || ''}-${match[3]}-${match[4]}-${match[5]}-${match[6]}`
  }
  return value
}

export const isEmail = (value) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)

export const isPhoneNumber = (value) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  /^\+?\d{1,3}[- ]?\d{3}[- ]?\d{3}[- ]?\d{2}[- ]?\d{2}$/.test(value)

export const calculateMark = (score, totalPoints) => {
  if (totalPoints <= 0) return 1

  const percentage = (score / totalPoints) * 100
  const calculatedMark = Math.min(
    10,
    Math.floor(percentage / 10) + (percentage % 10 >= 5 ? 1 : 0)
  )

  return Math.max(1, calculatedMark)
}
export const getYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export const getTestEnding = (count) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return ''
  }
  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  ) {
    return 'а'
  }
  return 'ов'
}

// Функция для глубокого сравнения объектов тестов
export const areTestsEqual = (test1, test2) => {
  if (!test1 || !test2) return false
  const keys1 = Object.keys(test1)
  const keys2 = Object.keys(test2)

  if (keys1.length !== keys2.length) return false

  return keys1.every((key) => {
    // Исключаем поля, которые могут изменяться без существенных изменений
    if (key === 'updated_at' || key === 'created_at') return true

    // Сравниваем примитивы и массивы
    if (Array.isArray(test1[key]) && Array.isArray(test2[key])) {
      return (
        test1[key].length === test2[key].length &&
        test1[key].every((val, i) => val === test2[key][i])
      )
    }

    return test1[key] === test2[key]
  })
}
