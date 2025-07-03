import { useState, useRef } from 'react'
import { FPSScene } from './FPSScene'
import './App.css'

function App() {
  const [crosshairSize, setCrosshairSize] = useState(32)
  const crosshairTimeout = useRef(null)

  // 射击时调用，准星变大后回弹
  const handleShoot = () => {
    setCrosshairSize(48)
    if (crosshairTimeout.current) clearTimeout(crosshairTimeout.current)
    crosshairTimeout.current = setTimeout(() => setCrosshairSize(32), 120)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <FPSScene onShoot={handleShoot} />
      {/* 居中准星 */}
      <div className="crosshair" style={{ width: crosshairSize, height: crosshairSize }}></div>
    </div>
  )
}

export default App