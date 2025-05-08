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
} from 'react'
import * as THREE from 'three'

import useQuizPage from '@/hook/useQuizPage'

const PowderExtinguisher = forwardRef((props, ref) => {
  const group = useRef()
  const { scene, animations } = useGLTF(
    '/models/fire_extinguisher_powder/scene.gltf'
  )
  const { actions } = useAnimations(animations, group)

  const [isTouch, setIsTouch] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)
  const [hoveredPart, setHoveredPart] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0])
  const { gameData } = useQuizPage()

  const animationSequence = [
    'Safety_pin_fire-extinguisher',
    'Stamp_fire-extinguisher',
    'Hose_fire-extinguisher',
    'Handle_bottom_fire-extinguisher',
  ]

  // Подсказки для элементов
  const partTooltips = {
    Safety_pin: 'Предохранительная чека',
    Stamp: 'Пломба',
    Hose: 'Шланг',
    Handle_bottom: 'Ручка активации',
  }

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const { isMobile } = props

  // Настройка материалов
  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh) {
        const box = new THREE.Box3().setFromObject(node)
        const size = box.getSize(new THREE.Vector3())

        // Изменение размера для мобильных устройств
        if (
          (isMobile && node.name === 'Safety_pin_fire-extinguisher') ||
          node.name === 'Stamp_fire-extinguisher'
        ) {
          node.geometry.scale(1.3, 1, 1.3)
          node.geometry.attributes.position.needsUpdate = true
          node.geometry.computeBoundingBox()
          node.geometry.computeBoundingSphere()
        }

        if (size.length() > 1.5) {
          node.material = new THREE.MeshStandardMaterial({
            color: '#8B0000',
            transparent: false,
            opacity: 1,
          })
        }

        node.cursor = 'pointer'
      }
    })
  }, [scene, isMobile])

  const resetAnimation = () => {
    // 1. Останавливаем все текущие анимации
    Object.values(actions).forEach((action) => {
      if (action && typeof action.stop === 'function') {
        action.stop()
      }
    })

    // 2. Сбрасываем время всех анимаций
    Object.values(actions).forEach((action) => {
      if (action && typeof action.reset === 'function') {
        action.reset()
      }
    })

    // // 3. Возвращаем модель в исходное состояние
    // scene.traverse(object => {
    //   if (object.isMesh) {
    //     // Сбрасываем позицию, вращение и масштаб
    //     object.position.set(0, 0, 0)
    //     object.rotation.set(0, 0, 0)
    //     object.scale.set(1, 1, 1)

    //     // Если используете морфинг или скелетную анимацию
    //     if (object.morphTargetInfluences) {
    //       object.morphTargetInfluences.fill(0)
    //     }
    //   }
    // })

    // 4. Сбрасываем состояние анимации
    setCurrentStep(0)
    setIsPlayingSequence(false)
  }

  // Экспортируем функции для родительского компонента
  useImperativeHandle(ref, () => ({
    playAnimationSequence: () => {
      if (!isPlayingSequence) {
        resetAnimation()
        setIsPlayingSequence(true)
        setCurrentStep(0)
      }
    },
  }))

  // Управление последовательностью анимаций
  useFrame(() => {
    if (!isPlayingSequence) return

    const currentActionName = animationSequence[currentStep]
    const action = actions[`${currentActionName}Action`]

    if (!action) {
      console.warn(`Action not found: ${currentActionName}`)
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

  const { raycaster, camera } = useThree()

  const handlePointerOver = (event) => {
    if (isTouch) return
    event.stopPropagation()
    document.body.style.cursor = 'pointer'

    const clickedObject = event.object
    // Поднимаем точку на 10% выше исходной позиции
    const offsetY = 0.1
    const elevatedPoint = new THREE.Vector3(
      event.point.x,
      event.point.y + offsetY,
      event.point.z
    )

    setTooltipPosition(elevatedPoint)

    // Находим подходящую подсказку
    const partName = Object.keys(partTooltips).find(
      (key) => clickedObject.name.includes(key)
      // eslint-disable-next-line function-paren-newline
    )

    if (partName) {
      setHoveredPart(partName)
    }
  }

  const handlePointerOut = () => {
    document.body.style.cursor = 'auto'
    setHoveredPart(null)
  }

  const handleClick = (event) => {
    event.stopPropagation()
    raycaster.setFromCamera(event.pointer, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object
      // console.log('Clicked object:', clickedObject.name)

      // Вариант 1: если анимация называется так же как объект
      if (actions[clickedObject.name]) {
        const action = actions[clickedObject.name]
        action.reset()
        action.setLoop(THREE.LoopOnce)
        action.clampWhenFinished = true
        action.play()
        // eslint-disable-next-line brace-style
      }
      // Вариант 2: поиск по части имени
      else {
        const matchingAction = Object.keys(actions).find(
          (key) => key.includes(clickedObject.name)
          // eslint-disable-next-line function-paren-newline
        )
        if (matchingAction) {
          const action = actions[matchingAction]
          action.reset()
          action.setLoop(THREE.LoopOnce)
          action.clampWhenFinished = true // Это свойство, а не метод
          action.play()
        }
      }
    }
  }

  return (
    <>
      <primitive
        ref={group}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        object={scene}
        {...props}
      />

      {/* Подсказка при наведении */}
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

useGLTF.preload('/models/fire_extinguisher_powder/scene.gltf')

export default PowderExtinguisher

// import { useGLTF, useAnimations, Html } from '@react-three/drei'
// import { useThree, useFrame } from '@react-three/fiber'
// import useQuizPage from '@/hook/useQuizPage'
// import {
//   forwardRef,
//   useRef,
//   useState,
//   useEffect,
//   useImperativeHandle,
// } from 'react'
// import * as THREE from 'three'

// const PowderExtinguisher = forwardRef((props, ref) => {
//   const group = useRef()

//   const [isTouch, setIsTouch] = useState(false)
//   const [currentStep, setCurrentStep] = useState(0)
//   const [isPlayingSequence, setIsPlayingSequence] = useState(false)
//   const [hoveredPart, setHoveredPart] = useState(null)
//   const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0])
//   const { gameData } = useQuizPage()
//   const { scene, animations } = useGLTF(gameData.model_path)
//   const { actions } = useAnimations(animations, group)
//   // console.log('gameData >', gameData)

//   // Предзагрузка модели
//   useEffect(() => {
//     if (gameData?.model_path) {
//       useGLTF.preload(gameData.model_path)
//     }
//   }, [gameData?.model_path])

//   // const animationSequence = [
//   //   'Safety_pin_fire-extinguisher',
//   //   'Stamp_fire-extinguisher',
//   //   'Hose_fire-extinguisher',
//   //   'Handle_bottom_fire-extinguisher',
//   // ]

//   // Подсказки для элементов
//   // const partTooltips = {
//   //   Safety_pin: 'Предохранительная чека',
//   //   Stamp: 'Пломба',
//   //   Hose: 'Шланг',
//   //   Handle_bottom: 'Ручка активации',
//   // }

//   useEffect(() => {
//     setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
//   }, [])

//   const { isMobile } = props

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

//   const resetAnimation = () => {
//     // 1. Останавливаем все текущие анимации
//     Object.values(actions).forEach((action) => {
//       if (action && typeof action.stop === 'function') {
//         action.stop()
//       }
//     })

//     // 2. Сбрасываем время всех анимаций
//     Object.values(actions).forEach((action) => {
//       if (action && typeof action.reset === 'function') {
//         action.reset()
//       }
//     })

//     // // 3. Возвращаем модель в исходное состояние
//     // scene.traverse(object => {
//     //   if (object.isMesh) {
//     //     // Сбрасываем позицию, вращение и масштаб
//     //     object.position.set(0, 0, 0)
//     //     object.rotation.set(0, 0, 0)
//     //     object.scale.set(1, 1, 1)

//     //     // Если используете морфинг или скелетную анимацию
//     //     if (object.morphTargetInfluences) {
//     //       object.morphTargetInfluences.fill(0)
//     //     }
//     //   }
//     // })

//     // 4. Сбрасываем состояние анимации
//     setCurrentStep(0)
//     setIsPlayingSequence(false)
//   }

//   // Экспортируем функции для родительского компонента
//   useImperativeHandle(ref, () => ({
//     playAnimationSequence: () => {
//       if (!isPlayingSequence) {
//         resetAnimation()
//         setIsPlayingSequence(true)
//         setCurrentStep(0)
//       }
//     },
//   }))

//   // Управление последовательностью анимаций
//   useFrame(() => {
//     if (!isPlayingSequence || !gameData?.animationSequence) return

//     const currentActionName = gameData.animationSequence[currentStep]
//     const action = actions[`${currentActionName}Action`]

//     if (!action) {
//       console.warn(`Action not found: ${currentActionName}`)
//       if (currentStep < gameData.animationSequence.length - 1) {
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
//         if (currentStep < gameData.animationSequence.length - 1) {
//           setCurrentStep((prev) => prev + 1)
//         } else {
//           setIsPlayingSequence(false)
//         }
//       }
//     }
//   })

//   const { raycaster, camera } = useThree()

//   const handlePointerOver = (event) => {
//     if (isTouch) return
//     event.stopPropagation()
//     document.body.style.cursor = 'pointer'

//     const clickedObject = event.object
//     // Поднимаем точку на 10% выше исходной позиции
//     const offsetY = 0.1
//     const elevatedPoint = new THREE.Vector3(
//       event.point.x,
//       event.point.y + offsetY,
//       event.point.z
//     )

//     setTooltipPosition(elevatedPoint)

//     // Находим подходящую подсказку
//     const partName = Object.keys(gameData.partTooltips).find((key) =>
//       clickedObject.name.includes(key)
//     )

//     if (partName) {
//       setHoveredPart(partName)
//     }
//   }

//   const handlePointerOut = () => {
//     document.body.style.cursor = 'auto'
//     setHoveredPart(null)
//   }

//   const handleClick = (event) => {
//     event.stopPropagation()
//     raycaster.setFromCamera(event.pointer, camera)
//     const intersects = raycaster.intersectObjects(scene.children, true)

//     if (intersects.length > 0) {
//       const clickedObject = intersects[0].object
//       // console.log('Clicked object:', clickedObject.name)

//       // Вариант 1: если анимация называется так же как объект
//       if (actions[clickedObject.name]) {
//         const action = actions[clickedObject.name]
//         action.reset()
//         action.setLoop(THREE.LoopOnce)
//         action.clampWhenFinished = true
//         action.play()
//       }
//       // Вариант 2: поиск по части имени
//       else {
//         const matchingAction = Object.keys(actions).find((key) =>
//           key.includes(clickedObject.name)
//         )
//         if (matchingAction) {
//           const action = actions[matchingAction]
//           action.reset()
//           action.setLoop(THREE.LoopOnce)
//           action.clampWhenFinished = true // Это свойство, а не метод
//           action.play()
//         }
//       }
//     }
//   }

//   return (
//     <>
//       <primitive
//         ref={group}
//         onClick={handleClick}
//         onPointerOver={handlePointerOver}
//         onPointerOut={handlePointerOut}
//         object={scene}
//         {...props}
//       />

//       {/* Подсказка при наведении */}
//       {hoveredPart && (
//         <Html position={tooltipPosition} distanceFactor={10}>
//           <div
//             style={{
//               background: 'rgba(0, 0, 0, 0.8)',
//               color: 'white',
//               padding: '4px 8px',
//               borderRadius: '4px',
//               fontSize: '10px',
//               whiteSpace: 'nowrap',
//               pointerEvents: 'none',
//               transform: 'translate(-50%, -100%)',
//             }}
//           >
//             {gameData.partTooltips[hoveredPart]}
//           </div>
//         </Html>
//       )}
//     </>
//   )
// })

// // useGLTF.preload('/models/fire_extinguisher_powder/scene.gltf')
// // useGLTF.preload(gameData.model_path)

// export default PowderExtinguisher
