import { useState, useRef, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { FPSScene } from './FPSScene'
import HomePage from './pages/HomePage';
import './App.css'

function GamePage() {
  const [crosshairSize, setCrosshairSize] = useState(32)
  const crosshairTimeout = useRef(null)
  const audioRef = useRef(null)

  // 进入页面时播放一次 gogogo.mp3
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.7;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  // 射击时调用，准星变大后回弹
  const handleShoot = () => {
    setCrosshairSize(48)
    if (crosshairTimeout.current) clearTimeout(crosshairTimeout.current)
    crosshairTimeout.current = setTimeout(() => setCrosshairSize(32), 120)
  }
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 进入游戏音效 */}
      <audio ref={audioRef} src="/gogogo.mp3" />
      <FPSScene onShoot={handleShoot} />
      {/* 居中准星 */}
      <div className="crosshair" style={{ width: crosshairSize, height: crosshairSize }}></div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePageWrapper />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </Router>
  )
}

function HomePageWrapper() {
  const navigate = useNavigate();
  return <HomePage onStart={() => navigate('/game')} />;
}

export default App