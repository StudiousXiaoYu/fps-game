import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { WeaponSystem, weaponData } from './WeaponSystem'
import * as THREE from 'three'
import Enemy from './Enemy'
import Explosion from './Explosion'
import React, { createContext, useContext } from 'react'

// 射击事件上下文
const ShootingContext = createContext(null)

function EnemyManager() {
  const [enemies, setEnemies] = useState(() => {
    // 生成5个随机位置和方向的敌人
    const arr = []
    for (let i = 0; i < 5; i++) {
      arr.push({
        id: i,
        position: [
          Math.random() * 16 - 8, // x: -8~8
          1.6,
          Math.random() * 16 - 8 // z: -8~8
        ],
        direction: [
          Math.random() * 2 - 1,
          0,
          Math.random() * 2 - 1
        ]
      })
    }
    return arr
  })
  const [explosions, setExplosions] = useState([])
  const shootEvent = useContext(ShootingContext)

  // 监听射击事件
  useEffect(() => {
    if (
      !shootEvent ||
      !shootEvent.raycaster ||
      !shootEvent.raycaster.ray ||
      !(shootEvent.raycaster.ray.origin instanceof THREE.Vector3) ||
      !(shootEvent.raycaster.ray.direction instanceof THREE.Vector3)
    ) return;
    const { origin, direction } = shootEvent.raycaster.ray;
    console.log('ray origin:', origin, 'direction:', direction);
    if (
      typeof origin.x !== 'number' || typeof origin.y !== 'number' || typeof origin.z !== 'number' ||
      typeof direction.x !== 'number' || typeof direction.y !== 'number' || typeof direction.z !== 'number'
    ) return;
    const { raycaster } = shootEvent;
    let hitId = null;
    let hitPos = null;
    for (const enemy of enemies) {
      try {
        if (
          !enemy.position ||
          !Array.isArray(enemy.position) ||
          enemy.position.length !== 3 ||
          enemy.position.some(v => typeof v !== 'number' || isNaN(v))
        ) continue;
        const sphere = new THREE.Sphere(new THREE.Vector3(...enemy.position), 0.3);
        // 深拷贝 ray
        const ray = raycaster.ray.clone();
        console.log('检测enemy', enemy.id, 'sphere', sphere, 'ray', ray);
        const intersection = ray.intersectSphere(sphere);
        if (intersection) {
          hitId = enemy.id;
          hitPos = intersection;
          break;
        }
      } catch (err) {
        console.error('检测enemy出错', enemy, err);
        return;
      }
    }
    if (hitId !== null) {
      setEnemies(prev => prev.filter(e => e.id !== hitId));
      setExplosions(prev => [...prev, { pos: hitPos, id: Math.random() }]);
    }
    // eslint-disable-next-line
  }, [shootEvent]);

  useFrame(() => {
    setEnemies(prev => prev.map(enemy => {
      let [x, y, z] = enemy.position
      let [dx, dy, dz] = enemy.direction
      // 移动速度
      const speed = 1.5 / 60
      x += dx * speed
      z += dz * speed
      // 边界检测（场地范围-10~10）
      if (x < -9 || x > 9) dx = -dx
      if (z < -9 || z > 9) dz = -dz
      return {
        ...enemy,
        position: [
          Math.max(-9, Math.min(9, x)),
          y,
          Math.max(-9, Math.min(9, z))
        ],
        direction: [dx, dy, dz]
      }
    }))
  })

  return (
    <>
      {enemies.map(enemy => (
        <Enemy key={enemy.id} id={enemy.id} position={enemy.position} />
      ))}
      {explosions.map(e => (
        <Explosion key={e.id} position={e.pos} onEnd={() => setExplosions(prev => prev.filter(x => x.id !== e.id))} />
      ))}
    </>
  )
}

export function FPSScene({ onShoot }) {
  const controlsRef = useRef()
  const weaponSystemRef = useRef()
  const [weaponInfo, setWeaponInfo] = useState({ weapon: 'rifle', ammo: weaponData.rifle.ammo })
  const [bulletHoles, setBulletHoles] = useState([])
  const [shootEvent, setShootEvent] = useState(null)

  // 只保留步枪切换和换弹的 useEffect
  useEffect(() => {
    let shooting = false
    let shootInterval = null
    const handleKeyDown = (e) => {
      if (e.code === 'Digit1') {
        weaponSystemRef.current?.switchWeapon('pistol')
        setWeaponInfo(info => ({ ...info, weapon: 'pistol' }))
      } else if (e.code === 'Digit2') {
        weaponSystemRef.current?.switchWeapon('rifle')
        setWeaponInfo(info => ({ ...info, weapon: 'rifle' }))
      } else if (e.code === 'KeyR') {
        weaponSystemRef.current?.reloadWeapon()
      }
    }
    const startShooting = () => {
      if (shooting) return
      shooting = true
      // 立即射击一次
      weaponSystemRef.current?.fireWeapon()
      if (onShoot) onShoot()
      // 步枪射速取决于 cooldown
      shootInterval = setInterval(() => {
        weaponSystemRef.current?.fireWeapon()
        if (onShoot) onShoot()
      }, weaponData.rifle.cooldown * 1000)
    }
    const stopShooting = () => {
      shooting = false
      if (shootInterval) {
        clearInterval(shootInterval)
        shootInterval = null
      }
    }
    const handleMouseDown = (e) => {
      if (e.button === 0) {
        startShooting()
      }
    }
    const handleMouseUp = (e) => {
      if (e.button === 0) {
        stopShooting()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      stopShooting()
    }
  }, [onShoot])

  // 监听弹药变化
  useEffect(() => {
    const interval = setInterval(() => {
      if (weaponSystemRef.current) {
        const weapon = weaponInfo.weapon
        // 通过 ref 访问 WeaponSystem 的 ammo
        setWeaponInfo(info => ({ ...info, ammo: weaponSystemRef.current.ammo?.[weapon] ?? 0 }))
      }
    }, 100)
    return () => clearInterval(interval)
  }, [weaponInfo.weapon])
  
  // 弹孔3秒后淡出消失
  useEffect(() => {
    if (!bulletHoles.length) return
    const id = setInterval(() => {
      setBulletHoles(holes => holes.filter(hole => performance.now() - hole.born < 3000))
    }, 200)
    return () => clearInterval(id)
  }, [bulletHoles.length])

  // 基础场景元素
  const SceneElements = () => {
    return (
      <>
        {/* 地面 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        {/* 简单墙壁 */}
        <mesh position={[0, 0, -10]}>
          <boxGeometry args={[20, 4, 1]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
      </>
    )
  }

  return (
    <>
      <div style={{ position: 'absolute', top: 10, left: 10, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 4, zIndex: 10 }}>
        武器: {weaponInfo.weapon} | 子弹: {weaponInfo.ammo}
      </div>
      <Canvas
        onCreated={({ camera }) => {
          camera.position.set(0, 1.6, 5)
        }}
      >
        {/* 光照 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <SceneElements />
        {/* 黑色弹孔 */}
        {bulletHoles.map((hole, i) => {
          const age = (performance.now() - hole.born) / 1000
          const alpha = age > 2.5 ? Math.max(0, 1 - (age - 2.5) / 0.5) : 1
          return <BulletHole key={i} pos={hole.pos} opacity={alpha} />
        })}
        {/* 第一人称控制器 */}
        <PointerLockControls ref={controlsRef} />
        <ShootingContext.Provider value={shootEvent}>
          <WeaponSystem ref={weaponSystemRef} onBulletHole={hole => setBulletHoles(holes => [...holes, hole])} onShootRay={raycaster => setShootEvent({ raycaster, time: Date.now() })} />
          <PlayerController />
          {/* 敌人渲染 */}
          <EnemyManager />
        </ShootingContext.Provider>
      </Canvas>
    </>
  )
}

function PlayerController() {
  const move = useRef({ forward: false, backward: false, left: false, right: false })
  const direction = useRef(new THREE.Vector3())
  const velocityY = useRef(0)
  const isGrounded = useRef(true)

  // 墙体包围盒（与场景墙体一致）
  const wallBox = new THREE.Box3().setFromCenterAndSize(
    new THREE.Vector3(0, 0, -10), // 墙体中心
    new THREE.Vector3(20, 4, 1)   // 墙体尺寸
  )
  // 玩家碰撞体半径
  const playerRadius = 0.5

  // 监听WASD
  useEffect(() => {
    const onKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': move.current.forward = true; break;
        case 'KeyS': move.current.backward = true; break;
        case 'KeyA': move.current.left = true; break;
        case 'KeyD': move.current.right = true; break;
        case 'Space':
          if (isGrounded.current) {
            velocityY.current = 8; // 跳跃初速度
            isGrounded.current = false;
          }
          break;
      }
    }
    const onKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': move.current.forward = false; break;
        case 'KeyS': move.current.backward = false; break;
        case 'KeyA': move.current.left = false; break;
        case 'KeyD': move.current.right = false; break;
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    const speed = 5
    direction.current.set(0, 0, 0)
    if (move.current.forward) direction.current.z += 1
    if (move.current.backward) direction.current.z -= 1
    if (move.current.left) direction.current.x -= 1
    if (move.current.right) direction.current.x += 1
    direction.current.normalize()
    // 获取摄像机方向
    const camera = state.camera
    const front = new THREE.Vector3()
    camera.getWorldDirection(front)
    front.y = 0
    front.normalize()
    const right = new THREE.Vector3()
    right.crossVectors(front, camera.up).normalize()
    // 计算下一步位置
    const moveVec = new THREE.Vector3()
    moveVec.copy(front).multiplyScalar(direction.current.z * speed * delta)
    moveVec.add(right.multiplyScalar(direction.current.x * speed * delta))
    // 跳跃和重力
    velocityY.current -= 18 * delta // 重力加速度
    let nextY = camera.position.y + velocityY.current * delta
    if (nextY < 1) { // 地面高度为y=1
      nextY = 1
      velocityY.current = 0
      isGrounded.current = true
    }
    const nextPos = camera.position.clone().add(moveVec)
    nextPos.y = nextY
    // 玩家包围盒
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(nextPos.x, nextPos.y, nextPos.z),
      new THREE.Vector3(playerRadius * 2, 2, playerRadius * 2)
    )
    // 检查碰撞
    if (!wallBox.intersectsBox(playerBox)) {
      camera.position.copy(nextPos)
    } else {
      // 如果撞墙，允许y轴跳跃
      camera.position.y = nextY
    }
    // 如果有多个障碍物，可扩展为遍历所有障碍物包围盒
  })
  return null
}

function BulletHole({ pos, opacity }) {
  const meshRef = useRef()
  const { camera } = useThree()
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position)
    }
  })
  return (
    <mesh ref={meshRef} position={pos}>
      <circleGeometry args={[0.07, 12]} />
      <meshBasicMaterial color="black" transparent opacity={opacity} />
    </mesh>
  )
}