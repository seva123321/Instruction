// // В родительском компоненте
// import FirePlane from '../CustomFire'
// import { Html } from '@react-three/drei'

//   const [isBurning, setIsBurning] = useState(false)
//   const [message, setMessage] = useState('Огонь выключен')

// <FirePlane
//         position={[0, 0.5, 0]}
//         isBurning={isBurning}
//         onExtinguished={() => setMessage('Огонь потушен')}
//         onFullyIgnited={() => setMessage('Огонь полностью разгорелся')}
//       />

//     <Html
//         position={[0, -2, 0]} // Позиция в 3D пространстве
//         transform // Сохраняет позиционирование при движении камеры
//         occlude // Учитывает occlusion culling
//         wrapperClass="fire-controls" // Класс для стилизации
//       >
//         <div
//           style={{
//             position: 'absolute',
//             bottom: '20px',
//             left: '50%',
//             transform: 'translateX(-50%)',
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             gap: '10px',
//             background: 'rgba(0,0,0,0.5)',
//             padding: '15px',
//             borderRadius: '10px',
//             color: 'white',
//           }}
//         >
//           <div style={{ fontSize: '18px' }}>{message}</div>
//           <div style={{ display: 'flex', gap: '10px' }}>
//             <button
//               onClick={() => setIsBurning(true)}
//               style={{
//                 padding: '10px 20px',
//                 backgroundColor: '#4CAF50',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '5px',
//                 cursor: 'pointer',
//               }}
//             >
//               Зажечь огонь
//             </button>
//             <button
//               onClick={() => setIsBurning(false)}
//               style={{
//                 padding: '10px 20px',
//                 backgroundColor: '#ff4444',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '5px',
//                 cursor: 'pointer',
//               }}
//             >
//               Потушить огонь
//             </button>
//           </div>
//         </div>
//       </Html>

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

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
  size = [2, 3], // Размер (ширина, высота)
  intensity = 1.5, // Интенсивность пламени
  speed = 1.0, // Скорость анимации
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

// import { useRef } from 'react'
// import { useFrame } from '@react-three/fiber'
// import { shaderMaterial } from '@react-three/drei'
// import * as THREE from 'three'
// import { extend } from '@react-three/fiber'

// // использование
// //  <FirePlane position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} />

// // Define the custom fire shader material
// const FireShaderMaterial = shaderMaterial(
//   // Uniforms
//   {
//     time: 0,
//     color1: new THREE.Color('#ff4500'),
//     color2: new THREE.Color('#ffff00'),
//   },
//   // Vertex Shader
//   `
//   varying vec2 vUv;
//   void main()
//   {
//     vUv = uv;
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
//   }
//   `,
//   // Fragment Shader
//   `
//   uniform float time;
//   uniform vec3 color1;
//   uniform vec3 color2;
//   varying vec2 vUv;

//   // Simplex noise functions from https://github.com/ashima/webgl-noise
//   vec3 mod289(vec3 x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
//   }
//   vec4 mod289(vec4 x) {
//     return x - floor(x * (1.0 / 289.0)) * 289.0;
//   }
//   vec4 permute(vec4 x) {
//     return mod289(((x*34.0)+1.0)*x);
//   }
//   vec4 taylorInvSqrt(vec4 r)
//   {
//     return 1.79284291400159 - 0.85373472095314 * r;
//   }
//   float snoise(vec3 v)
//   {
//     const vec2  C = vec2(1.0/6.0, 1.0/3.0);
//     const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

//     // First corner
//     vec3 i  = floor(v + dot(v, C.yyy) );
//     vec3 x0 =   v - i + dot(i, C.xxx) ;

//     // Other corners
//     vec3 g = step(x0.yzx, x0.xyz);
//     vec3 l = 1.0 - g;
//     vec3 i1 = min( g.xyz, l.zxy );
//     vec3 i2 = max( g.xyz, l.zxy );

//     // x0 = x0 - 0.0 + 0.0 * C.x;
//     vec3 x1 = x0 - i1 + 1.0 * C.x;
//     vec3 x2 = x0 - i2 + 2.0 * C.x;
//     vec3 x3 = x0 - 1.0 + 3.0 * C.x;

//     // Permutations
//     i = mod289(i);
//     vec4 p = permute( permute( permute(
//               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
//             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
//             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

//     // Gradients: 7x7x6 points over a cube, mapped onto 3D gradients
//     float n_ = 0.142857142857; // 1.0/7.0
//     vec3  ns = n_ * D.wyz - D.xzx;

//     vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

//     vec4 x_ = floor(j * ns.z);
//     vec4 y_ = floor(j - 7.0 * x_);

//     vec4 x = x_ *ns.x + ns.y;
//     vec4 y = y_ *ns.x + ns.y;
//     vec4 h = 1.0 - abs(x) - abs(y);

//     vec4 b0 = vec4( x.xy, y.xy );
//     vec4 b1 = vec4( x.zw, y.zw );

//     vec4 s0 = floor(b0)*2.0 + 1.0;
//     vec4 s1 = floor(b1)*2.0 + 1.0;
//     vec4 sh = -step(h, vec4(0.0));

//     vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
//     vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

//     vec3 p0 = vec3(a0.xy,h.x);
//     vec3 p1 = vec3(a0.zw,h.y);
//     vec3 p2 = vec3(a1.xy,h.z);
//     vec3 p3 = vec3(a1.zw,h.w);

//     // Normalise gradients
//     vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
//     p0 *= norm.x;
//     p1 *= norm.y;
//     p2 *= norm.z;
//     p3 *= norm.w;

//     // Mix contributions from the four corners
//     vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
//     m = m * m;
//     return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
//                                   dot(p2,x2), dot(p3,x3) ) );
//   }

//   void main() {
//     float n = snoise(vec3(vUv * 3.0, time * 2.0));

//     float intensity = smoothstep(0.0, 1.2, n + vUv.y);

//     // Fire color gradient from bottom (red) to top (yellow)
//     vec3 color = mix(color1, color2, intensity);

//     // Flickering alpha for more natural fire effect
//     float alpha = intensity * (0.5 + 0.5 * sin(time * 20.0 + vUv.x * 10.0));

//     gl_FragColor = vec4(color, alpha);

//     // Discard low alpha pixels to make transparent background
//     if (gl_FragColor.a < 0.05) discard;
//   }
//   `
// )

// extend({ FireShaderMaterial })

// export default function FirePlane({
//   rotation = [0, 0, 0],
//   position = [-Math.PI / 2, 0, 0],
// }) {
//   const materialRef = useRef()

//   useFrame(({ clock }) => {
//     if (materialRef.current) {
//       materialRef.current.time = clock.elapsedTime
//     }
//   })

//   return (
//     <mesh rotation={rotation} position={position}>
//       <planeGeometry args={[2, 3, 32, 32]} />
//       <fireShaderMaterial ref={materialRef} transparent />
//     </mesh>
//   )
// }
