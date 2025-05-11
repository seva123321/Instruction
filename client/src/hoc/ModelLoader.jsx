import { useState, useEffect } from 'react'
import { useGetModelQuery } from '../slices/gameApi'
import { useGLTF } from '@react-three/drei'
import LoadingIndicator from './LoadingIndicator'

const ModelLoader = ({ modelPath, children, ...props }) => {
  const { data: modelBlob, isLoading, isError } = useGetModelQuery(modelPath)
  const [modelUrl, setModelUrl] = useState(null)

  // Создаем и очищаем URL для blob
  useEffect(() => {
    if (!modelBlob) return

    const url = URL.createObjectURL(modelBlob)
    setModelUrl(url)

    return () => {
      URL.revokeObjectURL(url)
      setModelUrl(null)
    }
  }, [modelBlob])

  // Загружаем модель через useGLTF
  const { scene } = useGLTF(modelUrl || '') // Пустая строка как fallback

  if (isLoading) return <LoadingIndicator />
  if (isError) return <ErrorIndicator message="Failed to load model" />
  if (!modelUrl || !scene) return null

  // Рендерим children с загруженной моделью
  return children(scene, props)
}

export default ModelLoader
