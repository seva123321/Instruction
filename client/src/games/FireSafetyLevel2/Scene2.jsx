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

const Scene2 = forwardRef((props, ref) => {
  const [isBurning, setIsBurning] = useState(true) // @TODO
  const [userAnswers, setUserAnswers] = useState([])
  const group = useRef()
  const { gameData, updateUserAnswers, setResult } = useQuizPage()
  // const { gameData } = useQuizPage() // @todo gameData
  const [getModel, { isLoading: isModelLoading }] = useLazyGetModelQuery()
  // const gameData = useMemo(
  //   () => ({
  //     question:
  //       'Задайте правильную последовательность использования порошкового огнетушителя',
  //     answer: [
  //       'stamp_fire-extinguisher',
  //       'safety_pin_fire-extinguisher',
  //       'hose_fire-extinguisher',
  //       'handle_bottom_fire-extinguisher',
  //     ],
  //     warning:
  //       'Подачу огнетушащего материала необходимо производить порционно. Длительность подачи должна составлять примерно 2 секунды с небольшим перерывом.',
  //     model_path: '/models/scene_last4.glb',
  //     part_tooltips: {
  //       safety_pin: 'Предохранительная чека',
  //       stamp: 'Пломба',
  //       hose: 'Шланг',
  //       handle_bottom: 'Ручка активации',
  //     },
  //     animation_sequence: [
  //       'safety_pin_fire-extinguisher',
  //       'stamp_fire-extinguisher',
  //       'hose_fire-extinguisher',
  //       'handle_bottom_fire-extinguisher',
  //     ],
  //   }),
  //   []
  // )

  const {
    model_path: modelPath = '/models/scene_last4.10.glb',
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

  const isEqualArray = useCallback(
    (arr1, arr2) => arr2[0].includes(arr1[0]),
    []
  )

  useEffect(() => {
    const uniqUserAnswers = Array.from(new Set(userAnswers))
    if (uniqUserAnswers.length === answerServer?.length) {
      setResult(isEqualArray(answerServer, uniqUserAnswers))
    }
  }, [userAnswers, answerServer, isEqualArray, setResult])

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
        raycaster.setFromCamera(event.pointer, camera)
        const intersects = raycaster.intersectObjects(model.children, true)

        if (intersects.length > 0) {
          const clickedObject = intersects[0].object
          console.log('clickedObject > ', clickedObject.name)

          const isAnsweredClick = gameData.obj_allowed_clicks.some(
            (allowedWord) => clickedObject.name.includes(allowedWord)
          )

          if (isAnsweredClick) {
            setUserAnswers((prev) => [...prev, clickedObject.name])
          }
        }
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
    },
  }))

  useFrame(() => {
    if (!isPlayingSequence || !animationSequence || !model) return

    const currentActionName = animationSequence[currentStep]
    const action = actions[`${currentActionName}Action`]

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

  // console.log(' arrClick > ', arrClick)

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

      <FirePlane
        size={gameData.fire_size}
        position={gameData.fire_position}
        isBurning={isBurning}
        // onExtinguished={() => setMessage('Огонь потушен')}
        // onFullyIgnited={() => setMessage('Огонь полностью разгорелся')}
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
