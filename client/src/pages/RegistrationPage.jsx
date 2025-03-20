import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import PropTypes from 'prop-types'

import LoginPage from './LoginPage'
import AuthPage from './AuthPage'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      style={{ height: '90vh' }}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            display: 'flex',
            height: '100%',
            transition: 'opacity 0.5s ease-in-out',
          }}
        >
          {children}
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  }
}

export default function RegistrationPage() {
  const theme = useTheme()
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ height: '100vh' }}>
      <Tabs
        value={value}
        sx={{ mb: 3 }}
        onChange={handleChange}
        textColor="inherit"
        // variant="fullWidth"
        centered
        aria-label="full width tabs example"
      >
        <Tab label="Вход" {...a11yProps(0)} />
        <Tab label="Регистрация" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0} dir={theme.direction}>
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2,
              position: 'relative',
              background:
                'rgb(74, 84, 86) url(@/../public/img/enterpriseDawn2.jpg) no-repeat center / cover',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)', // Полупрозрачный черный фон
              }}
            />
            <Box
              sx={{ position: 'relative', color: 'white', textAlign: 'center' }}
            >
              <h1 style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
                Добро пожаловать!
              </h1>
              <p style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                Это страница входа. Пожалуйста, введите свои данные.
              </p>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2,
            }}
          >
            <LoginPage />
          </Box>
        </Box>
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2,
              position: 'relative',
              background:
                'rgb(74, 84, 86) url(@/../public/img/enterprise1.jpg) no-repeat center / cover',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,  0, 0, 0.5)', // Полупрозрачный черный фон
              }}
            />
            <Box
              sx={{ position: 'relative', color: 'white', textAlign: 'center' }}
            >
              <h1 style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>
                Присоединяйтесь к нам!
              </h1>
              <p style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)' }}>
                Это страница регистрации. Пожалуйста, заполните форму.
              </p>
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2,
            }}
          >
            <AuthPage />
          </Box>
        </Box>
      </TabPanel>
    </Box>
  )
}
