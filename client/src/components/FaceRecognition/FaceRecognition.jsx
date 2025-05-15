/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-assign */
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

// Константы для конфигурации
const MODEL_URL = '/modelFaceApi'
const DETECTOR_OPTIONS = {
  inputSize: 256,
  scoreThreshold: 0.5,
}
const BLINK_CONFIG = {
  cooldown: 500, // 0.5s между морганиями
  earThreshold: 0.25, // Порог закрытого глаза
  requiredCount: 1, // Количество морганий для завершения
}


const loadModelsOnce = (() => {
  let modelsLoaded = false
  let loadingPromise = null

  return async () => {
    if (modelsLoaded) return true
    if (loadingPromise) return loadingPromise

    loadingPromise = (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ])
        modelsLoaded = true
        return true
      } catch (error) {
        throw new Error(error.message)
      }
    })()

    return loadingPromise
  }
})()

const FaceRecognition = forwardRef(
  ({ onClose, onFaceDescriptor, onCameraError }, ref) => {
    // useState
    const [isLoadedModel, setIsLoadedModel] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [cameraPermissionGranted, setCameraPermissionGranted] =
      useState(false)
    const [blinkCount, setBlinkCount] = useState(0)
    const [videoSize, setVideoSize] = useState({ width: 0, height: 0 })
    // useRef
    const videoRef = useRef(null)
    const animationFrameRef = useRef(null)
    const blinkCountRef = useRef(blinkCount)
    const descriptorsRef = useRef([])
    const detectorOptions = useRef(
      new faceapi.TinyFaceDetectorOptions({
        inputSize: DETECTOR_OPTIONS.inputSize,
        scoreThreshold: DETECTOR_OPTIONS.scoreThreshold,
      })
    )

    useEffect(() => {
      blinkCountRef.current = blinkCount
    }, [blinkCount])

    // Рассчет коэффициента открытости глаза
    const calculateEyeAspectRatio = useCallback((eyeLandmarks) => {
      const [p0, p1, p2, p3, p4, p5] = eyeLandmarks.map((p) => ({
        x: p._x,
        y: p._y,
      }))
      const vertical =
        (Math.hypot(p1.x - p5.x, p1.y - p5.y) +
          Math.hypot(p2.x - p4.x, p2.y - p4.y)) /
        2
      const horizontal = Math.hypot(p0.x - p3.x, p0.y - p3.y)
      return vertical / horizontal
    }, [])

    const cleanupResources = useCallback(() => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }, [])

    const safeClose = useCallback(() => {
      cleanupResources()
      onClose?.()
    }, [cleanupResources, onClose])

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
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          setMessage({
            text: 'Доступ к камере отклонён. Пожалуйста, разрешите доступ к камере.',
            type: 'warning',
          })
          onCameraError?.(new Error('Camera access denied'))
        } else {
          setMessage({
            text: 'Произошла ошибка при доступе к камере.',
            type: 'error',
          })
        }
      }
    }, [onCameraError])

    const averageDescriptors = useCallback((descriptors) => {
      if (!descriptors?.length) return null

      const valid = descriptors.filter((d) => d?.length === 128)
      if (!valid.length) return null

      const result = new Float32Array(128)
      valid.forEach((d) => d.forEach((val, i) => (result[i] += val)))
      result.forEach((val, i) => (result[i] = val / valid.length))

      return Array.from(result)
    }, [])

    const handleVideoPlay = useCallback(async () => {
      const video = videoRef.current
      if (!video || video.videoWidth === 0) return

      setVideoSize({
        width: video.videoWidth,
        height: video.videoHeight,
      })
      let lastBlinkTime = 0

      const processFrame = async () => {
        try {
          const detections = await faceapi
            .detectAllFaces(video, detectorOptions.current)
            .withFaceLandmarks(true)
            .withFaceDescriptors() // Добавляем запрос дескрипторов

          if (detections.length === 0) {
            animationFrameRef.current = requestAnimationFrame(processFrame)
            return
          }

          const detection = detections[0]

          const qualityIndicator = detection.detection._score
          if (qualityIndicator < 0.8) {
            setMessage({
              text: 'Подвиньтесь ближе или улучшите освещение',
              type: 'warning',
            })
          }

          // Проверяем моргание
          const { landmarks } = detection
          const leftEAR = calculateEyeAspectRatio(landmarks.getLeftEye())
          const rightEAR = calculateEyeAspectRatio(landmarks.getRightEye())
          const avgEAR = (leftEAR + rightEAR) / 2

          if (avgEAR < BLINK_CONFIG.earThreshold) {
            const now = Date.now()
            if (now - lastBlinkTime > BLINK_CONFIG.cooldown) {
              const newCount = blinkCountRef.current + 1
              blinkCountRef.current = newCount
              setBlinkCount(newCount)
              lastBlinkTime = now

              // Сохраняем дескриптор только при моргании
              if (detection.descriptor) {
                descriptorsRef.current.push(Array.from(detection.descriptor))
              }

              // Проверяем достижение нужного количества морганий
              if (newCount >= BLINK_CONFIG.requiredCount) {
                const avgDescriptor = averageDescriptors(descriptorsRef.current)
                if (avgDescriptor) {
                  onFaceDescriptor?.(avgDescriptor)
                  setMessage({ text: 'Проверка пройдена!', type: 'success' })
                  setTimeout(safeClose, 800)
                  return
                }
              }
            }
          }

          animationFrameRef.current = requestAnimationFrame(processFrame)
        } catch (error) {
          setMessage({ text: 'Ошибка обработки видео', type: 'error' })
          // Продолжаем обработку несмотря на ошибку
          animationFrameRef.current = requestAnimationFrame(processFrame)
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame)
    }, [
      averageDescriptors,
      onFaceDescriptor,
      safeClose,
      calculateEyeAspectRatio,
    ])
    const startRecognition = useCallback(async () => {
      try {
        await loadModelsOnce()
        setIsLoadedModel(true)
        await startVideo()
      } catch (error) {
        setMessage({ text: error.message, type: 'error' })
      }
    }, [startVideo])

    useImperativeHandle(ref, () => ({
      startRecognition,
    }))

    useEffect(() => {
      if (!cameraPermissionGranted) return

      const video = videoRef.current
      video?.addEventListener('play', handleVideoPlay)

      // eslint-disable-next-line consistent-return
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

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <CircularProgress size={20} color="white" />
              <Typography variant="h5">Пожалуйста, снимите очки.</Typography>
              <Typography variant="body1">
                Лицо должно занимать не менее 30% кадра.
              </Typography>
              {/* <Typography variant="h6">
                Снимите очки! Моргните 3 раза: {blinkCount}/3
              </Typography> */}
            </Box>

            <VideoContainer videoRef={videoRef} />
          </>
        )}
      </Box>
    )
  }
)

export default memo(FaceRecognition)
