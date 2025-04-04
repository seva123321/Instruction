import { useState, useEffect, memo } from 'react'
import {
  ListItem,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { Link } from 'react-router-dom'
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  DeleteOutline,
  MoreVert,
} from '@mui/icons-material'

import ColoredBadge from '@/components/ColoredBadge'

import { getTestFromDB } from '../service/offlineDB'

const TestItem = memo(
  ({ test, isLoading, isDownloading, onDownloadTest, onDeleteTest }) => {
    const [isDownloaded, setIsDownloaded] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)
    const isControlTest = test.test_is_control
    const hasPassed = test.is_passed
    const testDate = test.date

    // Проверяем, скачан ли тест
    useEffect(() => {
      const checkDownloaded = async () => {
        try {
          const downloadedTest = await getTestFromDB(test.id)
          setIsDownloaded(!!downloadedTest)
        } catch (e) {
          setIsDownloaded(false)
        }
      }

      checkDownloaded()
    }, [test.id])

    const handleMenuOpen = (event) => {
      event.preventDefault()
      event.stopPropagation()
      setAnchorEl(event.currentTarget)
    }

    const handleMenuClose = (e) => {
      e?.stopPropagation()
      setAnchorEl(null)
    }

    const handleDelete = async (event) => {
      event.preventDefault()
      event.stopPropagation()
      try {
        await onDeleteTest(test.id)
        setIsDownloaded(false)
      } finally {
        handleMenuClose(event)
      }
    }

    const handleDownload = async (event) => {
      event.preventDefault()
      event.stopPropagation()
      try {
        await onDownloadTest(event, test.id)
        setIsDownloaded(true)
      } catch (error) {
        setIsDownloaded(false)
      }
    }

    return (
      <ListItem
        component={Link}
        to={`/tests/${test.id}`}
        onClick={(e) => {
          // Блокируем переход если кликнули на меню или его элементы
          if (anchorEl || e.target.closest('.menu-container')) {
            e.preventDefault()
          }
        }}
        sx={{
          mb: 3,
          bgcolor: 'background.paper',
          borderRadius: '12px',
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
            }}
          />
        )}

        <Chip
          label={isControlTest ? 'Контрольный' : 'Учебный'}
          color={isControlTest ? 'primary' : 'secondary'}
          size="small"
          icon={
            isControlTest ? (
              <AssignmentIcon fontSize="small" />
            ) : (
              <SchoolIcon fontSize="small" />
            )
          }
          sx={{
            position: 'absolute',
            top: 12,
            right: test.mark ? 40 : 10,
            height: 26,
            borderRadius: '12px',
            fontWeight: '600',
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography
            variant="subtitle1"
            fontWeight="600"
            sx={{
              mb: 1,
              mt: 1.5,
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {test.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              pr: 5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.5,
            }}
          >
            {test.description}
          </Typography>

          {hasPassed && testDate && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                mt: 'auto',
                alignSelf: 'flex-start',
                backgroundColor: 'action.hover',
                px: 1,
                borderRadius: '4px',
              }}
            >
              {`Пройден: ${new Date(testDate).toLocaleString()}`}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            position: 'absolute',
            right: 15,
            bottom: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isDownloaded ? (
            <>
              <Button
                onClick={handleMenuOpen}
                endIcon={<MoreVert />}
                sx={{ minWidth: 120, color: 'action.active' }}
              >
                Скачано
              </Button>

              <Menu
                className="menu-container"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                  <DeleteOutline sx={{ mr: 1 }} />
                  Удалить оффлайн-версию
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Tooltip title="Тест будет доступен в оффлайн режиме">
              <Button
                // variant="outlined"
                onClick={handleDownload}
                disabled={isDownloading[test.id]}
                startIcon={
                  isDownloading[test.id] ? (
                    <CircularProgress size={20} />
                  ) : (
                    <DownloadIcon />
                  )
                }
                sx={{ minWidth: 120 }}
              >
                {isDownloading[test.id] ? 'Загрузка...' : 'Скачать'}
              </Button>
            </Tooltip>
          )}
        </Box>

        {hasPassed && (
          <Box sx={{ position: 'absolute', top: -2, right: test.mark && 12 }}>
            <ColoredBadge mark={test.mark} />
          </Box>
        )}
      </ListItem>
    )
  }
)

export default TestItem
