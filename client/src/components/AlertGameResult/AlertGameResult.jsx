import { memo } from 'react'
import { Box, Typography, Stack, Paper, Collapse } from '@mui/material'
import {
  Celebration as CelebrationIcon,
  MoodBad as MoodBadIcon,
} from '@mui/icons-material'

function AlertGameResult({ showResult, result = '' }) {
  return (
    <Collapse in={showResult} timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 3,
            backgroundColor: result === 'win' ? 'success.light' : 'error.light',
            color: 'white',
            borderRadius: '16px',
            maxWidth: '90%',
            textAlign: 'center',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            {result === 'win' ? (
              <>
                <CelebrationIcon fontSize="large" />
                <Typography variant="h6">
                  Поздравляем! Вы правильно выполнили задание!
                </Typography>
              </>
            ) : (
              <>
                <MoodBadIcon fontSize="large" />
                <Typography variant="h6">
                  Вы проиграли! В следующий раз вам точно повезет!
                </Typography>
              </>
            )}
          </Stack>
        </Paper>
      </Box>
    </Collapse>
  )
}

export default memo(AlertGameResult)
