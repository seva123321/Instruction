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

const LIVENESS_ACTIONS = [
  { text: 'Поверните голову влево', key: 'turnLeft' },
  { text: 'Поверните голову вправо', key: 'turnRight' },
  { text: 'Поверните голову влево и вправо', key: 'turnBoth' },
]

const THRESHOLDS = {
  HEAD_TURN_ANGLE: 3, // Угол поворота головы в градусах
  MIN_TURN_DURATION: 500, // Минимальное время удержания поворота (мс)
  DESCRIPTORS_COUNT: 3, // Количество собираемых дескрипторов
}

const FaceRecognition = forwardRef(
  ({ onClose, onFaceDescriptor, onCameraError }, ref) => {
    const videoRef = useRef(null)
    const animationFrameRef = useRef(null)
    const [isLoadedModel, setIsLoadedModel] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [cameraPermissionGranted, setCameraPermissionGranted] =
      useState(false)
    const [cameraSupported, setCameraSupported] = useState(true)
    const descriptorsRef = useRef([])
    const [currentAction, setCurrentAction] = useState(null)

    const detectorOptions = useRef(
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 256,
        scoreThreshold: 0.5,
      })
    )

    const actionState = useRef({
      completed: false,
      initialHeadAngle: null,
      leftTurnCompleted: false,
      rightTurnCompleted: false,
      lastTurnTime: 0,
    })

    // Инициализация случайного действия (поворот влево, вправо или оба)
    const initializeAction = useCallback(() => {
      const randomAction =
        LIVENESS_ACTIONS[Math.floor(Math.random() * LIVENESS_ACTIONS.length)]
      setCurrentAction(randomAction)
      resetActionState()
    }, [])

    const resetActionState = () => {
      actionState.current = {
        completed: false,
        initialHeadAngle: null,
        leftTurnCompleted: false,
        rightTurnCompleted: false,
        lastTurnTime: 0,
      }
    }

    // Расчет угла поворота головы по landmarks
    const calculateHeadAngle = useCallback((jawline) => {
      const left = jawline[0]
      const right = jawline[16]
      const dx = right.x - left.x
      const dy = right.y - left.y
      return Math.atan2(dy, dx) * (180 / Math.PI) // Конвертируем в градусы
    }, [])

    // Проверка выполнения действия (поворот головы)
    const checkActionCompletion = useCallback(
      (landmarks) => {
        const state = actionState.current
        if (state.completed) return true

        const jawline = landmarks.getJawOutline()
        const currentAngle = calculateHeadAngle(jawline)
        const now = Date.now()

        // Инициализация начального угла
        if (state.initialHeadAngle === null) {
          state.initialHeadAngle = currentAngle
          return false
        }

        const angleDiff = currentAngle - state.initialHeadAngle
        const absAngleDiff = Math.abs(angleDiff)
        console.log('absAngleDiff (degrees) > ', absAngleDiff)

        // Проверка поворота влево
        if (
          angleDiff < -THRESHOLDS.HEAD_TURN_ANGLE &&
          !state.leftTurnCompleted
        ) {
          if (now - state.lastTurnTime > THRESHOLDS.MIN_TURN_DURATION) {
            state.leftTurnCompleted = true
            state.lastTurnTime = now
            console.log('Left turn completed')
          }
        }
        // Проверка поворота вправо
        else if (
          angleDiff > THRESHOLDS.HEAD_TURN_ANGLE &&
          !state.rightTurnCompleted
        ) {
          if (now - state.lastTurnTime > THRESHOLDS.MIN_TURN_DURATION) {
            state.rightTurnCompleted = true
            state.lastTurnTime = now
            console.log('Right turn completed')
          }
        }

        // Проверка завершения действия в зависимости от типа
        switch (currentAction?.key) {
          case 'turnLeft':
            state.completed = state.leftTurnCompleted
            break
          case 'turnRight':
            state.completed = state.rightTurnCompleted
            break
          case 'turnBoth':
            state.completed =
              state.leftTurnCompleted && state.rightTurnCompleted
            break
          default:
            state.completed = false
        }

        return state.completed
      },
      [currentAction, calculateHeadAngle]
    )

    const cleanupResources = useCallback(() => {
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
      onClose?.()
    }, [cleanupResources, onClose])

    const showErrorAndClose = useCallback(
      (errorMessage) => {
        setMessage({
          text: errorMessage,
          type: 'error',
        })
        setTimeout(safeClose, 1000)
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
          onCameraError?.(new Error(errorMessage))
        } else {
          showErrorAndClose('Произошла ошибка при доступе к камере.')
        }
      }
    }, [onCameraError, showErrorAndClose])

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
      resetActionState()

      const processFrame = async () => {
        try {
          const detections = await faceapi
            .detectAllFaces(video, detectorOptions.current)
            .withFaceLandmarks(true)
            .withFaceDescriptors()

          if (detections.length === 0) {
            animationFrameRef.current = requestAnimationFrame(processFrame)
            return
          }
          // debugger
          const detection = detections[0]
          const actionCompleted = checkActionCompletion(detection.landmarks)
          console.log('actionCompleted > ', actionCompleted)

          if (actionCompleted) {
            descriptorsRef.current.push(Array.from(detection.descriptor))

            if (descriptorsRef.current.length >= THRESHOLDS.DESCRIPTORS_COUNT) {
              const avgDescriptor = averageDescriptors(descriptorsRef.current)
              onFaceDescriptor?.(avgDescriptor)
              setMessage({ text: 'Проверка пройдена!', type: 'success' })
              setTimeout(safeClose, 800)
              return
            }
          }

          animationFrameRef.current = requestAnimationFrame(processFrame)
        } catch (error) {
          console.error('Ошибка обработки:', error)
          showErrorAndClose('Ошибка обработки видео')
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame)
    }, [
      averageDescriptors,
      checkActionCompletion,
      onFaceDescriptor,
      safeClose,
      showErrorAndClose,
    ])

    const startRecognition = useCallback(async () => {
      try {
        descriptorsRef.current = []
        await checkCameraSupport()
        if (!cameraSupported) throw new Error('Камера не поддерживается')

        await loadModels()
        await startVideo()
        initializeAction()
      } catch (error) {
        showErrorAndClose(error.message)
      }
    }, [
      checkCameraSupport,
      cameraSupported,
      loadModels,
      startVideo,
      initializeAction,
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

            {isProcessing && currentAction && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="h6">
                  Выполните действие: {currentAction.text}
                </Typography>
                <CircularProgress sx={{ color: 'white', mt: 2 }} />
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
