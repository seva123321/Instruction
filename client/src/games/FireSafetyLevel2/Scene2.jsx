import { useGLTF, useAnimations, Html } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react'
import * as THREE from 'three'
import useQuizPage from '@/hook/useQuizPage'
import { useLazyGetModelQuery } from '@/slices/gameApi'
import FirePlane from '../CustomFire'

const Scene2 = forwardRef((props, ref) => {
  const group = useRef()
  // const { gameData: data, updateUserAnswers } = useQuizPage()
  const { gameData, updateUserAnswers } = useQuizPage() // @todo gameData
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
    model_path: modelPath = '/models/scene_last4.glb',
    part_tooltips: partTooltips = {},
    animation_sequence: animationSequence = [],
    answer: answerServer = [],
  } = gameData || {}

  const { scene: model, animations } = useGLTF(modelPath) || {
    scene: null,
    animations: [],
  }
  const { actions, mixer } = useAnimations(animations, group)

  const [isTouch, setIsTouch] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)
  const [hoveredPart, setHoveredPart] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0])
  const { raycaster, camera } = useThree()
  const [isBurning, setIsBurning] = useState(true) //@TODO

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [model, props.isMobile])

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
          if (answerServer.includes(clickedObject.name)) {
            updateUserAnswers(clickedObject.name)
          }

          const action = actions[clickedObject.name]
          if (action) {
            action.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true
            action.play()
          }
        }
      },
    }),
    [
      isTouch,
      model,
      partTooltips,
      raycaster,
      camera,
      answerServer,
      updateUserAnswers,
      actions,
    ]
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
      setIsBurning(false)
    },
  }))

  useFrame(() => {
    if (
      !isPlayingSequence ||
      !animationSequence ||
      currentStep >= animationSequence.length
    ) {
      return
    }

    const currentActionName = animationSequence[currentStep]
    const action = actions[currentActionName]

    if (!action) {
      setCurrentStep((prev) => prev + 1)
      return
    }

    if (!action.isRunning()) {
      if (action.time === 0) {
        action.reset().play()
      } else if (action.time >= action.getClip().duration) {
        setCurrentStep((prev) => prev + 1)
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

// Предзагрузка модели
useGLTF.preload('/models/scene_last4.glb')

export default Scene2

// /* eslint-disable no-param-reassign */
// /* eslint-disable react/no-unknown-property */

// import { useGLTF, useAnimations, Html } from '@react-three/drei'
// import { useThree, useFrame } from '@react-three/fiber'
// import {
//   forwardRef,
//   useRef,
//   useState,
//   useEffect,
//   useImperativeHandle,
//   useMemo,
// } from 'react'
// import * as THREE from 'three'
// import useQuizPage from '@/hook/useQuizPage'
// import { useLazyGetModelQuery } from '../slices/gameApi'

// const Scene2 = forwardRef((props, ref) => {
//   const group = useRef()
//   const { gameData, updateUserAnswers } = useQuizPage()
//   const [getModel, { isLoading: isModelLoading, isError: isModelError }] =
//     useLazyGetModelQuery()

//   const {
//     model_path: modelPath,
//     part_tooltips: partTooltips,
//     animation_sequence: animationSequence,
//     answer: answerServer,
//   } = useMemo(() => gameData, [gameData])

//   const [model, setModel] = useState(null)
//   const [animations, setAnimations] = useState([])
//   const { actions } = useAnimations(animations, group)

//   const [isTouch, setIsTouch] = useState(false)
//   const [currentStep, setCurrentStep] = useState(0)
//   const [isPlayingSequence, setIsPlayingSequence] = useState(false)
//   const [hoveredPart, setHoveredPart] = useState(null)
//   const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0])
//   const { raycaster, camera } = useThree()

//   useEffect(() => {
//     setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
//   }, [])

//   useEffect(() => {
//     if (!modelPath) return

//     const loadModel = async () => {
//       try {
//         // 1. Получаем URL модели с сервера
//         const modelResponse = await getModel(modelPath).unwrap()

//         // 2. Загружаем модель через useGLTF
//         const { scene: loadedScene, animations: loadedAnimations } =
//           await useGLTF.load('/models/scene_last4.glb')
//           // await useGLTF.load(modelResponse.url)

//         // 3. Настраиваем материалы
//         loadedScene.traverse((node) => {
//           if (node.isMesh) {
//             node.material.transparent = false
//             node.material.depthWrite = true

//             if (
//               props.isMobile &&
//               (node.name === 'safety_pin_fire-extinguisher' ||
//                 node.name === 'stamp_fire-extinguisher')
//             ) {
//               node.geometry.scale(1.3, 1, 1.3)
//               node.geometry.attributes.position.needsUpdate = true
//               node.geometry.computeBoundingBox()
//               node.geometry.computeBoundingSphere()
//             }

//             node.cursor = 'pointer'
//           }
//         })

//         setModel(loadedScene)
//         setAnimations(loadedAnimations)

//         // 4. Предзагружаем для возможного повторного использования
//         useGLTF.preload('/models/scene_last4.glb')
//         // useGLTF.preload(modelResponse.url)
//       } catch (error) {
//         console.error('Failed to load model:', error)
//         // Можно показать простую геометрию в качестве fallback
//         const fallbackScene = new THREE.Group()
//         const box = new THREE.Mesh(
//           new THREE.BoxGeometry(1, 1, 1),
//           new THREE.MeshBasicMaterial({ color: 0xff0000 })
//         )
//         fallbackScene.add(box)
//         setModel(fallbackScene)
//       }
//     }

//     loadModel()

//     return () => {
//       // При размонтировании очищаем модель
//       if (model) {
//         model.traverse((obj) => {
//           if (obj.isMesh) {
//             obj.geometry.dispose()
//             obj.material.dispose()
//           }
//         })
//       }
//       setModel(null)
//       setAnimations([])
//     }
//   }, [modelPath, props.isMobile, getModel])

//   const eventHandlers = useMemo(
//     () => ({
//       handlePointerOver: (event) => {
//         if (isTouch || !model) return
//         event.stopPropagation()
//         document.body.style.cursor = 'pointer'

//         const clickedObject = event.object
//         const offsetY = 0.1
//         const elevatedPoint = new THREE.Vector3(
//           event.point.x,
//           event.point.y + offsetY,
//           event.point.z
//         )

//         setTooltipPosition(elevatedPoint)

//         const partName = Object.keys(partTooltips).find((key) =>
//           clickedObject.name.includes(key)
//         )

//         if (partName) setHoveredPart(partName)
//       },
//       handlePointerOut: () => {
//         document.body.style.cursor = 'auto'
//         setHoveredPart(null)
//       },
//       handleClick: (event) => {
//         if (!model) return

//         event.stopPropagation()
//         event.nativeEvent.stopImmediatePropagation()

//         raycaster.setFromCamera(event.pointer, camera)
//         const intersects = raycaster.intersectObjects(model.children, true)

//         if (intersects.length > 0 && intersects[0].distance < 10) {
//           const clickedObject = intersects[0].object
//           if (answerServer.includes(clickedObject.name)) {
//             updateUserAnswers(clickedObject.name)
//           }

//           const matchingAction = Object.keys(actions).find((key) =>
//             key.includes(clickedObject.name)
//           )

//           if (matchingAction) {
//             const action = actions[matchingAction]
//             action.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true
//             action.play()
//           }
//         }
//       },
//     }),
//     [
//       isTouch,
//       partTooltips,
//       model,
//       actions,
//       camera,
//       raycaster,
//       answerServer,
//       updateUserAnswers,
//     ]
//   )

//   const resetAnimation = useMemo(
//     () => () => {
//       Object.values(actions).forEach((action) => {
//         action?.stop?.()
//         action?.reset?.()
//       })
//       setCurrentStep(0)
//       setIsPlayingSequence(false)
//     },
//     [actions]
//   )

//   useImperativeHandle(
//     ref,
//     () => ({
//       playAnimationSequence: () => {
//         if (!isPlayingSequence && animations.length > 0) {
//           resetAnimation()
//           setIsPlayingSequence(true)
//           setCurrentStep(0)
//         }
//       },
//     }),
//     [isPlayingSequence, resetAnimation, animations]
//   )

//   useFrame(() => {
//     if (!isPlayingSequence || !animationSequence || !model) return

//     const currentActionName = animationSequence[currentStep]
//     const action = actions[`${currentActionName}Action`]

//     if (!action) {
//       if (currentStep < animationSequence.length - 1) {
//         setCurrentStep((prev) => prev + 1)
//       } else {
//         setIsPlayingSequence(false)
//       }
//       return
//     }

//     if (!action.isRunning()) {
//       if (action.time === 0) {
//         action.reset()
//         action.setLoop(THREE.LoopOnce)
//         action.clampWhenFinished = true
//         action.play()
//       } else if (action.time >= action.getClip().duration) {
//         if (currentStep < animationSequence.length - 1) {
//           setCurrentStep((prev) => prev + 1)
//         } else {
//           setIsPlayingSequence(false)
//         }
//       }
//     }
//   })

//   return (
//     <>
//       {isModelLoading && (
//         <Html center>
//           <div style={{ color: 'white' }}>Loading model...</div>
//         </Html>
//       )}

//       {model && (
//         <primitive
//           ref={group}
//           onClick={eventHandlers.handleClick}
//           onPointerOver={eventHandlers.handlePointerOver}
//           onPointerOut={eventHandlers.handlePointerOut}
//           object={model}
//           {...props}
//         />
//       )}

//       {hoveredPart && (
//         <Html position={tooltipPosition} distanceFactor={10}>
//           <div className="tooltip">{partTooltips[hoveredPart]}</div>
//         </Html>
//       )}
//     </>
//   )
// })

// export default Scene2
