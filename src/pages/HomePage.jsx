import React, { useRef, useEffect, useState } from 'react';

export default function HomePage({ onStart }) {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);

  // 用户首次交互时自动解除静音并播放
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio);
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        minHeight: '100vh',
        minWidth: '100vw',
        zIndex: 10,
        background: 'url(/bg.jpg) center/cover no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 背景音效 */}
      <audio ref={audioRef} src="/6342.mp3" autoPlay loop muted={muted} />
      {/* 静音按钮 */}
      <button
        onClick={() => {
          setMuted(m => !m);
          if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
            if (!audioRef.current.muted) audioRef.current.play().catch(() => {});
          }
        }}
        style={{
          position: 'absolute',
          top: 24,
          right: 32,
          zIndex: 20,
          background: muted ? '#222' : '#FFD700',
          color: muted ? '#FFD700' : '#222',
          border: '2px solid #FFD700',
          borderRadius: 24,
          fontWeight: 'bold',
          fontSize: 18,
          padding: '0.3em 1.2em',
          boxShadow: '0 2px 8px #000',
          cursor: 'pointer',
        }}
      >
        {muted ? '🔇 静音' : '🔊 音效'}
      </button>
      <button
        onClick={onStart}
        className="font-bold rounded-full border-4 border-yellow-400 bg-black/70 text-yellow-200 hover:bg-yellow-400 hover:text-black transition shadow-2xl"
        style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          textShadow: '0 1px 0 #fff, 0 0 8px #FFD700',
          letterSpacing: '0.18em',
          boxShadow: '0 8px 32px 0 #FFD70088, 0 2px 8px #000',
          fontSize: 'clamp(2rem, 6vw, 4rem)',
          padding: 'clamp(1rem, 3vw, 2.5rem) clamp(3rem, 10vw, 8rem)',
          minWidth: 'min(80vw, 480px)',
          minHeight: 'clamp(3.5rem, 8vw, 6rem)',
        }}
      >
        开始游戏
      </button>
    </div>
  );
} 