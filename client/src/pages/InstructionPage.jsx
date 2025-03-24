// import TabsWrapper from '@/components/TabsWrapper'
// import OneInstructionPage from '@/models/OneInstructionPage'

// function InstructionPage() {
//   const tabs = [
//     {
//       label: 'Инструктаж 1',
//       content: <OneInstructionPage />,
//     },
//     {
//       label: 'Инструктаж 2',
//       content: <OneInstructionPage />,
//     },
//   ]

//   return <TabsWrapper tabs={tabs} />
// }

// export default InstructionPage

import { Grid2, Container } from '@mui/material'

import { agreements, instructionMarkdown } from '@/service/constValues' // @TODO from server
import CheckboxFields from '@/models/CheckboxFields'
import MarkdownContext from '@/models/MarkdownContext'

function InstructionPage() {
  return (
    <>
      <MarkdownContext markdown={instructionMarkdown} header="Инструктаж" />

      {/* повтор стиля контейнера MarkdownContext */}
      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 9 }} sx={{ padding: 3 }}>
          <Container maxWidth="lg" sx={{ padding: 3 }}>
            <CheckboxFields agreements={agreements} />
          </Container>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: 3 }}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        />
      </Grid2>
    </>
  )
}

export default InstructionPage

/*

// ИНСТРУКТАЖ принимающий массив инструктажей с TABS

import { Grid2, Container } from '@mui/material'

import { agreements, instructionMarkdown } from '@/service/constValues' // @TODO from server
import CheckboxFields from '@/models/CheckboxFields'
import MarkdownContext from '@/models/MarkdownContext'

import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
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

function OneInstructionPage() {
  return (
    <div>
      <MarkdownContext markdown={instructionMarkdown} header="Инструктаж" />

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, sm: 9 }} sx={{ padding: 3 }}>
          <Container maxWidth="lg" sx={{ padding: 3 }}>
            <CheckboxFields agreements={agreements} />
          </Container>
        </Grid2>
        <Grid2
          size={{ xs: 12, sm: 3 }}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        />
      </Grid2>
    </div>
  )
}

function InstructionPage() {
  const theme = useTheme()
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
  return (
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="secondary"
        textColor="inherit"
        // variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="Инструктаж 1" {...a11yProps(0)} />
        <Tab label="Инструктаж 2" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0} dir={theme.direction}>
        <OneInstructionPage />
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <OneInstructionPage />
      </TabPanel>
    </Box>
  )
}

export default InstructionPage

*/
