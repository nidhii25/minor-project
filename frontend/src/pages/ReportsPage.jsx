import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const KW_COLORS = ['#06b6d4', '#818cf8', '#10b981', '#f472b6', '#fb923c', '#a78bfa', '#34d399', '#60a5fa'];

function ConfidenceBadge({ val }) {
  const color = val > 0.9 ? '#10b981' : val > 0.75 ? '#06b6d4' : '#f59e0b';
  return (
    <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: color + '18', color, border: `1px solid ${color}33`, fontFamily: "'DM Mono',monospace" }}>
      {Math.round(val * 100)}%
    </span>
  );
}

/* Mini bar chart per keyword */
function KeywordChart({ keyword, detections, color }) {
  const maxConf = Math.max(...detections.map(d => d.confidence));
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 20px 16px', animation: 'fadeUp 0.5s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>"{keyword}"</span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#475569' }}>{detections.length} hit{detections.length !== 1 ? 's' : ''}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
        {detections.map((d, i) => (
          <div key={i} title={`${d.timestamp} · ${Math.round(d.confidence * 100)}%`}
            style={{ flex: 1, maxWidth: 20, borderRadius: 3, background: `${color}${Math.round(d.confidence * 200 + 55).toString(16).padStart(2, '0')}`, height: `${d.confidence * 100}%`, minHeight: 4, transition: 'all 0.3s', cursor: 'default' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#334155' }}>Confidence</span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color }}>Peak: {Math.round(maxConf * 100)}%</span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { report = [], keywords = [], fileName = 'audio.wav' } = state || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKw, setFilterKw] = useState('all');
  const [sortBy, setSortBy] = useState('time');
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 10;

  const kwGroups = useMemo(() => {
    const g = {};
    report.forEach(r => { if (!g[r.keyword]) g[r.keyword] = []; g[r.keyword].push(r); });
    return g;
  }, [report]);

  const filtered = useMemo(() => {
    let r = [...report];
    if (filterKw !== 'all') r = r.filter(x => x.keyword === filterKw);
    if (searchQuery) r = r.filter(x => x.keyword.includes(searchQuery.toLowerCase()));
    if (sortBy === 'time') r.sort((a, b) => a.exact_sec - b.exact_sec);
    if (sortBy === 'conf') r.sort((a, b) => b.confidence - a.confidence);
    if (sortBy === 'kw') r.sort((a, b) => a.keyword.localeCompare(b.keyword));
    return r;
  }, [report, filterKw, searchQuery, sortBy]);

  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const downloadCSV = () => {
    const rows = ['keyword,timestamp,exact_sec,confidence', ...report.map(r => `${r.keyword},${r.timestamp},${r.exact_sec},${r.confidence}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'keyword_report.csv'; a.click();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ file: fileName, keywords, detections: report }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'keyword_report.json'; a.click();
  };

  const avgConf = report.length ? (report.reduce((s, r) => s + r.confidence, 0) / report.length).toFixed(2) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#050a14; }
        .page { font-family:'Syne',sans-serif; background:#050a14; min-height:100vh; color:#e2e8f0; }
        .topbar { display:flex;align-items:center;justify-content:space-between;padding:20px 40px;border-bottom:1px solid rgba(255,255,255,0.06); }
        .logo { font-size:14px;font-weight:900;letter-spacing:0.15em;color:#fff;display:flex;align-items:center;gap:10px;text-decoration:none; }
        .logo-icon { width:32px;height:32px;background:linear-gradient(135deg,#06b6d4,#818cf8);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px; }
        .main { max-width:1000px; margin:0 auto; padding:48px 24px 80px; }

        .stat-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:14px; margin-bottom:32px; animation:fadeUp 0.4s ease both; }
        .stat-box { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:18px;text-align:center; }
        .stat-val { font-size:28px;font-weight:900;background:linear-gradient(135deg,#06b6d4,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .stat-lbl { font-size:11px;color:#475569;font-family:'DM Mono',monospace;margin-top:4px;letter-spacing:0.05em; }

        .charts-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;margin-bottom:32px; }

        .controls { display:flex;flex-wrap:wrap;gap:10px;margin-bottom:20px;animation:fadeUp 0.5s ease both; }
        .ctrl-input { flex:1;min-width:160px;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#e2e8f0;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;outline:none; }
        .ctrl-input:focus { border-color:rgba(6,182,212,0.5); }
        .ctrl-select { padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#94a3b8;font-family:'Syne',sans-serif;font-size:13px;font-weight:600;cursor:pointer;outline:none; }
        .ctrl-select:focus { border-color:rgba(6,182,212,0.5); }
        option { background:#0f1a2e; }

        .table-card { background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);border-radius:20px;overflow:hidden;animation:fadeUp 0.6s ease both; }
        .table-head { display:grid;grid-template-columns:40px 1fr 110px 100px 80px;gap:10px;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-size:10px;font-family:'DM Mono',monospace;color:#334155;text-transform:uppercase;letter-spacing:0.12em; }
        .table-row { display:grid;grid-template-columns:40px 1fr 110px 100px 80px;gap:10px;padding:13px 20px;border-bottom:1px solid rgba(255,255,255,0.04);align-items:center;transition:background 0.15s; }
        .table-row:last-child { border-bottom:none; }
        .table-row:hover { background:rgba(6,182,212,0.04); }
        .row-num { font-family:'DM Mono',monospace;font-size:12px;color:#334155; }

        .kw-pill { display:inline-flex;align-items:center;padding:4px 10px;border-radius:100px;font-size:12px;font-weight:700;border:1px solid; }

        .conf-bar-row { display:flex;align-items:center;gap:8px; }
        .conf-track { flex:1;height:4px;background:rgba(255,255,255,0.07);border-radius:100px;overflow:hidden; }
        .conf-fill { height:100%;border-radius:100px;transition:width 0.6s ease; }

        .pagination { display:flex;gap:8px;justify-content:center;margin-top:20px;align-items:center; }
        .page-btn { width:36px;height:36px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:#64748b;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.2s; }
        .page-btn:hover { border-color:rgba(6,182,212,0.4);color:#06b6d4; }
        .page-btn.active { background:linear-gradient(135deg,#06b6d4,#818cf8);border-color:transparent;color:#050a14; }
        .page-btn:disabled { opacity:0.3;cursor:not-allowed; }

        .dl-row { display:flex;gap:12px;flex-wrap:wrap;margin-top:20px; }
        .dl-btn { flex:1;min-width:160px;padding:14px;border-radius:12px;font-family:'Syne',sans-serif;font-size:13px;font-weight:800;cursor:pointer;transition:all 0.2s; }
        .dl-btn.primary { background:linear-gradient(135deg,#06b6d4,#818cf8);border:none;color:#050a14; }
        .dl-btn.primary:hover { transform:translateY(-1px);box-shadow:0 8px 24px rgba(6,182,212,0.3); }
        .dl-btn.secondary { background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#94a3b8; }
        .dl-btn.secondary:hover { border-color:rgba(6,182,212,0.4);color:#06b6d4; }
        .new-btn { width:100%;padding:14px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#64748b;cursor:pointer;transition:all 0.2s;margin-top:8px; }
        .new-btn:hover { color:#fff;border-color:rgba(255,255,255,0.2); }

        @media(max-width:600px){
          .table-head,.table-row { grid-template-columns:30px 1fr 80px 70px; }
          .table-head>:last-child,.table-row>:last-child { display:none; }
          .topbar { padding:16px 20px; }
        }
      `}</style>

      <div className="page">
        <div className="topbar">
          <a href="/" className="logo"><div className="logo-icon">〜</div>FSLAKWSS</a>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: '#10b981' }}>
            ✓ Report Generated
          </span>
        </div>

        <div className="main">
          <div style={{ marginBottom: 32, animation: 'fadeUp 0.3s ease both' }}>
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '0.2em', color: '#06b6d4', textTransform: 'uppercase', marginBottom: 8 }}>
              Analysis Report
            </p>
            <h1 style={{ fontSize: 'clamp(24px,3.5vw,36px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6 }}>
              Keyword Detection Results
            </h1>
            <p style={{ color: '#475569', fontSize: 13, fontFamily: "'DM Mono',monospace" }}>
              {fileName} · {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Stats */}
          <div className="stat-row">
            {[
              { val: report.length, lbl: 'Total Detections' },
              { val: keywords.length, lbl: 'Keywords' },
              { val: `${Math.round(avgConf * 100)}%`, lbl: 'Avg Confidence' },
              { val: `${report.filter(r => r.confidence > 0.9).length}`, lbl: 'High-Conf Hits' },
              { val: Object.keys(kwGroups).length, lbl: 'Unique Words' },
            ].map((s, i) => (
              <div className="stat-box" key={i}>
                <div className="stat-val">{s.val}</div>
                <div className="stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Per-keyword charts */}
          {Object.keys(kwGroups).length > 0 && (
            <div className="charts-grid">
              {Object.entries(kwGroups).map(([kw, dets], i) => (
                <KeywordChart key={kw} keyword={kw} detections={dets} color={KW_COLORS[i % KW_COLORS.length]} />
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="controls">
            <input className="ctrl-input" placeholder="🔍 Search keyword..." value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            <select className="ctrl-select" value={filterKw} onChange={e => { setFilterKw(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Keywords</option>
              {keywords.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select className="ctrl-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="time">Sort by Time</option>
              <option value="conf">Sort by Confidence</option>
              <option value="kw">Sort by Keyword</option>
            </select>
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="table-head">
              <span>#</span>
              <span>Keyword</span>
              <span>Timestamp</span>
              <span>Confidence</span>
              <span>Score</span>
            </div>
            {paginated.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#334155', fontFamily: "'DM Mono',monospace", fontSize: 13 }}>
                No detections found.
              </div>
            )}
            {paginated.map((item, i) => {
              const kwIdx = keywords.indexOf(item.keyword);
              const color = KW_COLORS[kwIdx % KW_COLORS.length];
              const rowNum = (currentPage - 1) * PER_PAGE + i + 1;
              return (
                <div key={i} className="table-row">
                  <span className="row-num">{rowNum}</span>
                  <span className="kw-pill" style={{ color, borderColor: color + '44', background: color + '12' }}>
                    {item.keyword}
                  </span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: '#94a3b8' }}>{item.timestamp}</span>
                  <div className="conf-bar-row">
                    <div className="conf-track">
                      <div className="conf-fill" style={{ width: `${item.confidence * 100}%`, background: `linear-gradient(90deg,${color}88,${color})` }} />
                    </div>
                  </div>
                  <ConfidenceBadge val={item.confidence} />
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
            </div>
          )}

          {/* Download buttons */}
          <div className="dl-row">
            <button className="dl-btn primary" onClick={downloadCSV}>⬇ Download CSV</button>
            <button className="dl-btn secondary" onClick={downloadJSON}>⬇ Download JSON</button>
          </div>
          <button className="new-btn" onClick={() => navigate('/app')}>
            + Start New Analysis
          </button>
        </div>
      </div>
    </>
  );
}