import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function WaveformBars({ count = 32, active = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            borderRadius: 2,
            background: active
              ? 'linear-gradient(to top,#06b6d4,#818cf8)'
              : 'rgba(255,255,255,0.1)',
            animation: active ? `waveBounce ${0.8 + (i % 5) * 0.15}s ${(i * 0.07) % 1.4}s infinite ease-in-out alternate` : 'none',
            minHeight: 4,
          }}
        />
      ))}
    </div>
  );
}

const SUGGESTED = ['help', 'fire', 'danger', 'stop', 'emergency', 'yes', 'no', 'attack'];

export default function HomePage() {
  const [keywords, setKeywords] = useState('');
  const [tagList, setTagList] = useState([]);
  const [file, setFile] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const addKeyword = (word) => {
    const w = word.trim().toLowerCase();
    if (!w || tagList.includes(w)) return;
    setTagList(prev => [...prev, w]);
    setKeywords('');
  };

  const removeKeyword = (w) => setTagList(prev => prev.filter(k => k !== w));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword(keywords);
    }
    if (e.key === 'Backspace' && !keywords && tagList.length) {
      setTagList(prev => prev.slice(0, -1));
    }
  };

  const handleFile = (f) => {
    if (!f.type.startsWith('audio/')) { setError('Please upload an audio file.'); return; }
    setError('');
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDrag(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = () => {
    if (!tagList.length && !keywords.trim()) { setError('Add at least one keyword.'); return; }
    if (!file) { setError('Upload an audio file first.'); return; }
    const finalTags = keywords.trim() ? [...tagList, keywords.trim().toLowerCase()] : tagList;
    navigate('/analysis', { state: { file, keywords: finalTags } });
  };

  const formatSize = (b) => b > 1e6 ? `${(b/1e6).toFixed(1)} MB` : `${(b/1e3).toFixed(0)} KB`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes waveBounce { from { height: 4px; opacity:0.4; } to { height: 100%; opacity:1; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
        * { box-sizing: border-box; margin:0; padding:0; }
        body { background:#050a14; }
        .home { font-family:'Syne',sans-serif; background:#050a14; min-height:100vh; color:#e2e8f0; }
        .topbar { display:flex; align-items:center; justify-content:space-between; padding:20px 40px; border-bottom:1px solid rgba(255,255,255,0.06); }
        .logo { font-size:14px; font-weight:900; letter-spacing:0.15em; color:#fff; display:flex; align-items:center; gap:10px; text-decoration:none; }
        .logo-icon { width:32px; height:32px; background:linear-gradient(135deg,#06b6d4,#818cf8); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:16px; }
        .main { max-width:780px; margin:0 auto; padding:60px 24px 80px; }
        .step-badge { font-family:'DM Mono',monospace; font-size:10px; font-weight:500; letter-spacing:0.2em; color:#06b6d4; text-transform:uppercase; margin-bottom:8px; }
        .card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:20px; padding:28px; margin-bottom:20px; animation:fadeUp 0.5s ease both; }
        .card:nth-child(2){animation-delay:0.1s;}
        .card:nth-child(3){animation-delay:0.2s;}
        .card-title { font-size:18px; font-weight:800; color:#fff; margin-bottom:6px; }
        .card-sub { font-size:13px; color:#64748b; margin-bottom:20px; font-family:'DM Mono',monospace; }

        /* Keywords */
        .keyword-input-wrap { display:flex; flex-wrap:wrap; gap:8px; padding:12px 16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; min-height:52px; align-items:center; transition:border-color 0.2s; }
        .keyword-input-wrap:focus-within { border-color:rgba(6,182,212,0.5); box-shadow:0 0 0 3px rgba(6,182,212,0.07); }
        .kw-tag { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; background:linear-gradient(135deg,rgba(6,182,212,0.15),rgba(129,140,248,0.15)); border:1px solid rgba(6,182,212,0.3); border-radius:100px; font-size:13px; font-weight:700; color:#06b6d4; }
        .kw-tag button { background:none; border:none; cursor:pointer; color:#94a3b8; font-size:15px; line-height:1; padding:0; }
        .kw-tag button:hover { color:#f87171; }
        .kw-input { background:none; border:none; outline:none; color:#e2e8f0; font-family:'Syne',sans-serif; font-size:14px; font-weight:600; flex:1; min-width:120px; }
        .kw-input::placeholder { color:#334155; }
        .suggestions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
        .sug-btn { padding:5px 14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:100px; font-size:12px; font-weight:700; color:#64748b; cursor:pointer; transition:all 0.2s; font-family:'Syne',sans-serif; }
        .sug-btn:hover { border-color:rgba(6,182,212,0.4); color:#06b6d4; background:rgba(6,182,212,0.06); }
        .sug-btn.used { opacity:0.3; pointer-events:none; }

        /* Drop zone */
        .dropzone { border:2px dashed rgba(255,255,255,0.12); border-radius:16px; padding:48px 24px; text-align:center; cursor:pointer; transition:all 0.25s; position:relative; overflow:hidden; }
        .dropzone:hover,.dropzone.active { border-color:rgba(6,182,212,0.5); background:rgba(6,182,212,0.04); }
        .dropzone-icon { font-size:40px; margin-bottom:14px; }
        .dropzone-title { font-size:16px; font-weight:800; color:#fff; margin-bottom:6px; }
        .dropzone-sub { font-size:13px; color:#475569; font-family:'DM Mono',monospace; }
        .file-chip { display:flex; align-items:center; gap:14px; padding:16px 20px; background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.2); border-radius:14px; }
        .file-info { flex:1; }
        .file-name { font-size:14px; font-weight:800; color:#e2e8f0; }
        .file-meta { font-size:12px; color:#64748b; font-family:'DM Mono',monospace; margin-top:3px; }
        .file-remove { background:none; border:none; cursor:pointer; color:#475569; font-size:18px; transition:color 0.2s; }
        .file-remove:hover { color:#f87171; }

        /* CTA */
        .analyze-btn { width:100%; padding:18px; background:linear-gradient(135deg,#06b6d4,#818cf8); border:none; border-radius:14px; color:#050a14; font-family:'Syne',sans-serif; font-size:16px; font-weight:900; letter-spacing:0.05em; cursor:pointer; transition:all 0.25s; display:flex; align-items:center; justify-content:center; gap:10px; }
        .analyze-btn:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(6,182,212,0.35); }
        .analyze-btn:disabled { opacity:0.4; transform:none; cursor:not-allowed; box-shadow:none; }

        .error-msg { color:#f87171; font-size:13px; font-family:'DM Mono',monospace; margin-top:10px; }
        .divider { border:none; border-top:1px solid rgba(255,255,255,0.06); margin:8px 0; }
      `}</style>

      <div className="home">
        {/* Topbar */}
        <div className="topbar">
          <a href="/" className="logo">
            <div className="logo-icon">〜</div>
            FSLAKWSS
          </a>
          <WaveformBars count={24} active={!!file} />
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: '#334155' }}>
            Keyword Spotting
          </span>
        </div>

        <div className="main">
          <div style={{ marginBottom: 36, animation: 'fadeUp 0.4s ease both' }}>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.2em', color: '#06b6d4', textTransform: 'uppercase', marginBottom: 10 }}>
              New Analysis
            </p>
            <h1 style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Configure your keyword scan
            </h1>
            <p style={{ color: '#475569', fontSize: 14, marginTop: 8, fontFamily: "'DM Mono',monospace" }}>
              Define targets → upload audio → get precise timestamps
            </p>
          </div>

          {/* Step 1: Keywords */}
          <div className="card">
            <p className="step-badge">Step 01 / Define Targets</p>
            <p className="card-title">Enter Keywords</p>
            <p className="card-sub">Type a word and press Enter or comma to add. Supports any language.</p>

            <div className="keyword-input-wrap">
              {tagList.map(w => (
                <span className="kw-tag" key={w}>
                  {w}
                  <button onClick={() => removeKeyword(w)}>×</button>
                </span>
              ))}
              <input
                className="kw-input"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tagList.length ? 'Add more…' : 'e.g. help, fire, stop…'}
              />
            </div>

            <div className="suggestions">
              <span style={{ fontSize: 11, color: '#334155', fontFamily: "'DM Mono',monospace", alignSelf: 'center' }}>Suggestions:</span>
              {SUGGESTED.map(s => (
                <button key={s} className={`sug-btn ${tagList.includes(s) ? 'used' : ''}`} onClick={() => addKeyword(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Upload */}
          <div className="card">
            <p className="step-badge">Step 02 / Upload Audio</p>
            <p className="card-title">Audio File</p>
            <p className="card-sub">MP3, WAV, OGG, FLAC · Any sample rate</p>

            {!file ? (
              <div
                className={`dropzone ${isDrag ? 'active' : ''}`}
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
                onDragLeave={() => setIsDrag(false)}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="dropzone-icon">🎵</div>
                <p className="dropzone-title">Drop audio here or click to browse</p>
                <p className="dropzone-sub">MP3 · WAV · OGG · FLAC · M4A</p>
              </div>
            ) : (
              <div className="file-chip">
                <div style={{ fontSize: 28 }}>🎵</div>
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-meta">{formatSize(file.size)} · Ready for analysis</p>
                  <WaveformBars count={30} active={true} />
                </div>
                <button className="file-remove" onClick={() => setFile(null)}>✕</button>
              </div>
            )}
          </div>

          {/* Analyze */}
          <button
            className="analyze-btn"
            disabled={!file || (!tagList.length && !keywords.trim())}
            onClick={handleAnalyze}
          >
            <span>⚡</span>
            Run Keyword Analysis
          </button>
          {error && <p className="error-msg">⚠ {error}</p>}
        </div>
      </div>
    </>
  );
}