import React from 'react'
import { Box, Typography, Paper, Grid, Avatar } from '@mui/material'

const CalendarLegend = ({ theme }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Легенда оценок:
      </Typography>
      <Grid container spacing={1}>
        {[
          { range: '8-10', color: 'success' },
          { range: '6-7', color: 'primary' },
          { range: '4-5', color: 'warning' },
          { range: '1-3', color: 'error' },
        ].map((item) => (
          <Grid item xs={6} sm={3} key={item.color}>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: theme.palette[item.color].main,
                  color: theme.palette[item.color].contrastText,
                  fontSize: '0.75rem',
                  mr: 1,
                }}
              >
                {item.range.split('-')[0]}
              </Avatar>
              <Typography variant="body2">{item.range}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}

export default CalendarLegend
