const API_CONFIG = {
  PORT: 8000,
  BASE_URL: '', // Оставляем пустым для относительных путей
  PROXY_PREFIX: '/api', // Добавляем префикс прокси
  get FULL_URL() {
    return `${this.BASE_URL}:${this.PORT}/`
  },
}
export default API_CONFIG
