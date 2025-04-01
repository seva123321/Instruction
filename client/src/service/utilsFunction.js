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
  const percentage = (score / totalPoints) * 100
  return Math.min(
    10,
    Math.floor(percentage / 10) + (percentage % 10 >= 5 ? 1 : 0)
  )
}

export const getYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}
