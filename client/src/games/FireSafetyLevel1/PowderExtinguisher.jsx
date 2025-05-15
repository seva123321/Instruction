/* eslint-disable function-paren-newline */
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
import * as THREE from 'three'

import useQuizPage from '@/hook/useQuizPage'

const PowderExtinguisher = forwardRef((props, ref) => {
  const group = useRef()
  const { gameData, setResult } = useQuizPage()

  const {
    model_path: modelPath,
    part_tooltips: partTooltips,
    animation_sequence: animationSequence,
    answer: answerServer,
  } = useMemo(() => gameData, [gameData])

  // Загружаем модель и анимации через useGLTF
  const { scene, animations: loadedAnimations } = useGLTF(modelPath) || {}
  const { actions } = useAnimations(loadedAnimations || [], group)

  const [isTouch, setIsTouch] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)
  const [hoveredPart, setHoveredPart] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0])
  const { raycaster, camera } = useThree()
  const [error, setError] = useState(null)
  const [userAnswers, setUserAnswers] = useState([])

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)

    if (!scene) return

    const processModel = () => {
      scene.traverse((node) => {
        if (node.isMesh) {
          node.material.transparent = false
          node.material.depthWrite = true
          node.cursor = 'pointer'

          if (
            props.isMobile &&
            (node.name.includes('safety_pin') || node.name.includes('stamp'))
          ) {
            node.geometry.scale(1.3, 1, 1.3)
            node.geometry.attributes.position.needsUpdate = true
            node.geometry.computeBoundingBox()
            node.geometry.computeBoundingSphere()
          }
        }
      })
    }

    processModel()

    // eslint-disable-next-line consistent-return
    return () => {
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry.dispose()
          obj.material.dispose()
        }
      })
    }
  }, [scene, props.isMobile])

  useEffect(() => {
    if (!modelPath) return

    const timer = setTimeout(() => {
      if (!scene && !error) {
        setError('Модель не загрузилась в течение ожидаемого времени')
      }
    }, 10000)

    // eslint-disable-next-line consistent-return
    return () => clearTimeout(timer)
  }, [modelPath, scene, error])

  const createFallbackModel = () => {
    const fallbackScene = new THREE.Group()

    const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32)
    const bodyMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 1
    fallbackScene.add(body)

    const topGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32)
    const topMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 })
    const top = new THREE.Mesh(topGeometry, topMaterial)
    top.position.y = 2.2
    fallbackScene.add(top)

    const handleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.6)
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 })
    const handle = new THREE.Mesh(handleGeometry, handleMaterial)
    handle.position.set(0, 2.4, 0.3)
    fallbackScene.add(handle)

    return fallbackScene
  }

  const resetAnimation = useMemo(
    () => () => {
      Object.values(actions).forEach((action) => {
        action?.stop?.()
        action?.reset?.()
      })
      setCurrentStep(0)
      setIsPlayingSequence(false)
    },
    [actions]
  )
  const isEqualArray = useCallback(
    (arr1, arr2) => arr1.every((item, i) => item === arr2[i]),
    []
  )

  useEffect(() => {
    const uniqUserAnswers = Array.from(new Set(userAnswers))
    if (uniqUserAnswers.length === answerServer?.length) {
      setResult(isEqualArray(answerServer, uniqUserAnswers))
    }
  }, [userAnswers, answerServer, isEqualArray, setResult])

  useImperativeHandle(
    ref,
    () => ({
      playAnimationSequence: () => {
        if (!isPlayingSequence && loadedAnimations?.length > 0) {
          resetAnimation()
          setIsPlayingSequence(true)
          setCurrentStep(0)
        }
      },
    }),
    [isPlayingSequence, resetAnimation, loadedAnimations]
  )

  useFrame(() => {
    if (!isPlayingSequence || !animationSequence || !scene) return

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
        }
      }
    }
  })

  const eventHandlers = useMemo(
    () => ({
      handlePointerOver: (event) => {
        if (isTouch || !scene) return
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
        if (!scene) return

        event.stopPropagation()
        event.nativeEvent.stopImmediatePropagation()

        raycaster.setFromCamera(event.pointer, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)

        if (intersects.length > 0 && intersects[0].distance < 10) {
          const clickedObject = intersects[0].object

          if (answerServer.includes(clickedObject.name)) {
            // updateAnswers(clickedObject.name)
            setUserAnswers((prev) => [...prev, clickedObject.name])
          }

          const matchingAction = Object.keys(actions).find(
            (key) => key.includes(clickedObject.name)
            // eslint-disable-next-line function-paren-newline
          )

          if (matchingAction) {
            const action = actions[matchingAction]
            action.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true
            action.play()
          }
        }
      },
    }),
    [isTouch, partTooltips, scene, actions, camera, raycaster, answerServer]
  )

  return (
    <>
      {!scene && !error && (
        <Html center>
          <div style={{ color: 'white' }}>Loading model...</div>
        </Html>
      )}

      {error && (
        <Html center>
          <div style={{ color: 'red' }}>{error}</div>
          <primitive object={createFallbackModel()} {...props} />
        </Html>
      )}

      {scene && (
        <primitive
          ref={group}
          object={scene}
          onClick={eventHandlers.handleClick}
          onPointerOver={eventHandlers.handlePointerOver}
          onPointerOut={eventHandlers.handlePointerOut}
          {...props}
        />
      )}

      {hoveredPart && (
        <Html position={tooltipPosition} distanceFactor={10}>
          <div className="tooltip">{partTooltips[hoveredPart]}</div>
        </Html>
      )}
    </>
  )
})

export default PowderExtinguisher
