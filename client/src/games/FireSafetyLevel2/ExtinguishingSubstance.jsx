/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

function ExtinguishingSubstance({ isActive, position, direction }) {
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
