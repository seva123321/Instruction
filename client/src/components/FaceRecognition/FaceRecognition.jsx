/* eslint-disable operator-linebreak */

/* eslint-disable operator-linebreak */
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  memo,
} from 'react'
import * as faceapi from 'face-api.js'
import { Typography, Container, CircularProgress, Box } from '@mui/material'

import VideoContainer from '@/components/VideoContainer'
import MessageAlert from '@/components/MessageAlert'

const loadModelsOnce = (() => {
  let modelsLoaded = false
  let loadingPromise = null

  return async () => {
    if (modelsLoaded) return true
    if (loadingPromise) return loadingPromise

    loadingPromise = (async () => {
      try {
        const MODEL_URL = '/modelFaceApi'
        const loadOptions = {
          fetch: (url, options) =>
            fetch(url, { ...options, cache: 'force-cache' }),
        }

        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL, loadOptions),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(
            MODEL_URL,
            loadOptions
          ),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL, loadOptions),
        ])

        modelsLoaded = true
        return true
      } catch (error) {
        console.error('Failed to load models:', error)
        throw error
      }
    })()

    return loadingPromise
  }
})()

const FaceRecognition = forwardRef(
  ({ onClose, referenceDescriptor, onFaceDescriptor, onCameraError }, ref) => {
    const videoRef = useRef(null)
    const animationFrameRef = useRef(null)
    const [isLoadedModel, setIsLoadedModel] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [comparisonResult, setComparisonResult] = useState(null)
    const [cameraPermissionGranted, setCameraPermissionGranted] =
      useState(false)
    const [cameraSupported, setCameraSupported] = useState(true)
    const descriptorsRef = useRef([])

    const detectorOptions = useRef(
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 256,
        scoreThreshold: 0.5,
      })
    )

    const cleanupResources = useCallback(() => {
      // Останавливаем видео и анимацию
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      setIsProcessing(false)
    }, [])

    const safeClose = useCallback(() => {
      cleanupResources()
      onClose()
    }, [cleanupResources, onClose])

    const showErrorAndClose = useCallback(
      (errorMessage) => {
        setMessage({
          text: errorMessage,
          type: 'error',
        })
        setTimeout(safeClose, 1000) // Закрываем через 1 секунду после показа ошибки
      },
      [safeClose]
    )

    const checkCameraSupport = useCallback(async () => {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) {
          throw new Error('Camera API not supported')
        }

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
        showErrorAndClose('Не удалось проверить поддержку камеры.')
      }
    }, [showErrorAndClose])

    const loadModels = useCallback(async () => {
      try {
        setIsLoadedModel(false)
        await loadModelsOnce()
        setIsLoadedModel(true)
      } catch (error) {
        showErrorAndClose('Ошибка при загрузке моделей распознавания.')
      }
    }, [showErrorAndClose])

    const startVideo = useCallback(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 480 },
            height: { ideal: 640 },
            facingMode: 'user',
            frameRate: { ideal: 24 },
          },
        })

        videoRef.current.srcObject = stream
        setCameraPermissionGranted(true)
        setMessage({ text: '', type: '' })
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          const errorMessage =
            'Доступ к камере отклонён. Пожалуйста, разрешите доступ к камере.'
          setMessage({ text: errorMessage, type: 'warning' })
          onCameraError(new Error(errorMessage))
        } else {
          showErrorAndClose('Произошла ошибка при доступе к камере.')
        }
      }
    }, [onCameraError, showErrorAndClose])

    const stopVideo = useCallback(() => {
      cleanupResources()
    }, [cleanupResources])

    const compareDescriptors = useCallback(
      (descriptor1, descriptor2, threshold = 0.6) => {
        if (!descriptor1 || !descriptor2) return null
        return faceapi.euclideanDistance(descriptor1, descriptor2) < threshold
          ? 'Это один и тот же человек!'
          : 'Это разные люди!'
      },
      []
    )

    const averageDescriptors = useCallback((descriptors) => {
      if (!descriptors || descriptors.length === 0) {
        console.error('Получен пустой массив дескрипторов')
        return null
      }

      const validDescriptors = descriptors.filter(
        (desc) => desc && Array.isArray(desc) && desc.length === 128
      )

      if (validDescriptors.length === 0) {
        console.error('Нет валидных дескрипторов')
        return null
      }

      const averagedDescriptor = new Float32Array(128).fill(0)

      validDescriptors.forEach((descriptor) => {
        for (let i = 0; i < 128; i++) {
          averagedDescriptor[i] += descriptor[i]
        }
      })

      for (let i = 0; i < 128; i++) {
        averagedDescriptor[i] /= validDescriptors.length
      }

      return Array.from(averagedDescriptor)
    }, [])

    const handleVideoPlay = useCallback(async () => {
      const video = videoRef.current
      if (!video || video.videoWidth === 0) return

      setIsProcessing(true)
      let frameCount = 0
      const maxFrames = 30

      const processFrame = async () => {
        try {
          frameCount++
          if (frameCount > maxFrames) {
            showErrorAndClose('Не удалось распознать лицо.')
            return
          }

          const detections = await faceapi
            .detectAllFaces(video, detectorOptions.current)
            .withFaceLandmarks(true)
            .withFaceDescriptors()

          if (detections.length > 0 && detections[0].descriptor) {
            const descriptor = detections[0].descriptor

            if (
              !Array.isArray(descriptor) &&
              descriptor instanceof Float32Array
            ) {
              descriptorsRef.current.push(Array.from(descriptor))
            } else if (Array.isArray(descriptor) && descriptor.length === 128) {
              descriptorsRef.current.push(descriptor)
            } else {
              console.warn('Неверный формат дескриптора:', descriptor)
            }

            if (descriptorsRef.current.length >= 3) {
              const averagedDescriptor = averageDescriptors(
                descriptorsRef.current
              )

              if (!averagedDescriptor) {
                throw new Error('Не удалось создать усредненный дескриптор')
              }

              onFaceDescriptor(averagedDescriptor)

              if (referenceDescriptor) {
                if (
                  !Array.isArray(referenceDescriptor) ||
                  referenceDescriptor.length !== 128
                ) {
                  console.error(
                    'Неверный формат эталонного дескриптора:',
                    referenceDescriptor
                  )
                  throw new Error(
                    'Эталонный дескриптор должен быть массивом из 128 чисел'
                  )
                }

                setComparisonResult(
                  compareDescriptors(averagedDescriptor, referenceDescriptor)
                )
              }

              setMessage({ text: 'Лицо распознано!', type: 'success' })
              setTimeout(safeClose, 800)
              return
            }
          }

          animationFrameRef.current = requestAnimationFrame(processFrame)
        } catch (error) {
          console.error('Ошибка обработки:', error)
          showErrorAndClose(error.message || 'Ошибка обработки видео.')
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame)
    }, [
      averageDescriptors,
      compareDescriptors,
      onFaceDescriptor,
      referenceDescriptor,
      safeClose,
      showErrorAndClose,
    ])

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
        showErrorAndClose(
          error.message || 'Произошла ошибка при запуске распознавания.'
        )
      }
    }, [
      checkCameraSupport,
      cameraSupported,
      loadModels,
      startVideo,
      showErrorAndClose,
    ])

    useImperativeHandle(ref, () => ({
      startRecognition,
    }))

    useEffect(() => {
      if (!cameraPermissionGranted) return

      const video = videoRef.current
      video?.addEventListener('play', handleVideoPlay)

      return () => {
        video?.removeEventListener('play', handleVideoPlay)
        cleanupResources()
      }
    }, [cameraPermissionGranted, handleVideoPlay, cleanupResources])

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
        {!isLoadedModel ? (
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
        ) : (
          <>
            {message.text && <MessageAlert message={message} />}

            {isProcessing && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <CircularProgress
                  sx={{ color: 'white', display: 'block', m: '0 auto' }}
                />
                <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                  {`Распознавание образа... (${descriptorsRef.current.length + 1}/3)`}
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
          </>
        )}
      </Box>
    )
  }
)

export default memo(FaceRecognition)
