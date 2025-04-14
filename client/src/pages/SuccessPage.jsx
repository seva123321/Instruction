import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'

import TabsWrapper from '@/components/TabsWrapper'

const tabs = [
  {
    label: 'Календарь',
    to: 'calendar',
  },
  {
    label: 'Рейтинг',
    to: 'rating',
  },
]

function SuccessPage() {
  return (
    <div>
      <Box mb={3}>
        <TabsWrapper tabs={tabs} centered useRouter />
      </Box>
      <Outlet />
    </div>
  )
}

export default SuccessPage
