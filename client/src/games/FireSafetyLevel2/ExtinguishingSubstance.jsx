import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const ExtinguishingSubstance = ({ isActive, position, direction }) => {
  const particlesRef = useRef()
  const progress = useRef(0)

  // Геометрия частиц с конусообразным распределением
  const particlesGeometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    const count = 2000 // Увеличили количество частиц
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Конусообразное распределение
      const radius = Math.random() * 0.2 // Узкое основание
      const angle = Math.random() * Math.PI * 2
      const y = Math.random() * 0.2 // Начинаем сразу у основания

      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = y // Близко к основанию
      positions[i * 3 + 2] = Math.sin(angle) * radius

      sizes[i] = 0.1 + Math.random() * 0.3 // Меньшие частицы
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geom
  }, [])

  const particlesMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.2,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    []
  )

  useFrame((state, delta) => {
    if (!particlesRef.current) return

    // Плавное появление/исчезновение
    progress.current = THREE.MathUtils.lerp(
      progress.current,
      isActive ? 1 : 0,
      0.15
    )

    // Анимация частиц
    const particles = particlesRef.current
    const positions = particles.geometry.attributes.position.array

    for (let i = 0; i < positions.length; i += 3) {
      // Движение по направлению с небольшим разбросом
      const speed = 0.2 + Math.random() * 0.1
      positions[i] += (Math.random() - 0.5) * 0.02
      positions[i + 1] += speed * direction[1] * delta * 30
      positions[i + 2] += speed * direction[2] * delta * 30

      // Возврат частиц в начало при выходе за пределы
      if (
        positions[i + 1] > 6 ||
        Math.abs(positions[i]) > 3 ||
        Math.abs(positions[i + 2]) > 3
      ) {
        const radius = Math.random() * 0.3
        const angle = Math.random() * Math.PI * 2
        positions[i] = Math.cos(angle) * radius
        positions[i + 1] = Math.random() * 0.2
        positions[i + 2] = Math.sin(angle) * radius
      }
    }

    particles.geometry.attributes.position.needsUpdate = true

    // Управление видимостью через прозрачность
    particlesMaterial.opacity = progress.current * 0.9
  })

  return (
    <group position={position}>
      <points
        ref={particlesRef}
        geometry={particlesGeometry}
        material={particlesMaterial}
      />
    </group>
  )
}

export default ExtinguishingSubstance

// import { useRef, useMemo } from 'react'
// import * as THREE from 'three'
// import { useFrame } from '@react-three/fiber'

// const ExtinguishingSubstance = ({ isActive, position, direction }) => {
//   const groupRef = useRef()
//   const coneRef = useRef()
//   const particlesRef = useRef()
//   const progress = useRef(0)

//   // Геометрия конуса (увеличенные размеры)
//   const coneGeometry = useMemo(() => {
//     const geom = new THREE.ConeGeometry(0.6, 6, 64)
//     geom.translate(0, 3, 0)
//     return geom
//   }, [])

//   // Материал конуса
//   const coneMaterial = useMemo(
//     () =>
//       new THREE.MeshStandardMaterial({
//         color: new THREE.Color(0.3, 0.7, 1.0),
//         transparent: true,
//         opacity: 0,
//         roughness: 0.2,
//         metalness: 0.1,
//         side: THREE.DoubleSide,
//         emissive: 0x0099ff,
//         emissiveIntensity: 0.5,
//       }),
//     []
//   )

//   // Геометрия частиц с конусообразным распределением
// const particlesGeometry = useMemo(() => {
//   const geom = new THREE.BufferGeometry()
//   const count = 2000 // Увеличили количество частиц
//   const positions = new Float32Array(count * 3)
//   const sizes = new Float32Array(count)

//   for (let i = 0; i < count; i++) {
//     // Конусообразное распределение
//     const radius = Math.random() * 0.2 // Узкое основание
//     const angle = Math.random() * Math.PI * 2
//     const y = Math.random() * 0.2 // Начинаем сразу у основания

//     positions[i * 3] = Math.cos(angle) * radius
//     positions[i * 3 + 1] = y // Близко к основанию
//     positions[i * 3 + 2] = Math.sin(angle) * radius

//     sizes[i] = 0.1 + Math.random() * 0.3 // Меньшие частицы
//   }

//   geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
//   geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
//   return geom
// }, [])

// const particlesMaterial = useMemo(
//   () =>
//     new THREE.PointsMaterial({
//       color: 0x88ccff,
//       size: 0.2,
//       transparent: true,
//       opacity: 0.9,
//       blending: THREE.AdditiveBlending,
//       sizeAttenuation: true,
//     }),
//   []
// )

//   useFrame((state, delta) => {
//     if (!groupRef.current || !coneRef.current || !particlesRef.current) return

//     // Плавное появление/исчезновение
//     progress.current = THREE.MathUtils.lerp(
//       progress.current,
//       isActive ? 1 : 0,
//       0.15
//     )

//     // Ориентация всей группы
//     groupRef.current.rotation.set(
//       Math.atan2(direction[0], direction[0]),
//       Math.asin(-direction[0]),
//       0
//     )

//     // Анимация конуса
//     coneRef.current.scale.set(
//       progress.current * 0.8,
//       progress.current * 1.2,
//       progress.current * 0.8
//     )
//     coneRef.current.material.opacity = progress.current * 0.7

//     // Анимация частиц с конусообразным движением
//     const particles = particlesRef.current
//     if (particles) {
//       const positions = particles.geometry.attributes.position.array
//       for (let i = 0; i < positions.length; i += 3) {
//         // Движение вперед по направлению с небольшим разбросом
//         const speed = 0.2 + Math.random() * 0.1
//         positions[i] += (Math.random() - 0.5) * 0.02
//         positions[i + 1] += speed * direction[1] * delta * 30
//         positions[i + 2] += speed * direction[2] * delta * 30

//         // Возврат частиц в начало при выходе за пределы
//         if (
//           positions[i + 1] > 6 ||
//           Math.abs(positions[i]) > 3 ||
//           Math.abs(positions[i + 2]) > 3
//         ) {
//           // Возвращаем в конусообразное распределение у основания
//           const radius = Math.random() * 0.3
//           const angle = Math.random() * Math.PI * 1
//           positions[i] = Math.cos(angle) * radius
//           positions[i + 1] = Math.random() * 0.2
//           positions[i + 2] = Math.sin(angle) * radius
//         }
//       }
//       particles.geometry.attributes.position.needsUpdate = true
//     }
//   })

//   return (
//     <group position={position} ref={groupRef}>
//       <mesh ref={coneRef} geometry={coneGeometry} material={coneMaterial}>
//         <pointLight color={0x66aaff} intensity={2} distance={5} />
//       </mesh>

//       <points
//         ref={particlesRef}
//         geometry={particlesGeometry}
//         material={particlesMaterial}
//       />
//     </group>
//   )
// }

// export default ExtinguishingSubstance
