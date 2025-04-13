/* eslint-disable operator-linebreak */
/* eslint-disable no-nested-ternary */
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  useMediaQuery,
  Box,
  Chip,
  styled,
  IconButton,
  Tooltip,
  TablePagination,
  LinearProgress,
  Skeleton,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  EmojiEvents,
  MilitaryTech,
  WorkspacePremium,
  ExpandMore,
  ExpandLess,
  FilterList,
} from '@mui/icons-material'
import { FixedSizeList as List } from 'react-window'

import useDebounce from '@/hook/useDebounce'

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  '&.top-3': {
    background: `linear-gradient(90deg, ${theme.palette.background.paper}, ${theme.palette.success.light})`,
  },
}))

const RankBadge = styled(Chip)(({ theme, rank }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  '& .MuiChip-avatar': {
    width: 24,
    height: 24,
  },
  ...(rank <= 3 && {
    backgroundColor:
      rank === 1
        ? theme.palette.warning.main
        : rank === 2
          ? theme.palette.grey[400]
          : theme.palette.success.main,
    color: theme.palette.getContrastText(
      rank === 1
        ? theme.palette.warning.main
        : rank === 2
          ? theme.palette.grey[400]
          : theme.palette.success.main
    ),
  }),
}))

const ExperienceProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor:
      value >= 80
        ? theme.palette.success.main
        : value >= 50
          ? theme.palette.info.main
          : theme.palette.warning.main,
  },
}))

const ExpandedRow = memo(({ user, isMobile, isTablet }) => (
  <TableRow>
    <TableCell colSpan={isMobile ? 4 : isTablet ? 5 : 6}>
      <Box
        sx={{
          p: 2,
          backgroundColor: (theme) => theme.palette.background.default,
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Дополнительная информация
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Email:
            </Typography>
            <Typography>{user.email}</Typography>
          </Box>
          {user.position && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Должность:
              </Typography>
              <Typography>{user.position}</Typography>
            </Box>
          )}
          {user.birthday && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Дата рождения:
              </Typography>
              <Typography>
                {new Date(user.birthday).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
        {user.badges?.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Все награды:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {user.badges.map((badge) => (
                <Tooltip key={badge.id} title={badge.description}>
                  <RankBadge
                    avatar={
                      <Avatar
                        src={badge.icon}
                        alt={badge.name}
                        loading="lazy"
                      />
                    }
                    label={badge.name}
                    variant="outlined"
                    size="small"
                  />
                </Tooltip>
              ))}
            </Box>
          </>
        )}
      </Box>
    </TableCell>
  </TableRow>
))

const UserRow = memo(
  ({
    user,
    index,
    page,
    rowsPerPage,
    isMobile,
    isTablet,
    expandedUser,
    toggleExpandUser,
    theme,
  }) => {
    const globalRank = page * rowsPerPage + index + 1

    const progress = useMemo(
      () =>
        user.next_rank
          ? (user.experience_points / user.next_rank.required_points) * 100
          : 0,
      [user.experience_points, user.next_rank]
    )

    return (
      <>
        <StyledTableRow
          className={globalRank <= 3 ? `top-3 rank-${globalRank}` : ''}
        >
          <TableCell>
            <RankBadge
              label={globalRank}
              rank={globalRank}
              avatar={
                globalRank <= 3 ? (
                  <Avatar>
                    {globalRank === 1 ? (
                      <EmojiEvents />
                    ) : globalRank === 2 ? (
                      <MilitaryTech />
                    ) : (
                      <WorkspacePremium />
                    )}
                  </Avatar>
                ) : null
              }
            />
          </TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={user.avatar}
                loading="lazy"
                sx={{
                  mr: 2,
                  bgcolor: theme.palette.secondary.main,
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                }}
              >
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {`${user.first_name} ${user.last_name}`}
                </Typography>
                {!isMobile && (
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                )}
              </Box>
            </Box>
          </TableCell>
          {!isMobile && <TableCell>{user.position || 'Не указано'}</TableCell>}
          {!isTablet && (
            <TableCell>
              {user.current_rank && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={user.current_rank.icon}
                    loading="lazy"
                    sx={{ width: 24, height: 24, mr: 1 }}
                  />
                  <Typography>{user.current_rank.name}</Typography>
                </Box>
              )}
            </TableCell>
          )}
          <TableCell align="right">
            <Box sx={{ minWidth: 100 }}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" fontWeight="bold">
                  {user.experience_points}
                </Typography>
                {user.next_rank && (
                  <Typography variant="caption" color="text.secondary">
                    До {user.next_rank.name}:{' '}
                    {user.next_rank.required_points - user.experience_points}
                  </Typography>
                )}
              </Box>
              {user.next_rank && (
                <ExperienceProgress variant="determinate" value={progress} />
              )}
            </Box>
          </TableCell>
          {!isMobile && (
            <TableCell>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {user.badges?.slice(0, 2).map((badge) => (
                  <Tooltip key={badge.id} title={badge.description}>
                    <RankBadge
                      avatar={
                        <Avatar
                          src={badge.icon}
                          alt={badge.name}
                          loading="lazy"
                        />
                      }
                      label={badge.name}
                      variant="outlined"
                      size="small"
                    />
                  </Tooltip>
                ))}
                {user.badges?.length > 2 && (
                  <Tooltip
                    title={
                      <>
                        {user.badges.slice(2).map((badge) => (
                          <div key={badge.id}>{badge.name}</div>
                        ))}
                      </>
                    }
                  >
                    <Chip
                      label={`+${user.badges.length - 2}`}
                      size="small"
                      sx={{ ml: 0.5 }}
                    />
                  </Tooltip>
                )}
                {!user.badges?.length && (
                  <Typography variant="caption" color="text.secondary">
                    Нет наград
                  </Typography>
                )}
              </Box>
            </TableCell>
          )}
          <TableCell>
            <IconButton
              size="small"
              onClick={() => toggleExpandUser(user.id)}
              aria-label={expandedUser === user.id ? 'Свернуть' : 'Развернуть'}
            >
              {expandedUser === user.id ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </TableCell>
        </StyledTableRow>
        {expandedUser === user.id && (
          <ExpandedRow user={user} isMobile={isMobile} isTablet={isTablet} />
        )}
      </>
    )
  }
)

// Основной компонент таблицы
function RatingTable({ data, isLoading }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const [expandedUser, setExpandedUser] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState({
    key: 'experience_points',
    direction: 'desc',
  })

  useEffect(() => {
    setPage(0)
  }, [data])

  const debouncedSort = useDebounce((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }, 300)

  const handleSort = useCallback(
    (key) => {
      debouncedSort(key)
    },
    [debouncedSort]
  )

  const sortedData = useMemo(() => {
    if (!data?.results) return []
    return [...data.results].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  const paginatedData = useMemo(
    () =>
      sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedData, page, rowsPerPage]
  )

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage)
  }, [])

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }, [])

  const toggleExpandUser = useCallback((userId) => {
    setExpandedUser((prev) => (prev === userId ? null : userId))
  }, [])

  const renderSortIcon = useCallback(
    (key) => {
      if (sortConfig.key !== key) return <FilterList fontSize="small" />
      return sortConfig.direction === 'asc' ? <ExpandLess /> : <ExpandMore />
    },
    [sortConfig]
  )

  if (isLoading) {
    return (
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Box key={index} p={2}>
            <Skeleton variant="rectangular" width="100%" height={40} />
            <Box mt={1}>
              <Skeleton width="60%" />
              <Skeleton width="40%" />
            </Box>
          </Box>
        ))}
      </TableContainer>
    )
  }

  if (!data?.results?.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Данные рейтинга отсутствуют
        </Typography>
      </Box>
    )
  }

  const rowRenderer = ({ index, style }) => {
    const user = paginatedData[index]
    return (
      <div style={style}>
        <UserRow
          user={user}
          index={index}
          page={page}
          rowsPerPage={rowsPerPage}
          isMobile={isMobile}
          isTablet={isTablet}
          expandedUser={expandedUser}
          toggleExpandUser={toggleExpandUser}
          theme={theme}
        />
      </div>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          overflowX: 'auto',
          mb: 2,
        }}
      >
        <Table aria-label="rating table" size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 50 }}>
                #
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                Участник
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Должность
                </TableCell>
              )}
              {!isTablet && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Звание
                </TableCell>
              )}
              <TableCell
                align="right"
                sx={{ color: 'white', fontWeight: 'bold' }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  onClick={() => handleSort('experience_points')}
                  sx={{ cursor: 'pointer' }}
                >
                  Очки опыта
                  <IconButton size="small" sx={{ color: 'white', ml: 0.5 }}>
                    {renderSortIcon('experience_points')}
                  </IconButton>
                </Box>
              </TableCell>
              {!isMobile && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Награды
                </TableCell>
              )}
              <TableCell sx={{ width: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            <List
              height={Math.min(
                600,
                paginatedData.length * (expandedUser ? 120 : 60)
              )}
              itemCount={paginatedData.length}
              itemSize={expandedUser ? 120 : 60}
              width="100%"
            >
              {rowRenderer}
            </List>
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data?.count || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Строк на странице:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} из ${count !== -1 ? count : `более ${to}`}`
        }
        sx={{
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            justifyContent: 'center',
          },
        }}
      />
    </Box>
  )
}

export default memo(RatingTable)
