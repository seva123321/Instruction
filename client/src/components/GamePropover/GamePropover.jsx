import { memo } from 'react'
import {
  Box,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  ZoomIn as ZoomInIcon,
  PanTool as PanToolIcon,
  RotateLeft as RotateLeftIcon,
} from '@mui/icons-material'

function GamePropover({
  isMobile = false,
  helpOpen = {},
  helpAnchorEl = {},
  handleHelpClose = {},
}) {
  return (
    <Popover
      open={helpOpen}
      anchorEl={helpAnchorEl}
      onClose={handleHelpClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        '& .MuiPaper-root': {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          minWidth: '250px',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Управление сценой
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <ZoomInIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Колесико мыши - приближение/отдаление" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <RotateLeftIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="ЛКМ + движение - вращение сцены" />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <PanToolIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="ПКМ или Shift + ЛКМ - смена фокуса (панорамирование)" />
          </ListItem>
        </List>
        {isMobile && (
          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
            На мобильных устройствах используйте жесты пальцами для управления.
          </Typography>
        )}
      </Box>
    </Popover>
  )
}

export default memo(GamePropover)
