/* eslint-disable react/no-array-index-key */
import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { Link, useLocation } from 'react-router-dom'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import PropTypes from 'prop-types'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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

export default function TabsWrapper({
  tabs,
  centered = false,
  useRouter = false,
  value: externalValue,
  onChange: externalOnChange,
}) {
  const theme = useTheme()
  const location = useLocation()
  const [internalValue, setInternalValue] = useState(0)

  // Определяем, используем ли внешнее или внутреннее управление состоянием
  // eslint-disable-next-line operator-linebreak
  const isControlled =
    externalValue !== undefined && externalOnChange !== undefined
  const value = isControlled ? externalValue : internalValue
  const handleChange = isControlled
    ? externalOnChange
    : (e, newValue) => setInternalValue(newValue)

  // Определяем активную вкладку по текущему URL (только для режима с роутером)
  useEffect(() => {
    if (useRouter && !isControlled) {
      const currentPath = location.pathname
      const activeIndex = tabs.findIndex((tab) => currentPath.includes(tab.to))
      if (activeIndex !== -1) {
        setInternalValue(activeIndex)
      }
    }
  }, [location, tabs, useRouter, isControlled])

  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="secondary"
        textColor="inherit"
        aria-label="tabs wrapper"
        scrollButtons="auto"
        centered={centered}
      >
        {tabs.map((tab, index) => {
          if (useRouter && tab.to) {
            return (
              <Tab
                key={index}
                label={tab.label}
                component={Link}
                to={tab.to}
                {...a11yProps(index)}
              />
            )
          }
          return <Tab key={index} label={tab.label} {...a11yProps(index)} />
        })}
      </Tabs>

      {/* Показываем TabPanel только если не используется роутер */}
      {/*  eslint-disable-next-line operator-linebreak */}
      {!useRouter &&
        tabs.map((tab, index) => (
          <TabPanel
            key={index}
            value={value}
            index={index}
            dir={theme.direction}
          >
            {tab.content}
          </TabPanel>
        ))}
    </Box>
  )
}

TabsWrapper.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node,
      to: PropTypes.string,
    })
  ).isRequired,
  useRouter: PropTypes.bool,
  value: PropTypes.number,
  onChange: PropTypes.func,
}

TabsWrapper.defaultProps = {
  useRouter: false,
}
// import { useState } from 'react'
// import { useTheme } from '@mui/material/styles'
// import Tabs from '@mui/material/Tabs'
// import Tab from '@mui/material/Tab'
// import Box from '@mui/material/Box'
// import PropTypes from 'prop-types'

// function TabPanel(props) {
//   const { children, value, index, ...other } = props

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`full-width-tabpanel-${index}`}
//       aria-labelledby={`full-width-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </div>
//   )
// }

// TabPanel.propTypes = {
//   children: PropTypes.node,
//   index: PropTypes.number.isRequired,
//   value: PropTypes.number.isRequired,
// }

// function a11yProps(index) {
//   return {
//     id: `full-width-tab-${index}`,
//     'aria-controls': `full-width-tabpanel-${index}`,
//   }
// }

// export default function TabsWrapper({ tabs }) {
//   const theme = useTheme()
//   const [value, setValue] = useState(0)

//   const handleChange = (event, newValue) => {
//     setValue(newValue)
//   }

//   return (
//     <Box>
//       <Tabs
//         value={value}
//         onChange={handleChange}
//         indicatorColor="secondary"
//         textColor="inherit"
//         aria-label="tabs wrapper"
//         sx={{ overflowX: 'auto' }}
//       >
//         {tabs.map((tab, index) => (
//           // eslint-disable-next-line react/no-array-index-key
//           <Tab key={index} label={tab.label} {...a11yProps(index)} />
//         ))}
//       </Tabs>
//       {tabs.map((tab, index) => (
//         // eslint-disable-next-line react/no-array-index-key
//         <TabPanel key={index} value={value} index={index} dir={theme.direction}>
//           {tab.content}
//         </TabPanel>
//       ))}
//     </Box>
//   )
// }

// TabsWrapper.propTypes = {
//   tabs: PropTypes.arrayOf(
//     PropTypes.shape({
//       label: PropTypes.string.isRequired,
//       content: PropTypes.node.isRequired,
//     })
//   ).isRequired,
// }
