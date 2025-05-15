/* eslint-disable react/no-unknown-property */

import { useRef, useMemo, useState } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const FireShaderMaterial = shaderMaterial(
  {
    time: 0,
    color1: new THREE.Color(0xff4500), // Основной цвет (оранжево-красный)
    color2: new THREE.Color(0xffff00), // Верхний цвет (жёлтый)
    color3: new THREE.Color(0x8b0000), // Базовый цвет (тёмно-красный)
    intensity: 1.5,
    speed: 1.0,
    distortion: 2.0,
    turbulence: 0.5,
    fireProgress: 0, // Прогресс горения (0-1)
  },
  // Vertex Shader (упрощённая версия с плавными переходами)
  `
  uniform float time;
  uniform float distortion;
  uniform float turbulence;
  uniform float fireProgress;
  varying vec2 vUv;
  
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 151.7182))) * 43758.5453);
  }
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Плавное применение эффектов в зависимости от прогресса
    float activeEffect = smoothstep(0.0, 1.0, fireProgress);
    float displacement = sin(pos.y * 10.0 + time * 2.0) * 0.1 * activeEffect;
    displacement += noise(pos * 3.0 + time) * turbulence * activeEffect;
    
    pos.x += displacement * distortion * activeEffect;
    pos.z += displacement * distortion * activeEffect;
    pos.y *= activeEffect; // Уменьшаем высоту при затухании
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
  `,
  // Fragment Shader (оптимизированная версия)
  `
  uniform float time;
  uniform float intensity;
  uniform float speed;
  uniform float fireProgress;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  varying vec2 vUv;
  
  float simpleNoise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    // Полностью скрываем если огонь потушен
    if (fireProgress < 0.01) discard;
    
    // Градиент от основания к вершине
    float gradient = smoothstep(0.0, 0.8, vUv.y);
    
    // Шум для эффекта пламени
    vec2 noisePos = vec2(vUv.x * 2.0, vUv.y * 3.0 - time * speed);
    float noise = simpleNoise(noisePos) * 0.5 + 
                 simpleNoise(noisePos * 2.0) * 0.3;
    
    // Форма пламени с учётом прогресса горения
    float flame = noise * (1.0 - gradient) * fireProgress * intensity;
    
    // Цветовой градиент
    vec3 baseColor = mix(color3, color1, flame * 2.0);
    vec3 finalColor = mix(baseColor, color2, flame * 3.0 * (1.0 - gradient));
    
    // Альфа-канал с мерцанием
    float alpha = flame * (0.8 + 0.2 * sin(time * 8.0));
    
    gl_FragColor = vec4(finalColor, alpha);
    if (gl_FragColor.a < 0.1) discard;
  }
  `
)

extend({ FireShaderMaterial })

export default function FirePlane({
  rotation = [-Math.PI / 2, 0, 0], // Ориентация плоскости
  position = [0, 0, 0], // Позиция в пространстве
  size = [4, 8], // Размер (ширина, высота)
  intensity = 1.5, // Интенсивность пламени
  speed = 0.6, // Скорость анимации
  isBurning = false, // Состояние горения
  onExtinguished = () => {}, // Колбек при тушении
  onFullyIgnited = () => {}, // Колбек при разгорании
}) {
  const materialRef = useRef()
  const meshRef = useRef()
  const [fireProgress, setFireProgress] = useState(0)

  // Оптимизированная геометрия с мемоизацией
  const geometry = useMemo(
    () => new THREE.PlaneGeometry(size[0], size[1], 32, 32),
    [size]
  )

  useFrame(({ clock }) => {
    if (!materialRef.current) return

    // Обновляем время для анимации
    materialRef.current.time = clock.elapsedTime

    // Плавное изменение прогресса горения
    const targetProgress = isBurning ? 1 : 0
    const newProgress = THREE.MathUtils.lerp(fireProgress, targetProgress, 0.1)

    setFireProgress(newProgress)
    materialRef.current.fireProgress = newProgress

    // Вызов колбеков при достижении крайних состояний
    if (newProgress >= 0.99 && isBurning) {
      onFullyIgnited()
    } else if (newProgress <= 0.01 && !isBurning) {
      onExtinguished()
    }
  })

  return (
    <mesh
      ref={meshRef}
      rotation={rotation}
      position={position}
      visible={fireProgress > 0.01} // Полностью скрываем при потухании
    >
      <bufferGeometry attach="geometry" {...geometry} />
      <fireShaderMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        intensity={intensity}
        speed={speed}
        fireProgress={fireProgress}
      />
    </mesh>
  )
}
