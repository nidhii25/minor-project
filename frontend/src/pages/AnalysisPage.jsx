import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/* Animated waveform bars */
function WaveformBars({ count = 40, active = true, height = 48, color = 'cyan' }) {
  const grad = color === 'cyan'
    ? 'linear-gradient(to top,#06b6d4,#818cf8)'
    : 'linear-gradient(to top,#10b981,#06b6d4)';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 2,
          background: active ? grad : 'rgba(255,255,255,0.08)',
          animation: active ? `waveBounce ${0.8 + (i % 5) * 0.15}s ${(i * 0.07) % 1.4}s infinite ease-in-out alternate` : 'none',
          minHeight: 4,
        }} />
      ))}
    </div>
  );
}

/* Progress step indicator */
function ProgressStep({ label, status }) {
  const icons = { done: '✓', active: '◉', pending: '○' };
  const colors = { done: '#10b981', active: '#06b6d4', pending: '#334155' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 16, color: colors[status], fontWeight: 900 }}>{icons[status]}</span>
      <span style={{ fontSize: 13, color: colors[status], fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

const STAGES = ['uploading', 'resampling', 'extracting', 'inferring', 'deduplicating'];
const STAGE_LABELS = {
  uploading: 'Uploading audio file',
  resampling: 'Normalizing sample rate',
  extracting: 'Extracting Mel spectrograms',
  inferring: 'Running CNN inference',
  deduplicating: 'Applying NMS deduplication',
};

export default function AnalysisPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { file, keywords } = state || {};

  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeKw, setActiveKw] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!file || !keywords?.length) { navigate('/app'); return; }
    setAudioUrl(URL.createObjectURL(file));
    runAnalysis();
  }, []);

  const runAnalysis = async () => {
    // Animate through stages
    for (let i = 0; i < STAGES.length; i++) {
      setStage(i);
      await animateProgress(i === STAGES.length - 1 ? 95 : (i + 1) * 18 + 5);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('keywords', keywords.join(','));
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const res = await fetch(`${API_URL}/analyze`, {
                        method: 'POST',
                        body: formData,
                      });
      const data = await res.json();
      if (data.status === 'success') {
        setProgress(100);
        setReport(data.report);
        setDone(true);
      } else {
        setError('Analysis failed. Check backend.');
      }
    } catch (err) {
  console.error('FETCH ERROR:', err);
  setError(`Request failed: ${err.message}`);
}
  };

  const animateProgress = (target) => new Promise(resolve => {
    const step = () => {
      setProgress(prev => {
        if (prev >= target) { resolve(); return prev; }
        setTimeout(step, 30);
        return Math.min(prev + 1, target);
      });
    };
    step();
  });

  const mockReport = (kws) => {
    const results = [];
    kws.forEach((kw, ki) => {
      const count = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < count; j++) {
        const sec = Math.random() * 120;
        results.push({
          keyword: kw,
          timestamp: `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`,
          exact_sec: parseFloat(sec.toFixed(2)),
          confidence: parseFloat((0.7 + Math.random() * 0.29).toFixed(2)),
        });
      }
    });
    return results.sort((a, b) => a.exact_sec - b.exact_sec);
  };

  const jumpTo = (sec) => {
    if (audioRef.current) {
      audioRef.current.currentTime = sec;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const kwColors = ['#06b6d4', '#818cf8', '#10b981', '#f472b6', '#fb923c', '#a78bfa'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes waveBounce { from {height:4px;opacity:0.4} to {height:100%;opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes progress-glow { 0%,100%{box-shadow:0 0 8px rgba(6,182,212,0.4)} 50%{box-shadow:0 0 20px rgba(6,182,212,0.7)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#050a14; }
        .page { font-family:'Syne',sans-serif; background:#050a14; min-height:100vh; color:#e2e8f0; }
        .topbar { display:flex; align-items:center; justify-content:space-between; padding:20px 40px; border-bottom:1px solid rgba(255,255,255,0.06); }
        .logo { font-size:14px; font-weight:900; letter-spacing:0.15em; color:#fff; display:flex; align-items:center; gap:10px; text-decoration:none; }
        .logo-icon { width:32px;height:32px;background:linear-gradient(135deg,#06b6d4,#818cf8);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px; }
        .main { max-width:860px; margin:0 auto; padding:48px 24px 80px; }

        /* Loading card */
        .loading-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:40px;text-align:center; }
        .spinner { width:48px;height:48px;border:3px solid rgba(6,182,212,0.2);border-top-color:#06b6d4;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 24px; }
        .progress-track { height:4px;background:rgba(255,255,255,0.08);border-radius:100px;overflow:hidden;margin:20px 0; }
        .progress-fill { height:100%;background:linear-gradient(90deg,#06b6d4,#818cf8);border-radius:100px;transition:width 0.3s ease;animation:progress-glow 1.5s infinite; }
        .stages-list { display:flex;flex-direction:column;gap:10px;text-align:left;max-width:320px;margin:24px auto 0; }

        /* Audio player */
        .player { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px;animation:fadeUp 0.4s ease both; }
        .play-btn { width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#818cf8);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all 0.2s;flex-shrink:0; }
        .play-btn:hover { transform:scale(1.05); }
        .scrubber { flex:1;-webkit-appearance:none;height:4px;border-radius:100px;background:rgba(255,255,255,0.1);outline:none;cursor:pointer; }
        .scrubber::-webkit-slider-thumb { -webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#06b6d4;cursor:pointer; }
        .time { font-family:'DM Mono',monospace;font-size:12px;color:#64748b;white-space:nowrap; }

        /* Results */
        .summary-grid { display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:28px;animation:fadeUp 0.5s ease both; }
        .stat-box { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;text-align:center; }
        .stat-val { font-size:32px;font-weight:900;background:linear-gradient(135deg,#06b6d4,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .stat-lbl { font-size:12px;color:#475569;font-family:'DM Mono',monospace;margin-top:4px; }

        /* Table */
        .result-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;animation:fadeUp 0.6s ease both; }
        .result-header { display:grid;grid-template-columns:1fr 100px 90px 80px;gap:12px;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:11px;font-family:'DM Mono',monospace;color:#475569;font-weight:500;letter-spacing:0.08em;text-transform:uppercase; }
        .result-row { display:grid;grid-template-columns:1fr 100px 90px 80px;gap:12px;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.04);align-items:center;transition:background 0.2s;cursor:pointer; }
        .result-row:last-child { border-bottom:none; }
        .result-row:hover { background:rgba(6,182,212,0.05); }
        .result-row.active { background:rgba(6,182,212,0.08);border-left:2px solid #06b6d4; }
        .kw-badge { display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:100px;font-size:12px;font-weight:700;border:1px solid; }
        .conf-bar-wrap { height:4px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden; }
        .conf-bar { height:100%;border-radius:100px;transition:width 0.8s ease; }
        .jump-btn { padding:5px 12px;background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.3);border-radius:8px;color:#06b6d4;font-size:11px;font-weight:700;cursor:pointer;font-family:'Syne',sans-serif;transition:all 0.2s; }
        .jump-btn:hover { background:rgba(6,182,212,0.2); }

        .export-btn { width:100%;padding:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#94a3b8;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;cursor:pointer;transition:all 0.2s;margin-top:16px; }
        .export-btn:hover { border-color:rgba(6,182,212,0.4);color:#06b6d4; }
        .reports-btn { width:100%;padding:16px;background:linear-gradient(135deg,#06b6d4,#818cf8);border:none;border-radius:14px;color:#050a14;font-family:'Syne',sans-serif;font-size:15px;font-weight:900;cursor:pointer;transition:all 0.25s;margin-top:12px; }
        .reports-btn:hover { transform:translateY(-2px);box-shadow:0 12px 30px rgba(6,182,212,0.3); }
      `}</style>

      <div className="page">
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl}
            onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
            onLoadedMetadata={() => setDuration(audioRef.current.duration)}
            onEnded={() => setIsPlaying(false)} />
        )}

        <div className="topbar">
          <a href="/" className="logo"><div className="logo-icon">〜</div>FSLAKWSS</a>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: '#334155' }}>
            {done ? '✓ Analysis Complete' : '◉ Processing...'}
          </span>
        </div>

        <div className="main">
          {/* Header */}
          <div style={{ marginBottom: 32, animation: 'fadeUp 0.3s ease both' }}>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.2em', color: '#06b6d4', textTransform: 'uppercase', marginBottom: 8 }}>
              Analysis
            </p>
            <h1 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              {done ? 'Results Ready' : 'Scanning Audio...'}
            </h1>
            <p style={{ color: '#475569', fontSize: 13, marginTop: 6, fontFamily: "'DM Mono',monospace" }}>
              {file?.name} · {keywords?.length} target{keywords?.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* LOADING STATE */}
          {!done && (
            <div className="loading-card">
              <div className="spinner" />
              <WaveformBars count={48} active={true} height={56} />
              <div className="progress-track" style={{ marginTop: 24 }}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: '#06b6d4', marginBottom: 4 }}>
                {Math.round(progress)}%
              </p>
              <div className="stages-list">
                {STAGES.map((s, i) => (
                  <ProgressStep key={s} label={STAGE_LABELS[s]}
                    status={i < stage ? 'done' : i === stage ? 'active' : 'pending'} />
                ))}
              </div>
            </div>
          )}

          {/* RESULTS */}
          {done && report && (
            <>
              {/* Summary stats */}
              <div className="summary-grid">
                {[
                  { val: report.length, lbl: 'Total Detections' },
                  { val: keywords.length, lbl: 'Keywords Scanned' },
                  { val: `${Math.round((report.filter(r => r.confidence > 0.85).length / report.length) * 100)}%`, lbl: 'High Confidence' },
                  { val: `${Math.max(...report.map(r => r.exact_sec)).toFixed(0)}s`, lbl: 'Audio Duration' },
                ].map((s, i) => (
                  <div className="stat-box" key={i}>
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Audio player */}
              {audioUrl && (
                <div className="player">
                  <button className="play-btn" onClick={togglePlay}>
                    {isPlaying ? '⏸' : '▶'}
                  </button>
                  <WaveformBars count={20} active={isPlaying} height={32} />
                  <input className="scrubber" type="range" min={0} max={duration || 100}
                    step={0.1} value={currentTime}
                    onChange={e => { audioRef.current.currentTime = +e.target.value; setCurrentTime(+e.target.value); }} />
                  <span className="time">{fmt(currentTime)} / {fmt(duration)}</span>
                </div>
              )}

              {/* Results table */}
              <div className="result-card">
                <div className="result-header">
                  <span>Keyword</span>
                  <span>Timestamp</span>
                  <span>Confidence</span>
                  <span>Jump</span>
                </div>
                {report.map((item, i) => {
                  const kwIdx = keywords.indexOf(item.keyword);
                  const color = kwColors[kwIdx % kwColors.length];
                  return (
                    <div key={i}
                      className={`result-row ${activeKw === i ? 'active' : ''}`}
                      onClick={() => { jumpTo(item.exact_sec); setActiveKw(i); }}
                    >
                      <span className="kw-badge" style={{ color, borderColor: color + '44', background: color + '12' }}>
                        {item.keyword}
                      </span>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: '#94a3b8' }}>
                        {item.timestamp}
                      </span>
                      <div>
                        <div className="conf-bar-wrap">
                          <div className="conf-bar" style={{ width: `${item.confidence * 100}%`, background: `linear-gradient(90deg,${color}88,${color})` }} />
                        </div>
                        <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#475569' }}>
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                      <button className="jump-btn" onClick={e => { e.stopPropagation(); jumpTo(item.exact_sec); setActiveKw(i); }}>
                        ▶ Play
                      </button>
                    </div>
                  );
                })}
              </div>

              <button className="export-btn"
                onClick={() => navigate('/reports', { state: { report, keywords, fileName: file?.name } })}>
                📊 View Full Report
              </button>
              <button className="reports-btn"
                onClick={() => navigate('/reports', { state: { report, keywords, fileName: file?.name } })}>
                Generate & Download Report →
              </button>
            </>
          )}

          {error && (
            <p style={{ color: '#f87171', fontFamily: "'DM Mono',monospace", fontSize: 13, marginTop: 16 }}>
              ⚠ {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}