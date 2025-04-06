/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
export function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop().split(';').shift()
  }

  // eslint-disable-next-line consistent-return
  return undefined
}

export const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1]
}
