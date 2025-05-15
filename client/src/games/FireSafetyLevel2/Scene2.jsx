import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  useMemo,
  useCallback,
} from 'react'
import * as THREE from 'three'
import useQuizPage from '@/hook/useQuizPage'
import { useLazyGetModelQuery } from '@/slices/gameApi'
import FirePlane from '../CustomFire'
import ExtinguishingSubstance from './ExtinguishingSubstance'

const Scene2 = forwardRef((props, ref) => {
  const [isBurning, setIsBurning] = useState(true) // @TODO
  const [userAnswers, setUserAnswers] = useState([])
  const group = useRef()
  const { gameData, updateUserAnswers, setResult } = useQuizPage()
  const [getModel, { isLoading: isModelLoading }] = useLazyGetModelQuery()
  const [isExtinguishing, setIsExtinguishing] = useState(false)
  const [nozzlePosition, setNozzlePosition] = useState([0, 0, 0])
  const [extinguishingDirection, setExtinguishingDirection] = useState([
    0, 0, -1,
  ])

  const {
    model_path: modelPath = '/models/dark_room_fire_safety.glb',
    part_tooltips: partTooltips = {},
    animation_sequence: animationSequence = [],
    answer: answerServer = [],
  } = gameData || {}

  const { scene: model, animations } = useGLTF(modelPath) || {
    scene: null,
    animations: [],
  }
  const { actions } = useAnimations(animations || [], group)

  const [isTouch, setIsTouch] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)
  const [hoveredPart, setHoveredPart] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0])
  const { raycaster, camera } = useThree()

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [model, props.isMobile])

  // const isEqualArray = useCallback(
  //   (arr1, arr2) => arr2[0].includes(arr1[0]),
  //   []
  // )

  // useEffect(() => {
  //   const uniqUserAnswers = Array.from(new Set(userAnswers))
  //   if (uniqUserAnswers.length === answerServer?.length) {
  //     setResult(isEqualArray(answerServer, uniqUserAnswers))
  //   }
  // }, [userAnswers, answerServer, isEqualArray, setResult])

  useEffect(() => {
    if (userAnswers.length === answerServer?.length) {
      setResult(userAnswers[0].includes(answerServer[0]))
    }
  }, [userAnswers, answerServer, setResult])

  const eventHandlers = useMemo(
    () => ({
      handlePointerOver: (event) => {
        if (isTouch || !model) return
        event.stopPropagation()
        document.body.style.cursor = 'pointer'

        const clickedObject = event.object
        const offsetY = 0.1
        const elevatedPoint = new THREE.Vector3(
          event.point.x,
          event.point.y + offsetY,
          event.point.z
        )

        setTooltipPosition(elevatedPoint)

        const partName = Object.keys(partTooltips).find((key) =>
          clickedObject.name.includes(key)
        )

        if (partName) setHoveredPart(partName)
      },
      handlePointerOut: () => {
        document.body.style.cursor = 'auto'
        setHoveredPart(null)
      },
      handleClick: (event) => {
        if (!model) return

        event.stopPropagation()

        requestAnimationFrame(() => {
          raycaster.setFromCamera(event.pointer, camera)
          const intersects = raycaster.intersectObjects(model.children, true)

          if (intersects.length > 0) {
            const clickedObject = intersects[0].object
            const isAnsweredClick = gameData.obj_allowed_clicks.some(
              (allowedWord) => clickedObject.name.includes(allowedWord)
            )

            if (isAnsweredClick) {
              setUserAnswers((prev) => {
                if (!prev.some((item) => item === clickedObject.name)) {
                  return [...prev, clickedObject.name]
                }
                return prev
              })
            }
          }
        })
      },
    }),
    [gameData, isTouch, model, partTooltips, raycaster, camera]
  )

  const resetAnimation = () => {
    Object.values(actions).forEach((action) => {
      action?.stop()
      action?.reset()
    })
    setCurrentStep(0)
    setIsPlayingSequence(false)
  }

  useImperativeHandle(ref, () => ({
    playAnimationSequence: () => {
      resetAnimation()
      setIsPlayingSequence(true)
      setCurrentStep(0)
      setIsBurning(true)
    },
  }))

  useFrame(() => {
    if (!isPlayingSequence || !animationSequence || !model) return
    if (actions === null || Object.keys(actions).length === 0) return

    const currentActionName = animationSequence[currentStep]
    const action = actions[`${currentActionName}Action`]

    // Проверяем, началась ли анимация огнетушителя
    const isExtinguisherAction =
      currentActionName.includes('handle_bottom_co2_fire-extinguisher') ||
      currentActionName.includes('handle_bottom_fire-extinguisher')

    if (isExtinguisherAction && action && action.isRunning()) {
      setIsExtinguishing(true)

      // Находим позицию сопла в модели
      model.traverse((child) => {
        if (child.name.includes('nozzle')) {
          const worldPosition = new THREE.Vector3()
          child.getWorldPosition(worldPosition)
          setNozzlePosition([
            worldPosition.x + 8.2,
            worldPosition.y + 0.6, //высота
            worldPosition.z + 1.2,
          ])

          // Получаем направление из сопла
          const direction = new THREE.Vector3(0, -1, 1.5)
          child.localToWorld(direction)
          direction.sub(worldPosition).normalize()
          setExtinguishingDirection([direction.x, direction.y, direction.z])
        }
      })
    } else {
      setIsExtinguishing(false)
    }

    if (!action) {
      if (currentStep < animationSequence.length - 1) {
        setCurrentStep((prev) => prev + 1)
      } else {
        setIsPlayingSequence(false)
      }
      return
    }

    if (!action.isRunning()) {
      if (action.time === 0) {
        action.reset()
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        action.play()
      } else if (action.time >= action.getClip().duration) {
        if (currentStep < animationSequence.length - 1) {
          setCurrentStep((prev) => prev + 1)
        } else {
          setIsPlayingSequence(false)
          setIsBurning(false)
        }
      }
    }
  })

  if (isModelLoading) {
    return (
      <Html center>
        <div style={{ color: 'white' }}>Loading model...</div>
      </Html>
    )
  }

  if (!model) {
    return (
      <Html center>
        <div style={{ color: 'white' }}>Model not loaded</div>
      </Html>
    )
  }

  return (
    <>
      <primitive
        ref={group}
        object={model}
        onClick={eventHandlers.handleClick}
        onPointerOver={eventHandlers.handlePointerOver}
        onPointerOut={eventHandlers.handlePointerOut}
        {...props}
      />

      <ExtinguishingSubstance
        isActive={isExtinguishing}
        position={nozzlePosition}
        direction={extinguishingDirection}
      />
      <FirePlane
        size={gameData.fire_size}
        position={gameData.fire_position}
        isBurning={isBurning}
      />

      {hoveredPart && (
        <Html position={tooltipPosition} distanceFactor={10}>
          <div
            style={{
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            {partTooltips[hoveredPart]}
          </div>
        </Html>
      )}
    </>
  )
})

export default Scene2
