/* eslint-disable react/no-unknown-property */
/* eslint-disable no-param-reassign */
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
import { Box3, Vector3 } from 'three'
import { Box } from '@mui/material'

import Scene2 from './Scene2'

const CAMERA_HEIGHT_MULTIPLIER = 1.5
const CAMERA_DISTANCE_MULTIPLIER = 2.5
const MOBILE_CAMERA_DISTANCE_MULTIPLIER = 3

const FireSafetyLevel2 = forwardRef((props, ref) => {
  const [isMobile, setIsMobile] = useState(false)
  const [cameraSettings, setCameraSettings] = useState({
    position: [0, 5, 11],
    fov: 50,
  })
  const scene2Ref = useRef()
  const controls = useRef()
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef()

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

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useImperativeHandle(ref, () => ({
    playAnimationSequence: () => {
      scene2Ref.current?.playAnimationSequence?.()
    },
  }))

  useEffect(() => {
    if (!mounted || !scene2Ref.current) return

    const calculateCameraPosition = () => {
      try {
        const checkModel = () => {
          if (scene2Ref.current?.scene?.children?.length > 0) {
            const model = scene2Ref.current.scene.children[0]
            const box = new Box3().setFromObject(model)
            const size = box.getSize(new Vector3()).length()
            const center = box.getCenter(new Vector3())

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
              controls.current.target.set(center.x, center.y, center.z)
              controls.current.update()
            }
          } else {
            setTimeout(checkModel, 100)
          }
        }

        checkModel()
      } catch (error) {
        console.error('Error calculating camera position:', error)
        setCameraSettings({
          position: [0, 5, 11],
          fov: 50,
        })
      }
    }

    calculateCameraPosition()
  }, [isMobile, mounted])

  const controlsSettings = {
    mobile: {
      minDistance: 1,
      maxDistance: 10,
      zoomSpeed: 0.5,
      rotateSpeed: 0.5,
      panSpeed: 0.5,
    },
    desktop: {
      minDistance: 2,
      maxDistance: 15,
      zoomSpeed: 1,
      rotateSpeed: 1,
      panSpeed: 1,
    },
  }

  if (!mounted) return null

  return (
    <Box sx={{ height: '80vh', position: 'relative' }}>
      <Canvas
        ref={canvasRef}
        camera={{
          ...cameraSettings,
          near: 0.1,
          far: 1000,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'none'
          gl.domElement.style.position = 'absolute'
          gl.domElement.style.top = '0'
          gl.domElement.style.outline = 'none'
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
      >
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Sky />

          <ambientLight intensity={0.8} />
          {/* <spotLight
            position={[10, 15, 10]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            castShadow
            shadow-mapSize={2048}
          /> */}

          <Environment preset="city" />

          <Scene2
            ref={scene2Ref}
            position={[0, 0, 1]}
            rotation={[0, 2, 0]}
            scale={0.8}
            isMobile={isMobile}
          />

          <OrbitControls
            ref={controls}
            enableZoom
            enablePan
            enableRotate
            {...(isMobile ? controlsSettings.mobile : controlsSettings.desktop)}
            screenSpacePanning
            makeDefault
          />
        </Suspense>
      </Canvas>
    </Box>
  )
})

export default FireSafetyLevel2
