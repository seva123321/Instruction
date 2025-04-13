import React from 'react'
import {
  Alert,
  Collapse,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

function QuestionFeedback({
  showFeedback,
  isCorrect,
  explanation,
  referenceLink,
  onClose,
}) {
  if (!showFeedback) return null

  return (
    <Collapse in={showFeedback}>
      <Alert
        severity={isCorrect ? 'success' : 'error'}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={onClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        {isCorrect ? 'Правильно!' : 'Неправильно!'}
      </Alert>

      {!isCorrect && explanation && (
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Объяснение:
          </Typography>
          <Typography
            variant="body2"
            dangerouslySetInnerHTML={{ __html: explanation }}
          />

          {(referenceLink[0]?.source !== '' ||
            referenceLink[0]?.title !== '') && (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Ссылки для изучения:
              </Typography>

              <List dense sx={{ py: 0 }}>
                {referenceLink.map((link) => (
                  <ListItem
                    key={link.source}
                    sx={{
                      py: 0.5,
                      px: 0,
                    }}
                  >
                    <a
                      href={link.source}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.title}
                    </a>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      )}
    </Collapse>
  )
}

export default React.memo(QuestionFeedback)
