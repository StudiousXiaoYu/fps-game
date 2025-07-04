import React from 'react'
import { Sphere } from '@react-three/drei'

export default function Enemy({ id, position }) {
  return (
    <Sphere args={[0.3, 16, 16]} position={position}>
      <meshStandardMaterial color="red" />
    </Sphere>
  )
} 