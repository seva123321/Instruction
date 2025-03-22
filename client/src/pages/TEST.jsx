import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

import { faceDescriptorMy } from '../service/constValues'

function FaceRecognition({ referenceDescriptor = faceDescriptorMy }) {
  const videoRef = useRef(null)
  const [closestDescriptor, setClosestDescriptor] = useState(null) // Дескриптор ближайшего лица
  const [message, setMessage] = useState('') // Состояние для сообщения
  const [comparisonResult, setComparisonResult] = useState(null) // Результат сравнения
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false) // Разрешение на использование камеры
  const [cameraSupported, setCameraSupported] = useState(true) // Поддержка камеры устройством
  const descriptorsRef = useRef([]) // Используем useRef для хранения дескрипторов

  // Проверка поддержки камеры
  const checkCameraSupport = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasCamera = devices.some((device) => device.kind === 'videoinput')
      setCameraSupported(hasCamera) // Устанавливаем, поддерживается ли камера
      if (!hasCamera) {
        setMessage('Ваше устройство не поддерживает камеру.')
      }
    } catch (error) {
      console.error('Ошибка при проверке поддержки камеры:', error)
      setCameraSupported(false)
      setMessage('Не удалось проверить поддержку камеры.')
    }
  }

  // Загружаем модели
  const loadModels = async () => {
    try {
      const MODEL_URL = '/modelFaceApi' // Путь к моделям
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      //   console.log('Модели загружены')
    } catch (error) {
      console.error('Ошибка при загрузке моделей:', error)
    }
  }

  // Запрос разрешения на использование камеры и запуск видеопотока
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
      videoRef.current.srcObject = stream
      setCameraPermissionGranted(true) // Разрешение предоставлено
      setMessage('') // Очищаем сообщение об ошибке
      //   console.log('Видеопоток запущен')
    } catch (error) {
      setCameraPermissionGranted(false) // Разрешение отклонено
      setMessage(
        'Доступ к камере отклонён. Пожалуйста, разрешите доступ к камере.'
      )
      console.error('Ошибка при запуске видеопотока:', error)
    }
  }

  // Остановка видеопотока
  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop()) // Останавливаем все треки
      videoRef.current.srcObject = null // Очищаем ссылку на поток
      //   console.log('Видеопоток остановлен')
    }
  }

  // Сравнение дескрипторов по евклидову расстоянию
  const compareDescriptors = (descriptor1, descriptor2, threshold = 0.6) => {
    if (!descriptor1 || !descriptor2) return null

    const distance = faceapi.euclideanDistance(descriptor1, descriptor2)
    // console.log('Евклидово расстояние:', distance)

    if (distance < threshold) {
      return 'Это один и тот же человек!'
    }
    return 'Это разные люди!'
  }

  // Обработка видео
  const handleVideoPlay = async () => {
    const video = videoRef.current

    // Проверяем, что видео загружено и имеет ненулевые размеры
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Видео не загружено или имеет нулевые размеры')
      return
    }

    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = {
      width: video.videoWidth,
      height: video.videoHeight,
    }
    faceapi.matchDimensions(canvas, displaySize)

    const interval = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()

      // Находим лицо с наибольшим bounding box (ближайшее к камере)
      let closestFace = null
      let maxArea = 0

      detections.forEach((detection) => {
        const { box } = detection.detection
        const area = box.width * box.height // Площадь bounding box
        if (area > maxArea) {
          maxArea = area
          closestFace = detection
        }
      })

      // Если найдено ближайшее лицо
      if (closestFace) {
        const { descriptor } = closestFace // Дескриптор ближайшего лица
        descriptorsRef.current.push(descriptor) // Сохраняем дескриптор в useRef

        // Если собрано 5 дескрипторов
        if (descriptorsRef.current.length >= 5) {
          clearInterval(interval) // Останавливаем интервал
          stopVideo() // Останавливаем видеопоток

          // Усредняем дескрипторы
          const averagedDescriptor = averageDescriptors(descriptorsRef.current)
          setClosestDescriptor(averagedDescriptor) // Сохраняем усреднённый дескриптор

          // Сравниваем с эталонным дескриптором
          if (referenceDescriptor) {
            const result = compareDescriptors(
              averagedDescriptor,
              referenceDescriptor
            )
            setComparisonResult(result)
          }

          setMessage('Образ создан успешно!') // Выводим сообщение
          //   console.log(
          //     'Усреднённый дескриптор ближайшего лица:',
          //     averagedDescriptor
          //   )
        }
      }

      // Очищаем canvas и рисуем текущие обнаружения
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, detections)
      faceapi.draw.drawFaceLandmarks(canvas, detections)
    }, 100)
  }

  // Усреднение дескрипторов
  const averageDescriptors = (descriptors) => {
    if (descriptors.length === 0) return null

    const descriptorLength = descriptors[0].length // Длина дескриптора (128 или 512)
    const averagedDescriptor = new Array(descriptorLength).fill(0) // Инициализируем массив нулями

    // Суммируем все дескрипторы
    descriptors.forEach((descriptor) => {
      descriptor.forEach((value, index) => {
        averagedDescriptor[index] += value
      })
    })

    // Делим на количество дескрипторов для усреднения
    return averagedDescriptor.map((value) => value / descriptors.length)
  }

  // Повторный запрос доступа к камере
  const requestCameraAccess = async () => {
    await startVideo()
  }

  useEffect(() => {
    ;(async () => {
      await checkCameraSupport() // Проверяем поддержку камеры
      if (cameraSupported) {
        await loadModels()
        await startVideo()
      }
    })()

    const video = videoRef.current
    if (video && cameraPermissionGranted) {
      video.addEventListener('play', handleVideoPlay)
    }

    return () => {
      if (video) {
        video.removeEventListener('play', handleVideoPlay)
      }
    }
  }, [cameraPermissionGranted, cameraSupported])

  return (
    <div>
      <h1>Face Recognition</h1>
      {!cameraSupported && <p style={{ color: 'red' }}>{message}</p>}
      {!cameraPermissionGranted && cameraSupported && (
        <div>
          <p style={{ color: 'red' }}>{message}</p>
          <button onClick={requestCameraAccess}>
            Разрешить доступ к камере
          </button>
        </div>
      )}
      {cameraPermissionGranted && message && (
        <p style={{ color: 'green' }}>{message}</p>
      )}
      {closestDescriptor && (
        <div>
          <h3>Усреднённый дескриптор ближайшего лица:</h3>
          {/* {console.log('closestDescriptor > ', closestDescriptor)} */}
          <pre>{JSON.stringify(closestDescriptor, null, 2)}</pre>
        </div>
      )}
      {comparisonResult && (
        <div>
          <h3>Результат сравнения:</h3>
          <p>{comparisonResult}</p>
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        muted // Добавьте muted для автоматического воспроизведения
        style={{
          width: '640px',
          height: '480px',
          display: message ? 'none' : 'block',
        }} // Скрываем видео после завершения
      />
    </div>
  )
}

export default FaceRecognition
