import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 粒子数量
const PARTICLE_COUNT = 24;
// 爆炸持续时间（秒）
const DURATION = 0.8;

export default function Explosion({ position, onEnd }) {
  const groupRef = useRef();
  const startTime = useRef();
  // 随机生成粒子初始方向
  const directions = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => {
      const dir = new THREE.Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize();
      return dir;
    })
  );

  useFrame(({ clock }) => {
    if (!startTime.current) startTime.current = clock.getElapsedTime();
    const elapsed = clock.getElapsedTime() - startTime.current;
    if (elapsed > DURATION) {
      if (onEnd) onEnd();
      return;
    }
    // 粒子发散动画
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, i) => {
        const speed = 4 + Math.random() * 2;
        mesh.position.x = directions.current[i].x * speed * elapsed;
        mesh.position.y = directions.current[i].y * speed * elapsed;
        mesh.position.z = directions.current[i].z * speed * elapsed;
        mesh.material.opacity = 1 - elapsed / DURATION;
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {directions.current.map((dir, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={'orange'} transparent opacity={1} />
        </mesh>
      ))}
    </group>
  );
} 