import React from 'react'
import {
  Card,
  Grid2,
  CardContent,
  Typography,
  Container,
  Button,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material'

import KnowBaseHeader from './KnowBaseHeader'

const legalDocuments = [
  {
    id: 1,
    title: 'Конституция Российской Федерации',
    description:
      'Основной закон Российской Федерации, обладающий высшей юридической силой.',
    date: '12.12.1993',
  },
  {
    id: 2,
    title: 'Гражданский кодекс РФ',
    description:
      'Кодифицированный федеральный закон, регулирующий гражданско-правовые отношения.',
    date: '30.11.1994',
  },
  {
    id: 3,
    title: 'Налоговый кодекс РФ',
    description:
      'Основной законодательный акт, регулирующий налогообложение в России.',
    date: '31.07.1998',
  },
  {
    id: 4,
    title: 'Трудовой кодекс РФ',
    description:
      'Основной источник трудового права, регулирующий отношения между работниками и работодателями.',
    date: '30.12.2001',
  },
  {
    id: 5,
    title: "Федеральный закон 'О персональных данных'",
    description: 'Регулирует обработку персональных данных операторами.',
    date: '27.07.2006',
  },
  {
    id: 6,
    title: "Федеральный закон 'О защите прав потребителей'",
    description:
      'Регулирует отношения между потребителями и изготовителями, исполнителями, продавцами.',
    date: '07.02.1992',
  },
]
function KnowBasePageDocs() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Мемоизированные стили для оптимизации
  const cardStyles = {
    height: '320px',
    width: '340px',
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
    m: '0 auto', // Центрирование карточки
  }

  const titleStyles = {
    fontWeight: 600,
    minHeight: '72px',
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.dark,
    fontSize: isMobile ? '1.1rem' : '1.25rem',
    lineHeight: 1.3,
  }

  const descriptionStyles = {
    mb: 3,
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    fontSize: isMobile ? '0.9rem' : '1rem',
  }

  const buttonStyles = {
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
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <KnowBaseHeader title="Нормативно-правовые документы" />

      <Grid2 container spacing={4} justifyContent="center">
        {legalDocuments.map((document) => (
          <Grid2 key={document.id} size={{ xs: 12, sm: 6, md: 6, lg: 6 }}>
            <Card sx={cardStyles}>
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
                  sx={titleStyles}
                >
                  {document.title}
                </Typography>

                <Box
                  sx={{
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
                  }}
                >
                  {document.date}
                </Box>

                <Typography variant="body1" sx={descriptionStyles}>
                  {document.description}
                </Typography>
              </CardContent>

              <Box sx={{ px: 2, pb: 2, display: 'flex' }}>
                <Button
                  variant="contained"
                  size={isMobile ? 'small' : 'medium'}
                  sx={buttonStyles}
                  onClick={() =>
                    console.log(`Открыт документ: ${document.title}`)
                  }
                >
                  Подробнее
                </Button>
              </Box>
            </Card>
          </Grid2>
        ))}
      </Grid2>
    </Container>
  )
}

export default React.memo(KnowBasePageDocs)
