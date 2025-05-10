import { useState, useRef, useEffect } from 'react'
import { FormHelperText } from '@mui/material'
import {
  CameraAlt as CameraAltIcon,
  PersonAddOutlined as PersonAddOutlinedIcon,
} from '@mui/icons-material'

import Confirm from '@/components/Confirm'
import FaceRecognition from '@/components/FaceRecognition'

function Recognition({
  onFaceDescriptor,
  onCameraError,
  btnIcon,
  buttonName = 'Распознавание лица*',
  disabled = false,
}) {
  const [showFaceRecognition, setShowFaceRecognition] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const faceRecognitionRef = useRef(null)

  useEffect(() => {
    if (showFaceRecognition && faceRecognitionRef.current) {
      faceRecognitionRef.current.startRecognition()
    }
  }, [showFaceRecognition])

  const handleAllowAccess = async () => {
    try {
      setShowFaceRecognition(true)
    } catch (error) {
      setCameraError(
        'Доступ к камере отклонён. Пожалуйста, разрешите доступ к камере.'
      )
      onCameraError(error)
    }
  }

  return (
    <>
      <Confirm
        disabledBtn={disabled}
        textTitle="Разрешение на использование камеры"
        text="Разрешить использование камеры для распознавания лица?"
        btnIcon={btnIcon ?? <PersonAddOutlinedIcon />}
        titleIcon={<CameraAltIcon sx={{ mr: 2 }} />}
        buttonName={buttonName}
        onAllowAccess={handleAllowAccess}
      />

      {cameraError && (
        <FormHelperText error sx={{ mt: 1 }}>
          {cameraError}
        </FormHelperText>
      )}

      {showFaceRecognition && (
        <FaceRecognition
          ref={faceRecognitionRef}
          onClose={() => setShowFaceRecognition(false)}
          onFaceDescriptor={(data) => {
            onFaceDescriptor(data)
          }}
          onCameraError={(error) => {
            setCameraError(error.message)
            onCameraError(error)
          }}
        />
      )}
    </>
  )
}

export default Recognition
