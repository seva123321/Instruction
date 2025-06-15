/* eslint-disable no-param-reassign */
/* eslint-disable react/no-unknown-property */
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
import { Color, Vector3, LoopOnce } from 'three'

import FirePlane from '../CustomFire'

import ExtinguishingSubstance from './ExtinguishingSubstance'

import useQuizPage from '@/hook/useQuizPage'

const Scene2 = forwardRef((props, ref) => {
  const [isBurning, setIsBurning] = useState(true)
  const [userAnswers, setUserAnswers] = useState([])
  const group = useRef()
  const { gameData, setResult } = useQuizPage()
  const [isExtinguishing, setIsExtinguishing] = useState(false)
  const [nozzlePosition, setNozzlePosition] = useState([0, 0, 0])
  const [extinguishingDirection, setExtinguishingDirection] = useState([
    0, 0, -1,
  ])
  const [highlightedObject, setHighlightedObject] = useState(null)
  const originalMaterials = useRef(new Map())

  const {
    model_path: modelPath = '/models/dark_room_fire_safety.glb',
    part_tooltips: partTooltips = {},
    animation_sequence: animationSequence = [],
    answer: answerServer = [],
  } = gameData || {}

  const getModelPath = useCallback(() => {
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    const basePath = modelPath.split('.')[0]
    const extension = modelPath.split('.').pop()

    // Для мобильных используем облегченную версию (_light)
    return isMobile ? `${basePath}_light.${extension}` : modelPath
  }, [modelPath])

  const { scene: model, animations } = useGLTF(getModelPath()) || {
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

  // Функция для сброса подсветки
  const resetHighlight = useCallback(() => {
    if (highlightedObject) {
      highlightedObject.traverse((child) => {
        if (child.isMesh && originalMaterials.current.has(child)) {
          child.material = originalMaterials.current.get(child)
        }
      })
      originalMaterials.current.clear()
      setHighlightedObject(null)
    }
  }, [highlightedObject])

  const highlightObject = useCallback(
    (object) => {
      resetHighlight()

      if (!object) return

      object.traverse((child) => {
        if (child.isMesh && child.material) {
          originalMaterials.current.set(child, child.material)

          const highlightMaterial = child.material.clone()

          // Увеличиваем яркость материала
          if (highlightMaterial.color) {
            const originalColor = highlightMaterial.color.clone()
            highlightMaterial.color = new Color(
              Math.min(originalColor.r * 1.8),
              Math.min(originalColor.g * 1.8),
              Math.min(originalColor.b * 1.8)
            )
          }

          child.material = highlightMaterial
        }
      })

      setHighlightedObject(object)
    },
    [resetHighlight]
  )

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [model, props.isMobile])

  useEffect(() => {
    if (
      !isPlayingSequence &&
      userAnswers.length > 0 &&
      userAnswers.length === answerServer?.length
    ) {
      setResult(userAnswers[0].includes(answerServer[0]))
    }
  }, [userAnswers, answerServer, setResult, isPlayingSequence])

  const eventHandlers = useMemo(
    () => ({
      handlePointerOver: (event) => {
        if (isTouch || !model) return
        event.stopPropagation()
        document.body.style.cursor = 'pointer'

        const clickedObject = event.object
        const offsetY = 0.1
        const elevatedPoint = new Vector3(
          event.point.x,
          event.point.y + offsetY,
          event.point.z
        )

        setTooltipPosition(elevatedPoint)

        const partName = Object.keys(partTooltips).find(
          (key) => clickedObject.name.includes(key)
          // eslint-disable-next-line function-paren-newline
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
              // Подсвечиваем объект
              highlightObject(clickedObject.parent || clickedObject)
              // Полностью меняем выбор
              setUserAnswers([clickedObject.name])
            }
          }
        })
      },
    }),
    [gameData, highlightObject, isTouch, model, partTooltips, raycaster, camera]
  )

  const resetAnimation = () => {
    Object.values(actions).forEach((action) => {
      action?.stop()
      action?.reset()
    })
    setCurrentStep(0)
    setIsPlayingSequence(false)
    resetHighlight()
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

    const isExtinguisherAction =
      currentActionName.includes('handle_bottom_co2_fire-extinguisher') ||
      currentActionName.includes('handle_bottom_fire-extinguisher')

    if (isExtinguisherAction && action && action.isRunning()) {
      setIsExtinguishing(true)
      model.traverse((child) => {
        if (child.name.includes('nozzle')) {
          const worldPosition = new Vector3()
          child.getWorldPosition(worldPosition)
          setNozzlePosition([
            worldPosition.x + 8.2,
            worldPosition.y + 0.6,
            worldPosition.z + 1.2,
          ])

          const direction = new Vector3(0, -1, 1.5)
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
        action.setLoop(LoopOnce)
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
        size={gameData?.fire_size || 1.0}
        position={gameData?.fire_position || [0, 0, 0]}
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
