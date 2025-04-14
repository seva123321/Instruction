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
  LinearProgress,
  Skeleton,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import useDebounce from '@/hook/useDebounce'
import useAuth from '@/hook/useAuth'
import {
  EmojiEvents,
  MilitaryTech,
  WorkspacePremium,
  ExpandMore,
  ExpandLess,
  FilterList,
} from '@mui/icons-material'

const MobileTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  '&:first-of-type': {
    paddingLeft: theme.spacing(1),
  },
  '&:last-of-type': {
    paddingRight: theme.spacing(1),
  },
}))

const StyledTableRow = styled(TableRow)(({ theme, isCurrentUser }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: isCurrentUser
      ? theme.palette.success.light
      : theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: isCurrentUser
      ? theme.palette.success.light
      : theme.palette.action.selected,
  },
  '&.top-3': {
    background: `linear-gradient(90deg, ${theme.palette.background.paper}, ${theme.palette.success.light})`,
  },
  ...(isCurrentUser && {
    borderLeft: `4px solid ${theme.palette.success.main}`,
    borderRight: `4px solid ${theme.palette.success.main}`,
  }),
}))

const RankBadge = styled(Chip)(({ theme, rank }) => ({
  marginRight: theme.spacing(0.5),
  fontSize: '0.75rem',
  height: 24,
  '& .MuiChip-avatar': {
    width: 18,
    height: 18,
    fontSize: '0.75rem',
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
  height: 6,
  borderRadius: 3,
  marginTop: theme.spacing(0.5),
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    backgroundColor:
      value >= 80
        ? theme.palette.success.main
        : value >= 50
          ? theme.palette.info.main
          : theme.palette.warning.main,
  },
}))

const ExpandedRow = memo(({ user, isMobile }) => (
  <TableRow>
    <MobileTableCell colSpan={isMobile ? 3 : 6} sx={{ py: 1 }}>
      <Box
        sx={{
          p: 1,
          backgroundColor: (theme) => theme.palette.background.default,
          borderRadius: 1,
          fontSize: '0.875rem',
        }}
      >
        <Box display="flex" flexDirection="column" gap={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Email:
            </Typography>
            <Typography variant="body2">{user.email}</Typography>
          </Box>
          {user.position && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Должность:
              </Typography>
              <Typography variant="body2">{user.position}</Typography>
            </Box>
          )}
          {user.birthday && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Дата рождения:
              </Typography>
              <Typography variant="body2">
                {new Date(user.birthday).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
        {user.badges?.length > 0 && (
          <>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={1}
            >
              Награды:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
              {user.badges.slice(0, 3).map((badge) => (
                <Tooltip key={badge.id} title={badge.description}>
                  <RankBadge
                    avatar={
                      <Avatar
                        src={badge.icon}
                        alt={badge.name}
                        sx={{ width: 18, height: 18 }}
                      />
                    }
                    label={badge.name}
                    variant="outlined"
                    size="small"
                  />
                </Tooltip>
              ))}
              {user.badges?.length > 3 && (
                <Tooltip
                  title={
                    <>
                      {user.badges.slice(3).map((badge) => (
                        <div key={badge.id}>{badge.name}</div>
                      ))}
                    </>
                  }
                >
                  <Chip
                    label={`+${user.badges.length - 3}`}
                    size="small"
                    sx={{ height: 24, fontSize: '0.75rem' }}
                  />
                </Tooltip>
              )}
            </Box>
          </>
        )}
      </Box>
    </MobileTableCell>
  </TableRow>
))

const MobileUserRow = memo(
  ({
    user,
    index,
    page,
    rowsPerPage,
    expandedUser,
    toggleExpandUser,
    theme,
  }) => {
    const { user: currentUserDate } = useAuth()
    const globalRank = page * rowsPerPage + index + 1
    const isCurrentUser = currentUserDate?.user_id === user.id

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
          iscurrentuser={isCurrentUser}
        >
          <MobileTableCell sx={{ width: 40 }}>
            <RankBadge
              label={globalRank}
              rank={globalRank}
              avatar={
                globalRank <= 3 ? (
                  <Avatar
                    sx={{ bgcolor: 'transparent', width: 18, height: 18 }}
                  >
                    {globalRank === 1 ? (
                      <EmojiEvents fontSize="small" />
                    ) : globalRank === 2 ? (
                      <MilitaryTech fontSize="small" />
                    ) : (
                      <WorkspacePremium fontSize="small" />
                    )}
                  </Avatar>
                ) : null
              }
            />
          </MobileTableCell>
          <MobileTableCell>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={user.avatar}
                sx={{
                  mr: 1,
                  bgcolor: theme.palette.secondary.main,
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem',
                }}
              >
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </Avatar>
              <Box>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  noWrap
                  sx={{ maxWidth: 120 }}
                >
                  {`${user.first_name} ${user.last_name}`.slice(0, 15)}
                </Typography>
              </Box>
            </Box>
          </MobileTableCell>
          <MobileTableCell align="right" sx={{ width: 80 }}>
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {user.experience_points}
              </Typography>
              <ExperienceProgress variant="determinate" value={progress} />
            </Box>
          </MobileTableCell>
          <MobileTableCell sx={{ width: 40 }}>
            <IconButton
              size="small"
              onClick={() => toggleExpandUser(user.id)}
              aria-label={expandedUser === user.id ? 'Свернуть' : 'Развернуть'}
            >
              {expandedUser === user.id ? (
                <ExpandLess fontSize="small" />
              ) : (
                <ExpandMore fontSize="small" />
              )}
            </IconButton>
          </MobileTableCell>
        </StyledTableRow>
        {expandedUser === user.id && <ExpandedRow user={user} isMobile />}
      </>
    )
  }
)

const DesktopUserRow = memo(
  ({
    user,
    index,
    page,
    rowsPerPage,
    expandedUser,
    toggleExpandUser,
    theme,
  }) => {
    const { user: currentUser } = useAuth()
    const isCurrentUser = currentUser?.user_id === user.id
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
          isCurrentUser={isCurrentUser}
        >
          <TableCell sx={{ width: 70 }}>
            <RankBadge
              label={globalRank}
              rank={globalRank}
              avatar={
                globalRank <= 3 ? (
                  <Avatar sx={{ bgcolor: 'transparent' }}>
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
                sx={{
                  mr: 2,
                  bgcolor: theme.palette.secondary.main,
                  width: 40,
                  height: 40,
                }}
              >
                {user.first_name?.[0]}
                {user.last_name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {`${user.first_name} ${user.last_name}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell sx={{ minWidth: 120 }}>
            {user.position || 'Не указано'}
          </TableCell>
          <TableCell sx={{ minWidth: 160 }}>
            {user.current_rank && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={user.current_rank.icon}
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
                <Typography>{user.current_rank.name}</Typography>
              </Box>
            )}
          </TableCell>
          <TableCell align="right" sx={{ minWidth: 150 }}>
            <Box>
              <Box display="flex" justifyContent="space-between">
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
          <TableCell sx={{ minWidth: 200 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {user.badges?.slice(0, 3).map((badge) => (
                <Tooltip key={badge.id} title={badge.description}>
                  <RankBadge
                    avatar={<Avatar src={badge.icon} alt={badge.name} />}
                    label={badge.name}
                    variant="outlined"
                    size="small"
                  />
                </Tooltip>
              ))}
              {user.badges?.length > 3 && (
                <Tooltip
                  title={
                    <>
                      {user.badges.slice(3).map((badge) => (
                        <div key={badge.id}>{badge.name}</div>
                      ))}
                    </>
                  }
                >
                  <Chip label={`+${user.badges.length - 3}`} size="small" />
                </Tooltip>
              )}
              {!user.badges?.length && (
                <Typography variant="caption" color="text.secondary">
                  Нет наград
                </Typography>
              )}
            </Box>
          </TableCell>
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
        {expandedUser === user.id && <ExpandedRow user={user} />}
      </>
    )
  }
)

function RatingTable({ data, isLoading }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
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
          {isMobile ? (
            <>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <MobileTableCell
                    sx={{ color: 'white', fontWeight: 'bold', width: 40 }}
                  >
                    #
                  </MobileTableCell>
                  <MobileTableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                    Участник
                  </MobileTableCell>
                  <MobileTableCell
                    align="right"
                    sx={{ color: 'white', fontWeight: 'bold', width: 80 }}
                  >
                    Очки
                  </MobileTableCell>
                  <MobileTableCell sx={{ width: 40 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((user, index) => (
                  <MobileUserRow
                    key={user.id}
                    user={user}
                    index={index}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    expandedUser={expandedUser}
                    toggleExpandUser={toggleExpandUser}
                    theme={theme}
                  />
                ))}
              </TableBody>
            </>
          ) : (
            <>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableCell
                    sx={{ color: 'white', fontWeight: 'bold', width: 70 }}
                  >
                    #
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                    Участник
                  </TableCell>
                  <TableCell
                    sx={{ color: 'white', fontWeight: 'bold', minWidth: 120 }}
                  >
                    Должность
                  </TableCell>
                  <TableCell
                    sx={{ color: 'white', fontWeight: 'bold', minWidth: 160 }}
                  >
                    Звание
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: 'white', fontWeight: 'bold', minWidth: 150 }}
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
                  <TableCell
                    sx={{ color: 'white', fontWeight: 'bold', minWidth: 200 }}
                  >
                    Награды
                  </TableCell>
                  <TableCell sx={{ width: 50 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((user, index) => (
                  <DesktopUserRow
                    key={user.id}
                    user={user}
                    index={index}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    expandedUser={expandedUser}
                    toggleExpandUser={toggleExpandUser}
                    theme={theme}
                  />
                ))}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>
    </Box>
  )
}

export default memo(RatingTable)
