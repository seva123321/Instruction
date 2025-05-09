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
} from 'react'
import * as THREE from 'three'
import useQuizPage from '@/hook/useQuizPage'

const PowderExtinguisher = forwardRef((props, ref) => {
  const group = useRef()
  const { gameData, updateUserAnswers } = useQuizPage()

  // Мемоизация данных из gameData
  const {
    model_path: modelPath,
    part_tooltips: partTooltips,
    animation_sequence: animationSequence,
    answer: answerServer,
  } = useMemo(() => gameData, [gameData])

  const { scene, animations } = useGLTF(modelPath)
  const { actions } = useAnimations(animations, group)

  const [isTouch, setIsTouch] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)
  const [hoveredPart, setHoveredPart] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0])
  const { raycaster, camera } = useThree()

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  // Предзагрузка модели (вынесен в отдельный эффект)
  useEffect(() => {
    if (modelPath) {
      useGLTF.preload(modelPath)
    }
  }, [modelPath])

  const { isMobile } = props

  // Мемоизированный обработчик событий
  const eventHandlers = useMemo(
    () => ({
      handlePointerOver: (event) => {
        if (isTouch) return
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

        if (partName) {
          setHoveredPart(partName)
        }
      },
      handlePointerOut: () => {
        document.body.style.cursor = 'auto'
        setHoveredPart(null)
      },
      handleClick: (event) => {
        event.stopPropagation()
        event.nativeEvent.stopImmediatePropagation()

        raycaster.setFromCamera(event.pointer, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)

        if (intersects.length > 0 && intersects[0].distance < 10) {
          const clickedObject = intersects[0].object
          console.log('Clicked:', clickedObject.name)
          if (answerServer.includes(clickedObject.name)) {
            updateUserAnswers(clickedObject.name)
          }

          // Запускаем анимацию
          const matchingAction = Object.keys(actions).find((key) =>
            key.includes(clickedObject.name)
          )

          if (matchingAction) {
            const action = actions[matchingAction]
            action.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true
            action.play()
          }
        }
      },
    }),
    [
      isTouch,
      partTooltips,
      scene.children,
      actions,
      camera,
      raycaster,
      updateUserAnswers,
    ]
  )

  // Настройка материалов
  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh) {
        node.material.transparent = false
        node.material.depthWrite = true
        // Изменение размера для мобильных устройств
        if (
          (isMobile && node.name === 'safety_pin_fire-extinguisher') ||
          node.name === 'stamp_fire-extinguisher'
        ) {
          node.geometry.scale(1.3, 1, 1.3)
          node.geometry.attributes.position.needsUpdate = true
          node.geometry.computeBoundingBox()
          node.geometry.computeBoundingSphere()
        }

        node.cursor = 'pointer'
      }
    })
  }, [scene, isMobile])

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

  useImperativeHandle(
    ref,
    () => ({
      playAnimationSequence: () => {
        if (!isPlayingSequence) {
          resetAnimation()
          setIsPlayingSequence(true)
          setCurrentStep(0)
        }
      },
    }),
    [isPlayingSequence, resetAnimation]
  )

  useFrame(() => {
    if (!isPlayingSequence || !animationSequence) return

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

  return (
    <>
      <primitive
        ref={group}
        onClick={eventHandlers.handleClick}
        onPointerOver={eventHandlers.handlePointerOver}
        onPointerOut={eventHandlers.handlePointerOut}
        object={scene}
        {...props}
      />

      {hoveredPart && (
        <Html position={tooltipPosition} distanceFactor={10}>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              transform: 'translate(-50%, -100%)',
            }}
          >
            {partTooltips[hoveredPart]}
          </div>
        </Html>
      )}
    </>
  )
})

export default PowderExtinguisher

// // для работы с СЕРВЕРОМ
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
// import ModelLoader from '@/hoc/ModelLoader'

// const PowderExtinguisher = forwardRef((props, ref) => {
//   const group = useRef()
//   const { gameData } = useQuizPage()
//   // Мемоизация данных из gameData
//   const {
//     model_path: modelPath,
//     part_tooltips: partTooltips,
//     animation_sequence: animationSequence,
//   } = useMemo(() => gameData, [gameData])

//   const { scene, animations } = useGLTF(modelPath)
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

//   // Предзагрузка модели (вынесен в отдельный эффект)
//   useEffect(() => {
//     if (modelPath) {
//       useGLTF.preload(modelPath)
//     }
//   }, [modelPath])

//   const { isMobile } = props

//   // Мемоизированный обработчик событий
//   const eventHandlers = useMemo(
//     () => ({
//       handlePointerOver: (event) => {
//         if (isTouch) return
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

//         if (partName) {
//           setHoveredPart(partName)
//         }
//       },
//       handlePointerOut: () => {
//         document.body.style.cursor = 'auto'
//         setHoveredPart(null)
//       },
//       // handleClick: (event) => {
//       //   event.stopPropagation()
//       //   const { raycaster, camera } = useThree()
//       //   raycaster.setFromCamera(event.pointer, camera)
//       //   const intersects = raycaster.intersectObjects(scene.children, true)

//       //   if (intersects.length > 0) {
//       //     const clickedObject = intersects[0].object
//       //     const action =
//       //       actions[clickedObject.name] ||
//       //       Object.entries(actions).find(([key]) =>
//       //         key.includes(clickedObject.name)
//       //       )?.[1]

//       //     if (action) {
//       //       action.reset()
//       //       action.setLoop(THREE.LoopOnce)
//       //       action.clampWhenFinished = true
//       //       action.play()
//       //     }
//       //   }
//       // },
//       handleClick: (event) => {
//         event.stopPropagation()

//         raycaster.setFromCamera(event.pointer, camera)
//         const intersects = raycaster.intersectObjects(scene.children, true)

//         if (intersects.length > 0) {
//           const clickedObject = intersects[0].object
//           const matchingAction = Object.keys(actions).find(
//             (key) => key.includes(clickedObject.name)
//             // eslint-disable-next-line function-paren-newline
//           )
//           if (matchingAction) {
//             const action = actions[matchingAction]
//             action.reset()
//             action.setLoop(THREE.LoopOnce)
//             action.clampWhenFinished = true
//             action.play()
//           }
//         }
//       },
//     }),
//     [isTouch, partTooltips, scene.children, actions, camera, raycaster]
//   )

//   // Настройка материалов с мемоизацией
//   // производительнее но нерабочий
//   // useEffect(() => {
//   //   const modifiedScene = scene.clone()
//   //   modifiedScene.traverse((node) => {
//   //     if (node.isMesh) {
//   //       const box = new THREE.Box3().setFromObject(node)
//   //       const size = box.getSize(new THREE.Vector3())

//   //       if (
//   //         (isMobile && node.name === 'Safety_pin_fire-extinguisher') ||
//   //         node.name === 'Stamp_fire-extinguisher'
//   //       ) {
//   //         const geometry = node.geometry.clone()
//   //         geometry.scale(1.3, 1, 1.3)
//   //         geometry.attributes.position.needsUpdate = true
//   //         geometry.computeBoundingBox()
//   //         geometry.computeBoundingSphere()
//   //         node.geometry = geometry
//   //       }

//   //       if (size.length() > 1.5) {
//   //         node.material = node.material.clone()
//   //         node.material.color.set('#8B0000')
//   //         node.material.transparent = false
//   //         node.material.opacity = 1
//   //       }

//   //       node.cursor = 'pointer'
//   //     }
//   //   })
//   // }, [scene, isMobile])

//   // Настройка материалов
//   useEffect(() => {
//     scene.traverse((node) => {
//       if (node.isMesh) {
//         const box = new THREE.Box3().setFromObject(node)
//         const size = box.getSize(new THREE.Vector3())

//         // Изменение размера для мобильных устройств
//         if (
//           (isMobile && node.name === 'Safety_pin_fire-extinguisher') ||
//           node.name === 'Stamp_fire-extinguisher'
//         ) {
//           node.geometry.scale(1.3, 1, 1.3)
//           node.geometry.attributes.position.needsUpdate = true
//           node.geometry.computeBoundingBox()
//           node.geometry.computeBoundingSphere()
//         }

//         if (size.length() > 1.5) {
//           node.material = new THREE.MeshStandardMaterial({
//             color: '#8B0000',
//             transparent: false,
//             opacity: 1,
//           })
//         }

//         node.cursor = 'pointer'
//       }
//     })
//   }, [scene, isMobile])

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
//         if (!isPlayingSequence) {
//           resetAnimation()
//           setIsPlayingSequence(true)
//           setCurrentStep(0)
//         }
//       },
//     }),
//     [isPlayingSequence, resetAnimation]
//   )

//   useFrame(() => {
//     if (!isPlayingSequence || !animationSequence) return

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

//   const tooltipStyle = {
//     background: 'rgba(0, 0, 0, 0.8)',
//     color: 'white',
//     padding: '4px 8px',
//     borderRadius: '4px',
//     fontSize: '10px',
//     whiteSpace: 'nowrap',
//     pointerEvents: 'none',
//     transform: 'translate(-50%, -100%)',
//   }

//   return (
//     <ModelLoader modelPath={modelPath}>
//       {(scene, loaderProps) => (
//         <>
//           <primitive
//             ref={group}
//             object={scene}
//             onClick={eventHandlers.handleClick}
//             onPointerOver={eventHandlers.handlePointerOver}
//             onPointerOut={eventHandlers.handlePointerOut}
//             {...props}
//             {...loaderProps}
//           />

//           {hoveredPart && (
//             <Html position={tooltipPosition} distanceFactor={10}>
//               <div style={tooltipStyle}>{partTooltips[hoveredPart]}</div>
//             </Html>
//           )}
//         </>
//       )}
//     </ModelLoader>
//   )
// })

// export default PowderExtinguisher
