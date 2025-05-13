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

// const PowderExtinguisher = forwardRef((props, ref) => {
//   const group = useRef()
//   const { gameData, updateUserAnswers } = useQuizPage()

//   const {
//     model_path: modelPath,
//     part_tooltips: partTooltips,
//     animation_sequence: animationSequence,
//     answer: answerServer,
//   } = useMemo(() => gameData, [gameData])

//   // Загружаем модель и анимации через useGLTF
//   const { scene, animations: loadedAnimations } = useGLTF(modelPath) || {}
//   const { actions } = useAnimations(loadedAnimations || [], group)

//   const [isTouch, setIsTouch] = useState(false)
//   const [currentStep, setCurrentStep] = useState(0)
//   const [isPlayingSequence, setIsPlayingSequence] = useState(false)
//   const [hoveredPart, setHoveredPart] = useState(null)
//   const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0])
//   const { raycaster, camera } = useThree()
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
//   }, [])

//   useEffect(() => {
//     if (!scene) return

//     scene.traverse((node) => {
//       if (node.isMesh) {
//         node.material.transparent = false
//         node.material.depthWrite = true
//         node.cursor = 'pointer'

//         if (
//           props.isMobile &&
//           (node.name === 'safety_pin_fire-extinguisher' ||
//             node.name === 'stamp_fire-extinguisher')
//         ) {
//           node.geometry.scale(1.3, 1, 1.3)
//           node.geometry.attributes.position.needsUpdate = true
//           node.geometry.computeBoundingBox()
//           node.geometry.computeBoundingSphere()
//         }
//       }
//     })

//     return () => {
//       scene.traverse((obj) => {
//         if (obj.isMesh) {
//           obj.geometry.dispose()
//           obj.material.dispose()
//         }
//       })
//     }
//   }, [scene, props.isMobile])

//   useEffect(() => {
//     if (!modelPath) return

//     const timer = setTimeout(() => {
//       if (!scene && !error) {
//         setError('Модель не загрузилась в течение ожидаемого времени')
//       }
//     }, 10000)

//     return () => clearTimeout(timer)
//   }, [modelPath, scene, error])

//   const createFallbackModel = () => {
//     const fallbackScene = new THREE.Group()

//     const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32)
//     const bodyMaterial = new THREE.MeshBasicMaterial({
//       color: 0xff0000,
//       transparent: true,
//       opacity: 0.8,
//     })
//     const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
//     body.position.y = 1
//     fallbackScene.add(body)

//     const topGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32)
//     const topMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 })
//     const top = new THREE.Mesh(topGeometry, topMaterial)
//     top.position.y = 2.2
//     fallbackScene.add(top)

//     const handleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.6)
//     const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 })
//     const handle = new THREE.Mesh(handleGeometry, handleMaterial)
//     handle.position.set(0, 2.4, 0.3)
//     fallbackScene.add(handle)

//     return fallbackScene
//   }

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
//         if (!isPlayingSequence && loadedAnimations?.length > 0) {
//           resetAnimation()
//           setIsPlayingSequence(true)
//           setCurrentStep(0)
//         }
//       },
//     }),
//     [isPlayingSequence, resetAnimation, loadedAnimations]
//   )

//   useFrame(() => {
//     if (!isPlayingSequence || !animationSequence || !scene) return

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

//   const eventHandlers = useMemo(
//     () => ({
//       handlePointerOver: (event) => {
//         if (isTouch || !scene) return
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
//         if (!scene) return

//         event.stopPropagation()
//         event.nativeEvent.stopImmediatePropagation()

//         raycaster.setFromCamera(event.pointer, camera)
//         const intersects = raycaster.intersectObjects(scene.children, true)

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
//       scene,
//       actions,
//       camera,
//       raycaster,
//       answerServer,
//       updateUserAnswers,
//     ]
//   )

//   return (
//     <>
//       {!scene && !error && (
//         <Html center>
//           <div style={{ color: 'white' }}>Loading model...</div>
//         </Html>
//       )}

//       {error && (
//         <Html center>
//           <div style={{ color: 'red' }}>{error}</div>
//           <primitive object={createFallbackModel()} {...props} />
//         </Html>
//       )}

//       {scene && (
//         <primitive
//           ref={group}
//           object={scene}
//           onClick={eventHandlers.handleClick}
//           onPointerOver={eventHandlers.handlePointerOver}
//           onPointerOut={eventHandlers.handlePointerOut}
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

// export default PowderExtinguisher
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
// import { useLazyGetModelQuery } from '../../slices/gameApi'

// const PowderExtinguisher = forwardRef((props, ref) => {
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
//   const [errorText, setErrorText] = useState(null)

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
//           await useGLTF.load(modelResponse.url)

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
//         useGLTF.preload(modelResponse.url)
//       } catch (error) {
//         console.error('Failed to load model:', error)

//         // Создаем fallback-модель огнетушителя
//         const fallbackScene = new THREE.Group()

//         // Корпус огнетушителя (красный цилиндр)
//         const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32)
//         const bodyMaterial = new THREE.MeshBasicMaterial({
//           color: 0xff0000,
//           transparent: true,
//           opacity: 0.8,
//         })
//         const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
//         body.position.y = 1
//         fallbackScene.add(body)

//         // Верхняя часть (серый цилиндр)
//         const topGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32)
//         const topMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 })
//         const top = new THREE.Mesh(topGeometry, topMaterial)
//         top.position.y = 2.2
//         fallbackScene.add(top)

//         // Ручка (черный ящик)
//         const handleGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.6)
//         const handleMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 })
//         const handle = new THREE.Mesh(handleGeometry, handleMaterial)
//         handle.position.set(0, 2.4, 0.3)
//         fallbackScene.add(handle)

//         // Текст с ошибкой (используем HTML-элемент через drei's Html)
//         const errorTextMsg = {
//           position: new THREE.Vector3(-1, 0.5, 0),
//           text: 'Модель не загружена',
//           color: '#ff0000',
//           fontSize: '0.5rem',
//         }

//         setModel(fallbackScene)
//         setErrorText(errorTextMsg)
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
//       setErrorText(null)
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
//           object={model}
//           onClick={eventHandlers.handleClick}
//           onPointerOver={eventHandlers.handlePointerOver}
//           onPointerOut={eventHandlers.handlePointerOut}
//           {...props}
//         />
//       )}

//       {errorText && (
//         <Html
//           position={errorText.position}
//           distanceFactor={10}
//           style={{
//             color: errorText.color,
//             fontSize: errorText.fontSize,
//             whiteSpace: 'nowrap',
//             fontWeight: 'bold',
//             textAlign: 'center',
//             background: 'rgba(255, 255, 255, 0.7)',
//             padding: '4px 8px',
//             borderRadius: '4px',
//           }}
//         >
//           {errorText.text}
//         </Html>
//       )}

//       {hoveredPart && (
//         <Html position={tooltipPosition} distanceFactor={10}>
//           <div className="tooltip">{partTooltips[hoveredPart]}</div>
//         </Html>
//       )}
//     </>
//   )
// })

// export default PowderExtinguisher

/********************************************************************* */

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
// import { useLazyGetModelQuery } from '../../slices/gameApi'

// const PowderExtinguisher = forwardRef((props, ref) => {
//   const group = useRef()
//   const { gameData, updateUserAnswers } = useQuizPage()
//   const [getModel, { isLoading: isModelLoading }] = useLazyGetModelQuery()

//   const {
//     model_path: modelPath,
//     part_tooltips: partTooltips = {},
//     animation_sequence: animationSequence = [],
//     answer: answerServer = [],
//   } = gameData || {}

//   const [model, setModel] = useState(null)
//   const [animations, setAnimations] = useState([])
//   const { actions, mixer } = useAnimations(animations, group)
//   const [errorText, setErrorText] = useState(null)
//   const [isTouch, setIsTouch] = useState(false)
//   const [currentStep, setCurrentStep] = useState(0)
//   const [isPlayingSequence, setIsPlayingSequence] = useState(false)
//   const [hoveredPart, setHoveredPart] = useState(null)
//   const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0])
//   const { raycaster, camera } = useThree()

//   // Создаем fallback-модель и анимации
//   const createFallbackModel = useMemo(
//     () => () => {
//       const scene = new THREE.Group()
//       scene.name = 'fallback-extinguisher'

//       // Функция создания части с возможностью анимации
//       const createAnimatedPart = (name, geometry, material, position) => {
//         const mesh = new THREE.Mesh(geometry, material)
//         mesh.name = name
//         mesh.position.copy(position)
//         mesh.userData.originalPosition = position.clone() // Сохраняем исходную позицию
//         mesh.cursor = 'pointer'
//         return mesh
//       }

//       // Создаем части огнетушителя
//       const body = createAnimatedPart(
//         'body_fire-extinguisher',
//         new THREE.CylinderGeometry(0.5, 0.5, 2, 32),
//         new THREE.MeshBasicMaterial({
//           color: 0xff0000,
//           transparent: true,
//           opacity: 0.8,
//         }),
//         new THREE.Vector3(0, 1, 0)
//       )

//       const top = createAnimatedPart(
//         'top_fire-extinguisher',
//         new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32),
//         new THREE.MeshBasicMaterial({ color: 0x888888 }),
//         new THREE.Vector3(0, 2.2, 0)
//       )

//       const safetyPin = createAnimatedPart(
//         'safety_pin_fire-extinguisher',
//         new THREE.BoxGeometry(0.4, 0.1, 0.1),
//         new THREE.MeshBasicMaterial({ color: 0xffff00 }),
//         new THREE.Vector3(0.3, 2.3, 0)
//       )

//       const stamp = createAnimatedPart(
//         'stamp_fire-extinguisher',
//         new THREE.SphereGeometry(0.1, 16, 16),
//         new THREE.MeshBasicMaterial({ color: 0xffffff }),
//         new THREE.Vector3(0.5, 2.25, 0)
//       )

//       const hose = createAnimatedPart(
//         'hose_fire-extinguisher',
//         new THREE.TubeGeometry(
//           new THREE.CatmullRomCurve3([
//             new THREE.Vector3(0, 1.8, 0),
//             new THREE.Vector3(0.5, 1.6, 0),
//             new THREE.Vector3(1, 1.5, 0),
//           ]),
//           20,
//           0.05
//         ),
//         new THREE.MeshBasicMaterial({ color: 0x000000 }),
//         new THREE.Vector3(0, 0, 0)
//       )

//       const handle = createAnimatedPart(
//         'handle_bottom_fire-extinguisher',
//         new THREE.BoxGeometry(0.2, 0.2, 0.6),
//         new THREE.MeshBasicMaterial({ color: 0x333333 }),
//         new THREE.Vector3(0, 2.4, 0.3)
//       )

//       // Добавляем все части в сцену
//       scene.add(body, top, safetyPin, stamp, hose, handle)

//       // Создаем более сложные анимации
//       const createComplexAnimation = (name, affectedPart, animationType) => {
//         const tracks = []
//         const duration = 1
//         const times = [0, duration / 2, duration]

//         switch (animationType) {
//           case 'pull':
//             // Анимация выдергивания чеки
//             tracks.push(
//               new THREE.VectorKeyframeTrack(
//                 `${affectedPart.name}.position`,
//                 times,
//                 [
//                   affectedPart.userData.originalPosition.x,
//                   affectedPart.userData.originalPosition.y,
//                   affectedPart.userData.originalPosition.z,

//                   affectedPart.userData.originalPosition.x + 0.5,
//                   affectedPart.userData.originalPosition.y,
//                   affectedPart.userData.originalPosition.z + 0.2,

//                   affectedPart.userData.originalPosition.x + 1,
//                   affectedPart.userData.originalPosition.y - 0.3,
//                   affectedPart.userData.originalPosition.z,
//                 ]
//               ),
//               new THREE.QuaternionKeyframeTrack(
//                 `${affectedPart.name}.quaternion`,
//                 times,
//                 [0, 0, 0, 1, 0, 0.2, 0, 0.98, 0, 0, 0, 1]
//               )
//             )
//             break

//           case 'rotate':
//             // Анимация вращения (для ручки)
//             tracks.push(
//               new THREE.QuaternionKeyframeTrack(
//                 `${affectedPart.name}.quaternion`,
//                 times,
//                 [0, 0, 0, 1, 0, 0.5, 0, 0.87, 0, 0, 0, 1]
//               )
//             )
//             break

//           case 'move':
//             // Простое перемещение (для шланга)
//             tracks.push(
//               new THREE.VectorKeyframeTrack(
//                 `${affectedPart.name}.position`,
//                 times,
//                 [
//                   ...affectedPart.userData.originalPosition.toArray(),
//                   affectedPart.userData.originalPosition.x + 0.3,
//                   affectedPart.userData.originalPosition.y + 0.2,
//                   affectedPart.userData.originalPosition.z,
//                   ...affectedPart.userData.originalPosition.toArray(),
//                 ]
//               )
//             )
//             break
//         }

//         return new THREE.AnimationClip(name, duration, tracks)
//       }

//       // Создаем анимационные клипы
//       const fallbackAnimations = [
//         createComplexAnimation(
//           'safety_pin_fire-extinguisherAction',
//           safetyPin,
//           'pull'
//         ),
//         createComplexAnimation('stamp_fire-extinguisherAction', stamp, 'pull'),
//         createComplexAnimation('hose_fire-extinguisherAction', hose, 'move'),
//         createComplexAnimation(
//           'handle_bottom_fire-extinguisherAction',
//           handle,
//           'rotate'
//         ),
//       ]

//       return { scene, animations: fallbackAnimations }
//     },
//     []
//   )

//   useEffect(() => {
//     setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
//   }, [])

//   useEffect(() => {
//     if (!modelPath) return

//     const loadModel = async () => {
//       try {
//         const modelResponse = await getModel(modelPath).unwrap()
//         const { scene: loadedScene, animations: loadedAnimations } =
//           await useGLTF.load(modelResponse.url)

//         loadedScene.traverse((node) => {
//           if (node.isMesh) {
//             node.material.transparent = false
//             node.material.depthWrite = true
//             node.cursor = 'pointer'
//           }
//         })

//         // Сначала сбрасываем ошибку, затем устанавливаем модель
//         setErrorText(null)
//         setModel(loadedScene)
//         setAnimations(loadedAnimations)
//         useGLTF.preload(modelResponse.url)
//       } catch (error) {
//         console.error('Failed to load model:', error)

//         // Сначала создаем fallback-модель
//         const { scene: fallbackScene, animations: fallbackAnimations } =
//           createFallbackModel()

//         // Затем атомарно обновляем все состояния
//         setModel(fallbackScene)
//         setAnimations(fallbackAnimations)
//         setErrorText({
//           position: new THREE.Vector3(0, 3, 0),
//           text: 'Модель не загружена. Используется упрощенная версия.',
//           color: '#ff0000',
//           fontSize: '0.5rem',
//         })
//       }
//     }

//     loadModel()

//     return () => {
//       // Очищаем только если модель не является fallback
//       if (model && model.name !== 'fallback-extinguisher') {
//         model.traverse((obj) => {
//           if (obj.isMesh) {
//             obj.geometry?.dispose()
//             obj.material?.dispose()
//           }
//         })
//       }
//       setModel(null)
//       setAnimations([])
//       setErrorText(null)
//     }
//   }, [modelPath, props.isMobile, getModel, createFallbackModel])

//   // Добавляем безопасный mixer
//   const safeMixer = useMemo(
//     () => mixer || new THREE.AnimationMixer(new THREE.Group()),
//     [mixer]
//   )

//   useEffect(() => {
//     if (!safeMixer) return

//     // Очистка при размонтировании
//     return () => {
//       safeMixer.stopAllAction()
//     }
//   }, [safeMixer])

//   const eventHandlers = useMemo(
//     () => ({
//       handlePointerOver: (event) => {
//         if (isTouch || !model) return
//         event.stopPropagation()
//         document.body.style.cursor = 'pointer'

//         const clickedObject = event.object
//         const partName = Object.keys(partTooltips).find((key) =>
//           clickedObject.name.includes(key)
//         )

//         if (partName) {
//           setHoveredPart(partName)
//           setTooltipPosition(
//             new THREE.Vector3(event.point.x, event.point.y + 0.1, event.point.z)
//           )
//         }
//       },
//       handlePointerOut: () => {
//         document.body.style.cursor = 'auto'
//         setHoveredPart(null)
//       },
//       handleClick: (event) => {
//         if (!model || !raycaster || !camera) return
//         event.stopPropagation()

//         raycaster.setFromCamera(event.pointer, camera)

//         if (!model.children) return
//         const intersects = raycaster.intersectObjects(model.children, true)

//         if (intersects.length > 0) {
//           const clickedObject = intersects[0].object
//           if (answerServer.includes(clickedObject.name)) {
//             updateUserAnswers(clickedObject.name)
//           }

//           const action = actions[`${clickedObject.name}Action`]
//           if (action) {
//             action.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true
//             action.play()
//           }
//         }
//       },
//     }),
//     [
//       isTouch,
//       model,
//       partTooltips,
//       raycaster,
//       camera,
//       answerServer,
//       updateUserAnswers,
//       actions,
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

//   useImperativeHandle(ref, () => ({
//     playAnimationSequence: () => {
//       if (!safeMixer || animations.length === 0) {
//         console.warn('Анимации не готовы')
//         return
//       }
//       resetAnimation()
//       setIsPlayingSequence(true)
//       setCurrentStep(0)
//     },
//   }))

//   useFrame(() => {
//     if (!isPlayingSequence || !animationSequence || !model || !actions) return

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
//           object={model}
//           onClick={eventHandlers.handleClick}
//           onPointerOver={eventHandlers.handlePointerOver}
//           onPointerOut={eventHandlers.handlePointerOut}
//           {...props}
//         />
//       )}

//       {model && model.name === 'fallback-extinguisher' && errorText && (
//         <Html
//           position={errorText.position}
//           distanceFactor={10}
//           style={{
//             color: errorText.color,
//             fontSize: errorText.fontSize,
//             whiteSpace: 'nowrap',
//             fontWeight: 'bold',
//             textAlign: 'center',
//             background: 'rgba(255, 255, 255, 0.7)',
//             padding: '4px 8px',
//             borderRadius: '4px',
//           }}
//         >
//           {errorText.text}
//         </Html>
//       )}

//       {hoveredPart && (
//         <Html position={tooltipPosition} distanceFactor={10}>
//           <div
//             style={{
//               background: 'rgba(0,0,0,0.7)',
//               color: 'white',
//               padding: '4px 8px',
//               borderRadius: '4px',
//               fontSize: '14px',
//             }}
//           >
//             {partTooltips[hoveredPart]}
//           </div>
//         </Html>
//       )}
//     </>
//   )
// })

// export default PowderExtinguisher
