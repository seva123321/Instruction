import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormHelperText,
} from '@mui/material'
import DialogTitle from '@mui/material/DialogTitle'

export default function AlertDialog({
  text,
  textTitle,
  titleIcon,
  buttonName,
  btnIcon = '',
  onAllowAccess,
}) {
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setErrorMessage(
      'Доступ к камере отклонён. Пожалуйста, разрешите доступ к камере.'
    )
  }

  const handleAllowAccess = async () => {
    try {
      await onAllowAccess() // Вызываем переданную функцию
      setOpen(false)
      setErrorMessage('')
    } catch (error) {
      handleClose()
      setErrorMessage('Ошибка при запросе доступа к камере.')
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        type="button"
        fullWidth
        startIcon={btnIcon}
        size="large"
        onClick={handleClickOpen}
      >
        {buttonName}
      </Button>
      {errorMessage && (
        <FormHelperText error sx={{ mt: 1 }}>
          {errorMessage}
        </FormHelperText>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {titleIcon}
            {textTitle}
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAllowAccess}>Предоставить доступ</Button>
          <Button onClick={handleClose}>Не предоставлять</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
