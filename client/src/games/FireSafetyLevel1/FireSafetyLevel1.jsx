/* eslint-disable react/no-unknown-property */
/* eslint-disable operator-linebreak */
import {
  useEffect,
  useRef,
  useState,
  Suspense,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  Environment,
  Sky,
  AdaptiveDpr,
  AdaptiveEvents,
} from '@react-three/drei'
import * as THREE from 'three'
import { Box } from '@mui/material'

import PowderExtinguisher from './PowderExtinguisher'
import FirePlane from '../CustomFire'

const CAMERA_HEIGHT_MULTIPLIER = 1.2
const CAMERA_DISTANCE_MULTIPLIER = 2.5
const MOBILE_CAMERA_DISTANCE_MULTIPLIER = 3

const FireSafetyLevel1 = forwardRef((props, ref) => {
  const [isMobile, setIsMobile] = useState(false)
  const [cameraSettings, setCameraSettings] = useState({
    position: [0, 5, 10],
    fov: 50,
  })
  const extinguisherRef = useRef()
  const controls = useRef()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      const isMobileCheck =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      setIsMobile(isMobileCheck)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    // Обработчик восстановления контекста WebGL
    const handleContextRestored = () => {
      console.log('WebGL context restored')
    }

    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('webglcontextrestored', handleContextRestored)
    }

    return () => {
      window.removeEventListener('resize', checkMobile)
      if (canvas) {
        canvas.removeEventListener(
          'webglcontextrestored',
          handleContextRestored
        )
      }
    }
  }, [])

  // Экспортируем методы через ref
  useImperativeHandle(ref, () => ({
    playAnimationSequence: () => {
      extinguisherRef.current?.playAnimationSequence?.()
    },
  }))

  useEffect(() => {
    if (!mounted || !extinguisherRef.current) return

    const calculateCameraPosition = () => {
      try {
        // Ждем пока модель полностью загрузится
        const checkModel = () => {
          if (extinguisherRef.current?.scene?.children?.length > 0) {
            const model = extinguisherRef.current.scene.children[0]
            const box = new THREE.Box3().setFromObject(model)
            const size = box.getSize(new THREE.Vector3()).length()
            const center = box.getCenter(new THREE.Vector3())

            const distanceMultiplier = isMobile
              ? MOBILE_CAMERA_DISTANCE_MULTIPLIER
              : CAMERA_DISTANCE_MULTIPLIER

            const distance = size * distanceMultiplier
            const height = size * CAMERA_HEIGHT_MULTIPLIER

            setCameraSettings({
              position: [center.x, center.y + height, center.z + distance],
              fov: 45,
            })

            if (controls.current) {
              controls.current.target.copy(center)
              controls.current.update()
            }
          } else {
            setTimeout(checkModel, 100)
          }
        }

        checkModel()
      } catch (error) {
        setCameraSettings({
          position: [0, 5, 10],
          fov: 50,
        })
        throw new Error('Error calculating camera position')
      }
    }

    calculateCameraPosition()
  }, [isMobile, mounted])


  const [isExtinguishing, setIsExtinguishing] = useState(false)
  
  const handleExtinguish = () => {
    setIsExtinguishing(true)
  }
  
  const handleFireExtinguished = () => {
    console.log('Огонь полностью потушен!')
  }

  const controlsSettings = {
    mobile: {
      minDistance: 1,
      maxDistance: 5,
      zoomSpeed: 0.5,
      touchSensitivity: 0.5,
    },
    desktop: {
      minDistance: 2,
      maxDistance: 8,
      zoomSpeed: 1,
      touchSensitivity: 1,
    },
  }

  if (!mounted) return null

  return (
    <Box sx={{ height: '80vh' }}>
      <Canvas
        camera={{
          ...cameraSettings,
          near: 0.1,
          far: 1000,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        onCreated={({ gl }) => {
          gl.getContext().canvas.addEventListener(
            'webglcontextlost',
            (e) => {
              console.warn('WebGL context lost')
              e.preventDefault()
            },
            false
          )
        }}
      >
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Sky />

          <ambientLight intensity={0.7} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.2}
            penumbra={1}
            intensity={1}
            castShadow
            shadow-mapSize={1024}
          />

          <Environment preset="city" />

          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.8} />
          </mesh>

          <PowderExtinguisher
            ref={extinguisherRef}
            position={[0, 0, 0]}
            scale={0.6}
            isMobile={isMobile}
          />
          <FirePlane
            position={[0, 0.5, 0]}
            isExtinguishing={isExtinguishing}
            onExtinguished={handleFireExtinguished}
          />
          {/* <button onClick={handleExtinguish}>Начать тушение</button> */}


          <OrbitControls
            ref={controls}
            enableZoom
            {...(isMobile ? controlsSettings.mobile : controlsSettings.desktop)}
            touchAction={isMobile ? 'pan-y' : 'none'}
            screenSpacePanning={isMobile}
          />
        </Suspense>
      </Canvas>
    </Box>
  )
})

export default FireSafetyLevel1
