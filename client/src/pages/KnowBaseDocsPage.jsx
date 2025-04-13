import { memo, useMemo } from 'react'
import {
  Card,
  Grid,
  CardContent,
  Typography,
  Container,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material'

import KnowBaseHeader from '@/components/KnowBaseHeader'
import { useGetKnowladgeNLAsQuery } from '@/slices/knowladgeApi'

function KnowBasePageDocs() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { data: documents, isError, isLoading } = useGetKnowladgeNLAsQuery()

  const styles = useMemo(
    () => ({
      card: {
        height: '320px',
        width: isMobile ? '320px' : '360px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[6],
        },
        borderRadius: '12px',
        boxShadow: theme.shadows[3],
        background: 'linear-gradient(to bottom, #ffffff, #f9f9f9)',
        overflow: 'hidden',
        m: '0 auto',
      },
      title: {
        fontWeight: 600,
        minHeight: '72px',
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.primary.dark,
        fontSize: isMobile ? '1.1rem' : '1.25rem',
        lineHeight: 1.3,
      },
      description: {
        color: theme.palette.text.secondary,
        lineHeight: 1.0,
        flexGrow: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        fontSize: isMobile ? '0.9rem' : '1rem',
      },
      dateBadge: {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
        display: 'inline-block',
        px: 1.5,
        py: 0.5,
        borderRadius: '4px',
        mb: 2,
        fontSize: '0.75rem',
        fontWeight: 600,
        alignSelf: 'flex-start',
      },
      button: {
        fontWeight: 600,
        letterSpacing: '0.5px',
        ml: 'auto',
        mb: 2,
        py: 1.5,
        borderRadius: '8px',
        background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
        transition: 'all 0.3s',
        width: isMobile ? '100%' : 'auto',
      },
    }),
    [theme, isMobile]
  )

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress size={50} />
      </Box>
    )
  }

  if (isError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">
          Ошибка загрузки документов. Попробуйте позже
        </Alert>
      </Container>
    )
  }

  if (!documents?.length) {
    return (
      <Container maxWidth="lg">
        <KnowBaseHeader title="Нормативно-правовые документы" />
        <Typography variant="h6" textAlign="center" mt={4}>
          Документы не найдены
        </Typography>
      </Container>
    )
  }

  return (
    <Container sx={{ p: 0 }} maxWidth="lg">
      <KnowBaseHeader title="Нормативно-правовые документы" />

      <Grid container spacing={4} justifyContent="center">
        {documents.map((document) => (
          <Grid key={document.id} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <Card sx={styles.card}>
              <CardContent
                sx={{
                  height: '260px',
                  flexGrow: 1,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  gutterBottom
                  variant="h5"
                  component="h2"
                  sx={styles.title}
                >
                  {document.title}
                </Typography>

                <Box sx={styles.dateBadge}>
                  {new Date(document.date).toLocaleDateString()}
                </Box>

                <Typography variant="body1" sx={styles.description}>
                  {document.description}
                </Typography>
              </CardContent>

              <Box sx={{ px: 2, pb: 2, display: 'flex' }}>
                <Button
                  component="a"
                  href={document.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  size={isMobile ? 'small' : 'medium'}
                  sx={styles.button}
                  download
                >
                  Открыть
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default memo(KnowBasePageDocs)
