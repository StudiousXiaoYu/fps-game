import { useRef, useState } from 'react'
import { useFrame, useThree, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { forwardRef } from 'react'
import { OBJLoader, MTLLoader } from 'three-stdlib'

export const weaponData = {
  pistol: { ammo: 12, cooldown: 0.4, color: '#333333' },
  rifle: { ammo: 30, cooldown: 0.1, color: '#2288ff' }
}

export const WeaponSystem = forwardRef((props, ref) => {
  const { onBulletHole } = props
  const [currentWeapon, setCurrentWeapon] = useState('pistol')
  const [ammo, setAmmo] = useState({
    pistol: weaponData.pistol.ammo,
    rifle: weaponData.rifle.ammo
  })
  const [lastShot, setLastShot] = useState(0)
  const [hitInfo, setHitInfo] = useState(null)
  const [recoil, setRecoil] = useState(0)
  const [reloading, setReloading] = useState(false)
  const [reloadAnim, setReloadAnim] = useState(0)
  const weaponRef = useRef()
  const { camera, scene } = useThree()

  // 加载AK-47材质和模型
  const serverUrl = window.location.origin + '/';
  const mtlPath =  'AK-47.mtl';
  const objPath =  'AK-47.obj';
  
  const materials = useLoader(MTLLoader, mtlPath, loader => {
    loader.setResourcePath(serverUrl);
    loader.setPath(serverUrl);
  });
  const ak47 = useLoader(OBJLoader, objPath, loader => {
    materials.preload();
    loader.setMaterials(materials);
  });

  // 武器切换逻辑
  const switchWeapon = (weaponType) => {
    if (ammo[weaponType] > 0) {
      setCurrentWeapon(weaponType)
    }
  }

  // 射击逻辑
  const fireWeapon = () => {
    if (reloading) return // 换弹期间不能射击
    const now = performance.now() / 1000
    if (ammo[currentWeapon] <= 0) return
    if (now - lastShot < weaponData[currentWeapon].cooldown) return
    setLastShot(now)
    setAmmo(prev => ({
      ...prev,
      [currentWeapon]: prev[currentWeapon] - 1
    }))
    setRecoil(0.18) // 触发后坐力
    // Raycast
    const raycaster = new THREE.Raycaster()
    raycaster.set(camera.position, camera.getWorldDirection(new THREE.Vector3()))
    // 只检测墙体（可扩展）
    const wall = scene.children.find(obj => obj.geometry && obj.geometry.type === 'BoxGeometry' && obj.position.z === -10)
    let hit = null
    if (wall) {
      const intersects = raycaster.intersectObject(wall)
      if (intersects.length > 0) {
        hit = intersects[0]
        if (hit.distance > 0.5) {
          setHitInfo({ point: hit.point, time: now })
          // 生成黑色弹孔，命中点附近随机偏移（仅在墙体平面内）
          const spread = 0.18
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * spread
          // 计算墙体法线的两个正交切线向量
          const normal = hit.face?.normal || new THREE.Vector3(0,0,1)
          let tangent = new THREE.Vector3(1,0,0)
          if (Math.abs(normal.dot(tangent)) > 0.99) {
            tangent = new THREE.Vector3(0,1,0)
          }
          tangent.crossVectors(normal, tangent).normalize()
          const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize()
          // 偏移只在切线平面内
          const offset = tangent.multiplyScalar(Math.cos(angle) * radius)
            .add(bitangent.multiplyScalar(Math.sin(angle) * radius))
          const holePos = hit.point.clone().add(offset)
          // 检查弹孔是否还在墙体包围盒内
          const wallBox = new THREE.Box3().setFromCenterAndSize(
            wall.position,
            new THREE.Vector3(20, 4, 1)
          )
          if (wallBox.containsPoint(holePos)) {
            if (onBulletHole) {
              onBulletHole({ pos: holePos.clone(), born: performance.now() })
            }
          }
        }
      }
    }
  }

  // 换弹逻辑
  const reloadWeapon = () => {
    if (reloading) return
    setReloading(true)
    setReloadAnim(1) // 启动动画
    setTimeout(() => {
      setAmmo(prev => ({
        ...prev,
        [currentWeapon]: weaponData[currentWeapon].ammo
      }))
      setReloading(false)
    }, 900) // 换弹总时长900ms
  }

  useFrame(() => {
    // 武器跟随摄像机
    if (weaponRef.current && camera) {
      let offset = new THREE.Vector3(0.5, -0.6, -1.2)
      // 换弹动画：y轴下移并回弹
      if (reloadAnim > 0.01) {
        offset.y -= Math.sin(reloadAnim * Math.PI) * 0.7
        setReloadAnim(reloadAnim * 0.82)
      } else if (reloadAnim !== 0) {
        setReloadAnim(0)
      }
      // 后坐力动画
      if (recoil > 0.001) {
        offset.z -= recoil
        setRecoil(recoil * 0.7) // 衰减回弹
      } else if (recoil !== 0) {
        setRecoil(0)
      }
      const weaponPos = offset.clone().applyQuaternion(camera.quaternion).add(camera.position)
      weaponRef.current.position.copy(weaponPos)
      weaponRef.current.quaternion.copy(camera.quaternion)
    }
    // 命中点特效消失
    if (hitInfo && performance.now() / 1000 - hitInfo.time > 0.2) {
      setHitInfo(null)
    }
  })

  // 暴露方法给父组件
  if (ref) {
    ref.current = { fireWeapon, switchWeapon, ammo, reloadWeapon }
  }

  // 武器模型参数
  const weaponColor = weaponData[currentWeapon].color

  return (
    <group ref={weaponRef}>
      {currentWeapon === 'rifle' ? (
        // 步枪显示AK-47贴图模型
        <primitive object={ak47} scale={0.08} position={[0, -0.2, 0]} />
      ) : (
        // 手枪用几何体
        <>
          {/* 枪身 */}
          <mesh>
            <boxGeometry args={[0.6, 0.2, 1.2]} />
            <meshStandardMaterial color={weaponColor} />
          </mesh>
          {/* 枪把 */}
          <mesh position={[0, -0.3, 0.3]}>
            <boxGeometry args={[0.18, 0.4, 0.3]} />
            <meshStandardMaterial color="#222" />
          </mesh>
          {/* 枪口高亮 */}
          <mesh position={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
            <meshStandardMaterial color="#ffcc00" />
          </mesh>
        </>
      )}
    </group>
  )
})