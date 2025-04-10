/* eslint-disable operator-linebreak */
/* eslint-disable indent */
/* eslint-disable react/no-array-index-key */

import { useState, useEffect } from 'react'
import { useTheme, styled } from '@mui/material/styles'
import { Link, useLocation } from 'react-router-dom'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import PropTypes from 'prop-types'
import { useMediaQuery } from '@mui/material'

const StyledTab = styled(Tab, {
  shouldForwardProp: (prop) =>
    !['isChecked', 'isCorrect', 'isControlTest'].includes(prop),
})(({ theme, isChecked, isCorrect, isControlTest }) => {
  const baseStyles = {
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.25),
    padding: theme.spacing(0.5, 0.75),
    minWidth: 'auto',
    minHeight: 'auto',
    fontSize: '0.75rem',
    fontWeight: 500,
    lineHeight: 1.6,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    maxWidth: '120px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '0.8125rem',
      padding: theme.spacing(0.75, 1.5),
      maxWidth: '160px',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '0.875rem',
      // padding: theme.spacing(1, 2),
      // maxWidth: '200px',
    },
  }

  const checkedTestStyles = !isControlTest &&
    isChecked && {
      backgroundColor: isCorrect
        ? theme.palette.success.main
        : theme.palette.error.main,
      color: theme.palette.getContrastText(
        isCorrect ? theme.palette.success.main : theme.palette.error.main
      ),
      '&:hover': {
        backgroundColor: isCorrect
          ? theme.palette.success.dark
          : theme.palette.error.dark,
      },
    }

  const controlTestStyles = isControlTest &&
    isChecked && {
      backgroundColor: theme.palette.action.disabled,
    }

  return {
    ...baseStyles,
    ...checkedTestStyles,
    ...controlTestStyles,
  }
})

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
      {value === index && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 1, sm: 2 },
          }}
        >
          {children}
        </Box>
      )}
    </div>
  )
}

export default function TabsWrapper({
  tabs,
  centered = false,
  useRouter = false,
  value: externalValue,
  onChange: externalOnChange,
  checkedTabs = [],
  isControlTest = false,
  correctAnswers = [],
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const location = useLocation()
  const [internalValue, setInternalValue] = useState(0)

  const isControlled =
    externalValue !== undefined && externalOnChange !== undefined
  const value = isControlled ? externalValue : internalValue
  const handleChange = isControlled
    ? externalOnChange
    : (e, newValue) => setInternalValue(newValue)

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
    <Box sx={{ width: '100%' }}>
      <Box sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          aria-label="tabs wrapper"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            maxHeight: '96px',
            '& .MuiTabs-flexContainer': {
              justifyContent: centered && !isMobile ? 'center' : 'flex-start',
              gap: '4px',
            },
            '& .MuiTabs-scrollButtons': {
              width: '32px',
              '&.Mui-disabled': { opacity: 0.3 },
            },
            '& .MuiTabs-indicator': {
              height: '3px',
            },
          }}
        >
          {tabs.map((tab, index) => {
            const isChecked = checkedTabs.includes(index)
            const isCorrect = correctAnswers[index]
            const label =
              isMobile && tab.label.length > 15
                ? `${tab.label.substring(0, 12)}...`
                : tab.label

            if (useRouter && tab.to) {
              return (
                <StyledTab
                  key={index}
                  label={label}
                  component={Link}
                  to={tab.to}
                  isChecked={isChecked}
                  isCorrect={isCorrect}
                  isControlTest={isControlTest}
                />
              )
            }
            return (
              <StyledTab
                key={index}
                label={label}
                isChecked={isChecked}
                isCorrect={isCorrect}
                isControlTest={isControlTest}
              />
            )
          })}
        </Tabs>
      </Box>

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
  checkedTabs: PropTypes.arrayOf(PropTypes.number),
  correctAnswers: PropTypes.arrayOf(PropTypes.bool),
}

/** ****************************************************************** */

// import { useState, useEffect } from 'react'
// import { useTheme, styled } from '@mui/material/styles'
// import { Link, useLocation } from 'react-router-dom'
// import Tabs from '@mui/material/Tabs'
// import Tab from '@mui/material/Tab'
// import Box from '@mui/material/Box'
// import PropTypes from 'prop-types'
// import { useMediaQuery } from '@mui/material'

// const StyledTab = styled(Tab, {
//   shouldForwardProp: (prop) =>
//     !['isChecked', 'isCorrect', 'isControlTest'].includes(prop),
// })(({ theme, isChecked, isCorrect, isControlTest }) => {
//   // Базовые стили
//   const baseStyles = {
//     borderRadius: theme.shape.borderRadius,
//     margin: theme.spacing(0.25),
//     padding: theme.spacing(0.75, 1),
//     minWidth: 'auto',
//     minHeight: 'auto',
//     fontSize: '0.8125rem',
//     fontWeight: 500,
//     transition: 'all 0.2s ease',
//     '&:hover': {
//       backgroundColor: theme.palette.action.hover,
//     },
//     [theme.breakpoints.up('sm')]: {
//       fontSize: '0.875rem',
//       padding: theme.spacing(1, 2.5),
//       margin: theme.spacing(0.5),
//     },
//   }

//   // Стили для проверенного теста (не контрольного)
//   const checkedTestStyles = !isControlTest &&
//     isChecked && {
//       backgroundColor: isCorrect
//         ? theme.palette.success.main
//         : theme.palette.error.main,
//       color: theme.palette.getContrastText(
//         isCorrect ? theme.palette.success.main : theme.palette.error.main
//       ),
//       '&:hover': {
//         backgroundColor: isCorrect
//           ? theme.palette.success.dark
//           : theme.palette.error.dark,
//       },
//     }

//   // Стили для контрольного теста
//   const controlTestStyles = isControlTest &&
//     isChecked && {
//       backgroundColor: theme.palette.action.disabled,
//     }

//   return {
//     ...baseStyles,
//     ...checkedTestStyles,
//     ...controlTestStyles,
//   }
// })

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
//       {value === index && <Box sx={{ p: { xs: 1, sm: 2 } }}>{children}</Box>}
//     </div>
//   )
// }

// export default function TabsWrapper({
//   tabs,
//   centered = false,
//   useRouter = false,
//   value: externalValue,
//   onChange: externalOnChange,
//   checkedTabs = [],
//   isControlTest = false,
//   correctAnswers = [],
// }) {
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
//   const location = useLocation()
//   const [internalValue, setInternalValue] = useState(0)

//   const isControlled =
//     externalValue !== undefined && externalOnChange !== undefined
//   const value = isControlled ? externalValue : internalValue
//   const handleChange = isControlled
//     ? externalOnChange
//     : (e, newValue) => setInternalValue(newValue)

//   useEffect(() => {
//     if (useRouter && !isControlled) {
//       const currentPath = location.pathname
//       const activeIndex = tabs.findIndex((tab) => currentPath.includes(tab.to))
//       if (activeIndex !== -1) {
//         setInternalValue(activeIndex)
//       }
//     }
//   }, [location, tabs, useRouter, isControlled])

//   return (
//     <Box sx={{ width: '100%' }}>
//       <Tabs
//         value={value}
//         onChange={handleChange}
//         indicatorColor="secondary"
//         textColor="inherit"
//         aria-label="tabs wrapper"
//         scrollButtons="auto"
//         variant="scrollable"
//         allowScrollButtonsMobile
//         sx={{
//           '& .MuiTabs-flexContainer': {
//             justifyContent: centered && !isMobile ? 'center' : 'flex-start',
//           },
//           '& .MuiTabs-scrollButtons': {
//             width: 32,
//             '&.Mui-disabled': { opacity: 0.3 },
//           },
//           '& .MuiTabs-indicator': {
//             height: 3,
//           },
//         }}
//       >
//         {tabs.map((tab, index) => {
//           const isChecked = checkedTabs.includes(index)
//           const isCorrect = correctAnswers[index]

//           if (useRouter && tab.to) {
//             return (
//               <StyledTab
//                 key={index}
//                 label={tab.label}
//                 component={Link}
//                 to={tab.to}
//                 isChecked={isChecked}
//                 isCorrect={isCorrect}
//                 sx={{ flexShrink: 0 }}
//               />
//             )
//           }
//           return (
//             <StyledTab
//               key={index}
//               label={tab.label}
//               isChecked={isChecked}
//               isCorrect={isCorrect}
//               isControlTest={isControlTest}
//               sx={{ flexShrink: 0 }}
//             />
//           )
//         })}
//       </Tabs>

//       {!useRouter &&
//         tabs.map((tab, index) => (
//           <TabPanel
//             key={index}
//             value={value}
//             index={index}
//             dir={theme.direction}
//           >
//             {tab.content}
//           </TabPanel>
//         ))}
//     </Box>
//   )
// }

// TabsWrapper.propTypes = {
//   tabs: PropTypes.arrayOf(
//     PropTypes.shape({
//       label: PropTypes.string.isRequired,
//       content: PropTypes.node,
//       to: PropTypes.string,
//     })
//   ).isRequired,
//   useRouter: PropTypes.bool,
//   value: PropTypes.number,
//   onChange: PropTypes.func,
//   checkedTabs: PropTypes.arrayOf(PropTypes.number),
//   correctAnswers: PropTypes.arrayOf(PropTypes.bool),
// }
