import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles'

function CustomThemeProvider({ children }) {
  const theme = createTheme({
    typography: {
      fontSize: 14, // Базовый размер шрифта
      h1: {
        fontSize: '2rem', // Размер шрифта для заголовка h1
      },
      h2: {
        fontSize: '1.5rem', // Размер шрифта для заголовка h2
      },
      // Добавьте другие заголовки и стили по мере необходимости
    },
    spacing: 8, // Базовый размер отступа
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
  })

  // Определите размеры шрифта и отступов для разных viewport
  theme.typography = {
    ...theme.typography,
    body1: {
      fontSize: '1rem',
      [theme.breakpoints.up('sm')]: {
        fontSize: '1.2rem',
      },
      [theme.breakpoints.up('md')]: {
        fontSize: '1.4rem',
      },
      [theme.breakpoints.up('lg')]: {
        fontSize: '1.6rem',
      },
    },
    // Добавьте другие стили по мере необходимости
  }

  theme.spacing = (factor) => `${0.25 * factor}rem` // Пример настройки отступов

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
}

export default CustomThemeProvider
