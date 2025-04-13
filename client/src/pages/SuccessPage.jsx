import TabsWrapper from '@/components/TabsWrapper'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'

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
