import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import * as faceapi from 'face-api.js'
import { Typography, Container, CircularProgress, Box } from '@mui/material'

// import { faceDescriptorMy } from '../../service/constValues'
import VideoContainer from '../VideoContainer/VideoContainer'
import MessageAlert from '../MessageAlert/MessageAlert'

const FaceRecognition = forwardRef(
  ({ onClose, referenceDescriptor, onFaceDescriptor, onCameraError }, ref) => {
    const videoRef = useRef(null)
    const animationFrameRef = useRef(null)
    const [isLoadedModel, setIsLoadedModel] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState({
      text: '',
      type: '',
    })
    const [comparisonResult, setComparisonResult] = useState(null)
    // eslint-disable-next-line operator-linebreak
    const [cameraPermissionGranted, setCameraPermissionGranted] =
      useState(false)
    const [cameraSupported, setCameraSupported] = useState(true)
    const descriptorsRef = useRef([])

    // Проверка поддержки камеры
    const checkCameraSupport = useCallback(async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const hasCamera = devices.some((device) => device.kind === 'videoinput')
        setCameraSupported(hasCamera)
        if (!hasCamera) {
          setMessage({
            text: 'Ваше устройство не поддерживает камеру.',
            type: 'warning',
          })
        }
      } catch (error) {
        setCameraSupported(false)
        setMessage({
          text: 'Не удалось проверить поддержку камеры.',
          type: 'error',
        })
      }
    }, [])

    const loadModels = useCallback(async () => {
      try {
        const MODEL_URL = '/modelFaceApi'
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        setIsLoadedModel(true)
      } catch (error) {
        throw new Error('Ошибка при загрузке моделей.')
      }
    }, [])

    const startVideo = useCallback(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        videoRef.current.srcObject = stream
        // @TODO очистка если сначала камера блокирована, а потом разблокирована
        // onCameraError('')
        setCameraPermissionGranted(true)
        setMessage({
          text: '',
          type: '',
        })
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          setCameraPermissionGranted(false)
          // eslint-disable-next-line operator-linebreak
          const errorMessage =
            'Доступ к камере отклонён. Пожалуйста, разрешите доступ к камере.'
          setMessage({
            text: errorMessage,
            type: 'warning',
          })
          onCameraError(new Error(errorMessage)) // Передаем ошибку в родительский компонент
          onClose() // Закрываем компонент
        } else {
          setMessage({
            text: 'Произошла ошибка при доступе к камере.',
            type: 'error',
          })
        }
        throw error
      }
    }, [onClose, onCameraError])

    const stopVideo = useCallback(() => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
    }, [])
    // Сравнение дескрипторов по евклидову расстоянию
    const compareDescriptors = useCallback(
      (descriptor1, descriptor2, threshold = 0.6) => {
        if (!descriptor1 || !descriptor2) return null
        const distance = faceapi.euclideanDistance(descriptor1, descriptor2)
        return distance < threshold
          ? 'Это один и тот же человек!'
          : 'Это разные люди!'
      },
      []
    )
    // Усреднение дескрипторов
    const averageDescriptors = useCallback((descriptors) => {
      if (!descriptors || descriptors.length === 0) return null
      const descriptorLength = descriptors[0].length
      const averagedDescriptor = new Array(descriptorLength).fill(0)

      descriptors.forEach((descriptor) => {
        if (descriptor && descriptor.length === descriptorLength) {
          descriptor.forEach((value, index) => {
            averagedDescriptor[index] += value
          })
        }
      })

      return averagedDescriptor.map((value) => value / descriptors.length)
    }, [])

    // Обработка видео
    const handleVideoPlay = useCallback(async () => {
      const video = videoRef.current
      if (video.videoWidth === 0 || video.videoHeight === 0) return

      setIsProcessing(true)

      const processFrame = async () => {
        try {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors()

          // Находим лицо с наибольшим bounding box (ближайшее к камере)
          let closestFace = null
          let maxArea = 0

          detections.forEach((detection) => {
            const { box } = detection.detection
            const area = box.width * box.height
            if (area > maxArea) {
              maxArea = area
              closestFace = detection
            }
          })

          if (closestFace) {
            const { descriptor } = closestFace
            descriptorsRef.current.push(descriptor)

            // Если собрано 5 дескрипторов
            if (descriptorsRef.current.length >= 5) {
              stopVideo()
              setIsProcessing(false)

              const averagedDescriptor = averageDescriptors(
                descriptorsRef.current
              )
              onFaceDescriptor(averagedDescriptor)

              // Сравниваем с эталонным дескриптором
              if (referenceDescriptor) {
                const result = compareDescriptors(
                  averagedDescriptor,
                  referenceDescriptor
                )
                setComparisonResult(result)
              }

              setMessage({
                text: 'Лицо распознано!',
                type: 'success',
              })

              setTimeout(() => onClose(), 1000)
              return
            }
          }
          // Запрашиваем следующий кадр
          animationFrameRef.current = requestAnimationFrame(processFrame)
        } catch (error) {
          setMessage({
            text: 'Произошла ошибка при обработке видео.',
            type: 'error',
          })
          stopVideo()
          setIsProcessing(false)
          onClose()
        }
      }

      // Запускаем обработку кадров
      animationFrameRef.current = requestAnimationFrame(processFrame)
    }, [
      stopVideo,
      onClose,
      averageDescriptors,
      onFaceDescriptor,
      referenceDescriptor,
      compareDescriptors,
    ])

    // Запуск процесса распознавания
    const startRecognition = useCallback(async () => {
      try {
        descriptorsRef.current = []
        await checkCameraSupport()
        if (!cameraSupported) {
          throw new Error('Камера не поддерживается устройством.')
        }
        await loadModels()
        await startVideo()
      } catch (error) {
        setMessage({
          text: error.message || 'Произошла ошибка при запуске распознавания.',
          type: 'error',
        })
        throw error
      }
    }, [loadModels, cameraSupported, checkCameraSupport, startVideo])
    // Используем useImperativeHandle для предоставления доступа к startRecognition
    useImperativeHandle(ref, () => ({
      startRecognition,
    }))

    useEffect(() => {
      if (cameraPermissionGranted) {
        const video = videoRef.current
        if (video) {
          video.addEventListener('play', handleVideoPlay)
        }

        return () => {
          if (video) {
            video.removeEventListener('play', handleVideoPlay)
          }
          stopVideo()
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
          }
        }
      }

      return () => {}
    }, [cameraPermissionGranted, handleVideoPlay, stopVideo])

    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 2000,
          backgroundColor: 'rgba(65, 101, 207, 0.77)',
        }}
      >
        {!isLoadedModel && (
          <Container
            sx={{
              height: '100vh',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress sx={{ color: 'white' }} size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Загрузка моделей...
            </Typography>
          </Container>
        )}

        {/* <Button
          type="button"
          size="large"
          variant="contained"
          onClick={onClose}
        >
          Закрыть
        </Button> */}

        {cameraPermissionGranted && message.text && (
          <MessageAlert message={message} />
        )}

        {isProcessing && (
          <Box
            sx={{
              width: '100%',
              mt: 2,
            }}
          >
            <CircularProgress
              sx={{
                color: 'white',
                display: 'block',
                m: '0 auto',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                mt: 1,
              }}
            >
              Распознавание образа...
            </Typography>
          </Box>
        )}

        {comparisonResult && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Результат сравнения:
            </Typography>
            <Typography variant="body1">{comparisonResult}</Typography>
          </Box>
        )}

        <VideoContainer videoRef={videoRef} />
      </Box>
    )
  }
)

export default FaceRecognition
