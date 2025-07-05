import React, { useRef, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { app, ensureLogin } from '../utils/cloudbase';

function LoginModal({ onLogin }) {
  const [username, setUsername] = useState('');
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">请输入用户名</h2>
        <input
          className="border px-3 py-2 rounded mb-4 w-64 text-lg"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="用户名"
        />
        <button
          className="bg-yellow-400 text-black font-bold px-6 py-2 rounded hover:bg-yellow-500"
          onClick={() => username && onLogin(username)}
        >登录</button>
      </div>
    </div>
  );
}

function RankBoard({ pageSize = 10 }) {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  useEffect(() => {
    const fetchRank = async () => {
      await ensureLogin();
      const db = app.database();
      const res = await db.collection('user_score')
        .orderBy('score', 'desc')
        .skip((page-1)*pageSize)
        .limit(pageSize)
        .get();
      setList(res.data);
      // 获取总数
      const countRes = await db.collection('user_score').count();
      setTotal(countRes.total);
    };
    fetchRank();
  }, [page, pageSize]);
  const totalPages = Math.ceil(total / pageSize);
  return (
    <div style={{width:'100%',maxWidth:400,display:'flex',flexDirection:'column',alignItems:'center'}}>
      <div style={{fontSize:'2.1rem',marginBottom:8,lineHeight:1}}><span style={{fontSize:'2.2rem'}}>🏆</span></div>
      <h3 style={{fontSize:'1.45rem',fontWeight:800,marginBottom:18,letterSpacing:1}}>排行榜</h3>
      <div style={{width:'100%',background:'#faf9f6',borderRadius:12,boxShadow:'0 2px 8px #0001',padding:'0.5em 0.5em 0.2em 0.5em',marginBottom:10}}>
        <table style={{width:'100%',borderCollapse:'separate',borderSpacing:0}}>
          <thead>
            <tr>
              <th style={{textAlign:'center',fontWeight:700,padding:'0.5em 0.2em'}}>用户名</th>
              <th style={{textAlign:'center',fontWeight:700,padding:'0.5em 0.2em'}}>分数</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={2} style={{textAlign:'center',color:'#aaa',padding:'1.2em'}}>暂无数据</td></tr>
            ) : (
              list.map((item, i) => (
                <tr key={item._id} style={{borderTop:'1px solid #eee'}}>
                  <td style={{textAlign:'center',padding:'0.5em 0.2em',fontWeight:500}}>{item.username}</td>
                  <td style={{textAlign:'center',padding:'0.5em 0.2em',fontWeight:500}}>{item.score}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:12}}>
        <button
          disabled={page<=1}
          onClick={()=>setPage(p=>Math.max(1,p-1))}
          style={{
            padding:'0.5em 1.2em',
            borderRadius:10,
            border:'none',
            background:page<=1?'#eee':'#FFD700',
            color:page<=1?'#aaa':'#222',
            fontWeight:'bold',
            fontSize:'1rem',
            cursor:page<=1?'not-allowed':'pointer',
            transition:'background 0.2s',
          }}
          onMouseOver={e=>{if(page>1)e.currentTarget.style.background='#FFC300'}}
          onMouseOut={e=>{if(page>1)e.currentTarget.style.background='#FFD700'}}
        >上一页</button>
        <span style={{fontWeight:600,color:'#888',fontSize:'1rem'}}>{page}/{totalPages||1}</span>
        <button
          disabled={page>=totalPages}
          onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
          style={{
            padding:'0.5em 1.2em',
            borderRadius:10,
            border:'none',
            background:page>=totalPages?'#eee':'#FFD700',
            color:page>=totalPages?'#aaa':'#222',
            fontWeight:'bold',
            fontSize:'1rem',
            cursor:page>=totalPages?'not-allowed':'pointer',
            transition:'background 0.2s',
          }}
          onMouseOver={e=>{if(page<totalPages)e.currentTarget.style.background='#FFC300'}}
          onMouseOut={e=>{if(page<totalPages)e.currentTarget.style.background='#FFD700'}}
        >下一页</button>
      </div>
    </div>
  );
}

export default function HomePage({ onStart }) {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [showRank, setShowRank] = useState(false);
  const [loginTip, setLoginTip] = useState('');

  useEffect(() => {
    const name = Cookies.get('username');
    if (!name) setShowLogin(true);
    else setUsername(name);
  }, []);

  const handleLogin = (name) => {
    Cookies.set('username', name, { expires: 365 });
    setUsername(name);
    setShowLogin(false);
  };

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
      {/* 右上角按钮组 */}
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 20, display: 'flex', gap: 12 }}>
        <button
          onClick={() => setShowRank(true)}
          style={{
            background: '#FFD700',
            color: '#222',
            border: '2px solid #FFD700',
            borderRadius: 24,
            fontWeight: 'bold',
            fontSize: 18,
            padding: '0.3em 1.2em',
            boxShadow: '0 2px 8px #000',
            cursor: 'pointer',
          }}
        >
          🏆 排行榜
        </button>
        <button
          onClick={() => setShowLogin(true)}
          style={{
            background: '#FFD700',
            color: '#222',
            border: '2px solid #FFD700',
            borderRadius: 24,
            fontWeight: 'bold',
            fontSize: 18,
            padding: '0.3em 1.2em',
            boxShadow: '0 2px 8px #000',
            cursor: 'pointer',
          }}
        >
          👤 登录
        </button>
        <button
          onClick={() => {
            setMuted(m => !m);
            if (audioRef.current) {
              audioRef.current.muted = !audioRef.current.muted;
              if (!audioRef.current.muted) audioRef.current.play().catch(() => {});
            }
          }}
          style={{
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
      </div>
      <button
        onClick={() => {
          if (!username) {
            setLoginTip('请先登录后再开始游戏！');
            setShowLogin(true);
            return;
          }
          onStart();
        }}
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
      {/* 登录弹窗 */}
      {showLogin && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 8px 32px 0 #00000022',
            padding: '2.5rem 2.5rem 2rem 2.5rem',
            minWidth: 340,
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <button
              onClick={()=>{setShowLogin(false); setLoginTip('')}}
              style={{
                position: 'absolute',
                right: 18,
                top: 12,
                fontSize: 28,
                color: '#bbb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                lineHeight: 1,
                transition: 'color 0.2s',
              }}
              onMouseOver={e=>e.currentTarget.style.color='#222'}
              onMouseOut={e=>e.currentTarget.style.color='#bbb'}
              aria-label="关闭"
            >×</button>
            {loginTip && <div style={{color:'#e53935',fontWeight:700,fontSize:'1.1rem',marginBottom:12}}>{loginTip}</div>}
            <h2 style={{fontSize:'2rem',fontWeight:800,marginBottom:24,letterSpacing:1}}>请输入用户名</h2>
            <input
              style={{
                border: '1.5px solid #ddd',
                borderRadius: 12,
                padding: '0.7em 1em',
                fontSize: '1.1rem',
                marginBottom: 24,
                width: 220,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="用户名"
              onFocus={e=>e.currentTarget.style.border='1.5px solid #FFD700'}
              onBlur={e=>e.currentTarget.style.border='1.5px solid #ddd'}
            />
            <button
              style={{
                background:'#FFD700',
                color:'#222',
                fontWeight:'bold',
                fontSize:'1.1rem',
                border:'none',
                borderRadius: 12,
                padding:'0.7em 2.5em',
                boxShadow:'0 2px 8px #0001',
                cursor:'pointer',
                transition:'background 0.2s',
              }}
              onMouseOver={e=>e.currentTarget.style.background='#FFC300'}
              onMouseOut={e=>e.currentTarget.style.background='#FFD700'}
              onClick={async () => {
                if(username){
                  Cookies.set('username', username, { expires: 365 });
                  await ensureLogin();
                  const db = app.database();
                  const res = await db.collection('user_score').where({ username }).get();
                  if (!res.data || res.data.length === 0) {
                    await db.collection('user_score').add({ username, score: 0 });
                  }
                  setShowLogin(false);
                  setLoginTip('');
                }
              }}
            >保存</button>
          </div>
        </div>
      )}
      {/* 排行榜弹窗 */}
      {showRank && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 32px 0 #00000044',
            padding: '2.5rem 2rem 2rem 2rem',
            minWidth: 320,
            maxWidth: '90vw',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <button
              onClick={()=>setShowRank(false)}
              style={{
                position: 'absolute',
                right: 18,
                top: 12,
                fontSize: 28,
                color: '#888',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                lineHeight: 1,
              }}
              aria-label="关闭"
            >×</button>
            <RankBoard />
          </div>
        </div>
      )}
    </div>
  );
} 