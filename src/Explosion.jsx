import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function Explosion({ position, onEnd }) {
  const meshRef = useRef()
  const start = useRef(performance.now())

  useFrame(() => {
    const elapsed = (performance.now() - start.current) / 1000
    if (meshRef.current) {
      meshRef.current.scale.set(1 + elapsed * 2, 1 + elapsed * 2, 1 + elapsed * 2)
      meshRef.current.material.opacity = Math.max(0, 1 - elapsed)
    }
    if (elapsed > 1 && onEnd) {
      onEnd()
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="orange" transparent opacity={1} />
    </mesh>
  )
} 