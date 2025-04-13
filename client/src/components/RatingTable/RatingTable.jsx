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
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}))

const RankBadge = styled(Chip)(({ theme }) => ({
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  '& .MuiChip-avatar': {
    width: 24,
    height: 24,
  },
}))

function RatingTable({ data }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!data?.results) return <Typography>Загрузка данных...</Typography>

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        maxWidth: '100%',
        overflowX: 'auto',
      }}
    >
      <Table aria-label="rating table" size={isMobile ? 'small' : 'medium'}>
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
              Участник
            </TableCell>
            {!isMobile && (
              <>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Должность
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                  Звание
                </TableCell>
              </>
            )}
            <TableCell
              align="right"
              sx={{ color: 'white', fontWeight: 'bold' }}
            >
              Очки опыта
            </TableCell>
            {!isMobile && (
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                Награды
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.results.map((user, index) => (
            <StyledTableRow key={user.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
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
              {!isMobile && (
                <TableCell>{user.position || 'Не указано'}</TableCell>
              )}
              {!isMobile && (
                <TableCell>
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
              )}
              <TableCell align="right">
                <Chip
                  label={user.experience_points}
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                />
              </TableCell>
              {!isMobile && (
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {user.badges?.map((badge) => (
                      <RankBadge
                        key={badge.id}
                        avatar={<Avatar src={badge.icon} alt={badge.name} />}
                        label={badge.name}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                    {!user.badges?.length && (
                      <Typography variant="caption" color="text.secondary">
                        Нет наград
                      </Typography>
                    )}
                  </Box>
                </TableCell>
              )}
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default RatingTable
