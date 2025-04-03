const API_CONFIG = {
  PORT: 8000,
  // BASE_URL: 'http://127.0.0.1',
  BASE_URL: '', // Оставляем пустым для относительных путей
  PROXY_PREFIX: '/api', // Добавляем префикс прокси
  get FULL_URL() {
    return `${this.BASE_URL}:${this.PORT}/`
  },
}
export default API_CONFIG
/*
const isDev = import.meta.env.MODE === 'development'

export const API_CONFIG = {
  BASE_API: isDev ? '/api' : import.meta.env.VITE_API_BASE_URL || '/api',
  AUTH_API: isDev
    ? '/api/auth'
    : `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth`,
}
*/
