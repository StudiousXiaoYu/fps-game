import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { WeaponSystem, weaponData } from './WeaponSystem'
import * as THREE from 'three'
import Enemy from './Enemy'
import Explosion from './Explosion'
import React, { createContext, useContext } from 'react'
import hitSoundUrl from '../public/hit.mp3';
import shootSoundUrl from '../public/shut.mp3';

// 射击事件上下文
const ShootingContext = createContext(null)

function EnemyManager({ setShowHit, hitAudioRef }) {
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
    let hitId = null;
    let hitPos = null;
    for (const enemy of enemies) {
      try {
        const enemyPos = new THREE.Vector3(...enemy.position);
        const toEnemy = new THREE.Vector3().subVectors(enemyPos, origin);
        const distance = toEnemy.length();
        const cosAngle = toEnemy.normalize().dot(direction.clone().normalize());
        // 夹角接近1且距离小于20就算命中
        if (cosAngle > 0.99 && distance < 20) {
          hitId = enemy.id;
          hitPos = enemy.position;
          setShowHit(true);
          if (hitAudioRef.current) {
            hitAudioRef.current.currentTime = 0;
            hitAudioRef.current.play();
          }
          break;
        }
      } catch (err) {
        console.error('检测enemy出错', enemy, err);
        continue;
      }
    }
    if (hitId !== null) {
      setEnemies(prev => {
        // 移除被击中的敌人
        const filtered = prev.filter(e => e.id !== hitId);
        // 生成一个新敌人，id递增
        const maxId = prev.length > 0 ? Math.max(...prev.map(e => e.id)) : 0;
        const newEnemy = {
          id: maxId + 1,
          position: [
            Math.random() * 16 - 8,
            1.6,
            Math.random() * 16 - 8
          ],
          direction: [
            Math.random() * 2 - 1,
            0,
            Math.random() * 2 - 1
          ]
        };
        return [...filtered, newEnemy];
      });
      setExplosions(prev => [...prev, { pos: hitPos, id: Math.random() }]);
    }
  }, [shootEvent, enemies, setShowHit, hitAudioRef])

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

  useEffect(() => {
    if (setShowHit) {
      const timer = setTimeout(() => setShowHit(false), 300);
      return () => clearTimeout(timer);
    }
  }, [setShowHit]);

  // 移除动画结束的爆炸
  const handleExplosionEnd = (id) => {
    setExplosions(prev => prev.filter(e => e.id !== id));
  };

  return (
    <>
      {/* 渲染敌人 */}
      {enemies.map(enemy => (
        <Enemy key={enemy.id} position={enemy.position} />
      ))}
      {/* 渲染爆炸效果 */}
      {explosions.map(explosion => (
        <Explosion key={explosion.id} position={explosion.pos} onEnd={() => handleExplosionEnd(explosion.id)} />
      ))}
    </>
  );
}

export function FPSScene({ onShoot }) {
  const controlsRef = useRef()
  const weaponSystemRef = useRef()
  const [weaponInfo, setWeaponInfo] = useState({ weapon: 'rifle', ammo: weaponData.rifle.ammo })
  const [bulletHoles, setBulletHoles] = useState([])
  const [shootEvent, setShootEvent] = useState(null)
  const [showHit, setShowHit] = useState(false);
  const hitAudioRef = useRef(null);
  const shootAudioRef = useRef(null);

  // 只保留步枪切换和换弹的 useEffect
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Digit1') {
        weaponSystemRef.current?.switchWeapon('pistol');
        setWeaponInfo(info => ({ ...info, weapon: 'pistol' }));
      } else if (e.code === 'Digit2') {
        weaponSystemRef.current?.switchWeapon('rifle');
        setWeaponInfo(info => ({ ...info, weapon: 'rifle' }));
      } else if (e.code === 'KeyR') {
        weaponSystemRef.current?.reloadWeapon();
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        // 只有有子弹时才播放射击音效
        const ammo = weaponSystemRef.current?.ammo?.[weaponInfo.weapon] ?? 0;
        if (ammo > 0) {
          if (shootAudioRef.current) {
            shootAudioRef.current.currentTime = 0;
            shootAudioRef.current.play();
          }
        }
        weaponSystemRef.current?.fireWeapon();
        if (onShoot) onShoot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onShoot, weaponInfo.weapon]);

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
      {/* 右下角子弹信息 */}
      <div style={{
        position: 'absolute',
        right: 24,
        bottom: 24,
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textShadow: '1px 1px 6px #000',
        zIndex: 1000
      }}>
        {weaponInfo.weapon === 'rifle' ? '步枪' : '手枪'}
        &nbsp;|&nbsp; 子弹：{weaponInfo.ammo}
      </div>
      {/* 命中提示和音效，放在 Canvas 外部 */}
      <audio ref={hitAudioRef} src={hitSoundUrl} preload="auto" />
      <audio ref={shootAudioRef} src={shootSoundUrl} preload="auto" />
      {/* three.js 场景 */}
      <Canvas>
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
          <EnemyManager setShowHit={setShowHit} hitAudioRef={hitAudioRef} />
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
    delta = Math.min(delta, 0.05); // 限制最大步长，防止跳变
    const speed = 5;
    direction.current.set(0, 0, 0);
    if (move.current.forward) direction.current.z += 1;
    if (move.current.backward) direction.current.z -= 1;
    if (move.current.left) direction.current.x -= 1;
    if (move.current.right) direction.current.x += 1;
    if (direction.current.lengthSq() > 0) direction.current.normalize();

    // 获取摄像机方向（只用于移动方向，不要设置 rotation）
    const camera = state.camera;
    const front = new THREE.Vector3();
    camera.getWorldDirection(front);
    front.y = 0;
    front.normalize();
    const right = new THREE.Vector3();
    right.crossVectors(front, camera.up).normalize();

    // 计算下一步位置
    const moveVec = new THREE.Vector3();
    moveVec.copy(front).multiplyScalar(direction.current.z * speed * delta);
    moveVec.add(right.multiplyScalar(direction.current.x * speed * delta));

    // 跳跃和重力
    velocityY.current -= 18 * delta; // 重力加速度
    let nextY = camera.position.y + velocityY.current * delta;
    if (nextY < 1) {
      nextY = 1;
      velocityY.current = 0;
      isGrounded.current = true;
    }
    const nextPos = camera.position.clone().add(moveVec);
    nextPos.y = nextY;

    // 玩家包围盒
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(nextPos.x, nextPos.y, nextPos.z),
      new THREE.Vector3(playerRadius * 2, 2, playerRadius * 2)
    );
    // 检查碰撞
    if (!wallBox.intersectsBox(playerBox)) {
      camera.position.copy(nextPos);
    } else {
      camera.position.y = nextY;
    }
    // 注意：不要设置 camera.rotation 或 camera.lookAt，方向交给 PointerLockControls
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