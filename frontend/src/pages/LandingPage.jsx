import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── Animated waveform bars ─── */
function WaveformBars({ count = 40, className = '' }) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} style={{ height: 64 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{
            animationDelay: `${(i * 0.07) % 1.4}s`,
            animationDuration: `${0.8 + (i % 5) * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Floating pill badge ─── */
function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border border-cyan-500/40 text-cyan-400 bg-cyan-500/10">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      {children}
    </span>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon, title, desc, accent }) {
  const colors = {
    cyan: 'border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/5',
    violet: 'border-violet-500/20 hover:border-violet-400/50 hover:bg-violet-500/5',
    emerald: 'border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/5',
  };
  const iconColors = {
    cyan: 'text-cyan-400',
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
  };
  return (
    <div className={`relative rounded-2xl border bg-white/[0.03] p-7 transition-all duration-300 group ${colors[accent]}`}>
      <div className={`text-3xl mb-4 ${iconColors[accent]}`}>{icon}</div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

/* ─── Step ─── */
function Step({ number, title, desc, active }) {
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black transition-all duration-300 ${active ? 'bg-cyan-500 text-slate-900 shadow-[0_0_30px_rgba(6,182,212,0.4)]' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
        {number}
      </div>
      <div>
        <p className="text-white font-bold mb-1">{title}</p>
        <p className="text-slate-500 text-sm max-w-[180px] mx-auto">{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const canvasRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  /* ─── Particle canvas ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6,182,212,${p.alpha})`;
        ctx.fill();
      });
      // connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(6,182,212,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050a14; }

        .page { font-family: 'Syne', sans-serif; background: #050a14; color: #e2e8f0; min-height: 100vh; overflow-x: hidden; }

        /* Waveform bar animation */
        .waveform-bar {
          width: 3px;
          background: linear-gradient(to top, #06b6d4, #818cf8);
          border-radius: 2px;
          animation: wave-bounce infinite ease-in-out alternate;
          min-height: 4px;
        }
        @keyframes wave-bounce {
          from { height: 4px; opacity: 0.4; }
          to { height: 100%; opacity: 1; }
        }

        /* Glowing orb */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        /* Nav */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 40px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.3s ease;
        }
        .nav.scrolled {
          background: rgba(5,10,20,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(6,182,212,0.1);
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; }
        .nav-logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg,#06b6d4,#818cf8); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .nav-title { font-size: 15px; font-weight: 900; letter-spacing: 0.15em; color: #fff; }
        .nav-links { display: flex; gap: 32px; }
        .nav-links a { color: #94a3b8; font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: #06b6d4; }
        .nav-cta { padding: 10px 22px; background: linear-gradient(135deg,#06b6d4,#818cf8); color: #050a14; font-weight: 900; font-size: 13px; border-radius: 10px; text-decoration: none; letter-spacing: 0.05em; transition: all 0.2s; }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(6,182,212,0.3); }

        /* Hero */
        .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 120px 24px 80px; position: relative; }
        .hero-headline { font-size: clamp(42px, 7vw, 88px); font-weight: 900; line-height: 1.0; letter-spacing: -0.03em; color: #fff; margin: 24px 0 20px; }
        .hero-headline .accent { background: linear-gradient(135deg,#06b6d4 0%,#818cf8 60%,#f472b6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: 17px; color: #64748b; max-width: 540px; line-height: 1.7; font-family: 'DM Mono', monospace; font-weight: 400; margin-bottom: 44px; }
        .hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 60px; }
        .btn-primary { padding: 14px 32px; background: linear-gradient(135deg,#06b6d4,#818cf8); color: #050a14; font-weight: 900; font-size: 14px; border-radius: 12px; text-decoration: none; transition: all 0.25s; letter-spacing: 0.03em; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(6,182,212,0.35); }
        .btn-secondary { padding: 14px 32px; border: 1px solid rgba(255,255,255,0.12); color: #94a3b8; font-weight: 700; font-size: 14px; border-radius: 12px; text-decoration: none; transition: all 0.25s; backdrop-filter: blur(8px); }
        .btn-secondary:hover { border-color: rgba(6,182,212,0.4); color: #06b6d4; }

        /* Waveform display */
        .waveform-display { width: 100%; max-width: 700px; background: rgba(255,255,255,0.03); border: 1px solid rgba(6,182,212,0.15); border-radius: 20px; padding: 28px 32px; display: flex; align-items: flex-end; gap: 1px; overflow: hidden; position: relative; }
        .waveform-display::before { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(5,10,20,0.8), transparent 20%, transparent 80%, rgba(5,10,20,0.8)); border-radius: 20px; pointer-events: none; z-index: 2; }

        /* Sections */
        .section { padding: 100px 24px; max-width: 1100px; margin: 0 auto; }
        .section-tag { font-family: 'DM Mono',monospace; font-size: 11px; font-weight: 500; letter-spacing: 0.2em; color: #06b6d4; text-transform: uppercase; margin-bottom: 14px; }
        .section-title { font-size: clamp(28px,4vw,48px); font-weight: 900; color: #fff; letter-spacing: -0.02em; margin-bottom: 14px; }
        .section-sub { color: #64748b; font-size: 16px; max-width: 480px; line-height: 1.7; }

        .features-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 20px; margin-top: 56px; }

        /* Steps */
        .steps-row { display: flex; gap: 0; align-items: flex-start; justify-content: center; margin-top: 60px; flex-wrap: wrap; gap: 40px; }
        .step-connector { width: 80px; height: 1px; background: linear-gradient(90deg,#06b6d4,#818cf8); align-self: center; margin-top: -48px; }

        /* Footer */
        footer { border-top: 1px solid rgba(255,255,255,0.05); padding: 32px 24px; text-align: center; color: #334155; font-size: 13px; font-family: 'DM Mono', monospace; }

        /* Scroll fade-in */
        .fade-up { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }

        /* Stat badges */
        .stat-row { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin-bottom: 56px; }
        .stat-pill { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; font-size: 13px; color: #94a3b8; }
        .stat-pill strong { color: #fff; font-weight: 800; }

        @media(max-width:640px){
          .nav { padding: 16px 20px; }
          .nav-links { display: none; }
          .step-connector { display: none; }
        }
      `}</style>

      <div className="page">
        {/* Particle canvas */}
        <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

        {/* Orbs */}
        <div className="orb" style={{ width: 600, height: 600, background: 'radial-gradient(circle,rgba(6,182,212,0.12),transparent 70%)', top: '-100px', right: '-100px' }} />
        <div className="orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle,rgba(129,140,248,0.10),transparent 70%)', bottom: '10%', left: '-80px' }} />

        {/* NAV */}
        <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
          <div className="nav-logo">
            <div className="nav-logo-icon">〜</div>
            <span className="nav-title">FSLAKWSS</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
          </div>
          <Link to="/app" className="nav-cta">Launch App →</Link>
        </nav>

        {/* HERO */}
        <section className="hero" style={{ zIndex: 1, position: 'relative' }}>
          <Badge>Few-Shot Audio Engine Active</Badge>
          <h1 className="hero-headline">
            Detect any word.<br />
            <span className="accent">In any language.</span>
          </h1>
          <p className="hero-sub">
            Upload audio. Define targets. Get precise timestamps — powered by log-mel spectrogram CNN inference with zero hardcoded dictionaries.
          </p>

          <div className="stat-row">
            {[['&lt;50ms', 'Inference Latency'],['Any Hz','Sample Rate'],['Few-Shot','No Training'],['NMS','Deduplication']].map(([val,lbl],i)=>(
              <div className="stat-pill" key={i}><strong dangerouslySetInnerHTML={{__html:val}} /> {lbl}</div>
            ))}
          </div>

          <div className="hero-btns">
            <Link to="/app" className="btn-primary">Launch Workspace</Link>
            <a href="#features" className="btn-secondary">Explore Features</a>
          </div>

          <div className="waveform-display">
            <WaveformBars count={80} />
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="section" style={{ position: 'relative', zIndex: 1 }}>
          <p className="section-tag">Core Capabilities</p>
          <h2 className="section-title">Engineered for Precision</h2>
          <p className="section-sub">Neural architecture optimized for real-time edge processing and phonetic target extraction.</p>
          <div className="features-grid">
            <FeatureCard accent="cyan" icon="🎙" title="Acoustic Clarity" desc="Automatic noise suppression and resampling standardizes every stream from 8kHz to 48kHz — seamlessly in the pipeline." />
            <FeatureCard accent="violet" icon="🧠" title="2D CNN Inference" desc="Log-Mel Spectrograms feed a sliding-window CNN that scans variable-duration signals with no lag, no stall." />
            <FeatureCard accent="emerald" icon="⚡" title="Few-Shot Paradigm" desc="Dynamic episode generation classifies targets without exhaustive training epochs. Adapt in seconds, not weeks." />
            <FeatureCard accent="cyan" icon="🎯" title="NMS Deduplication" desc="Non-Maximum Suppression resolves overlapping hits into clean, precise timestamps with confidence scores." />
            <FeatureCard accent="violet" icon="📊" title="Rich Reports" desc="Download structured reports with keyword frequency, timestamps, confidence heatmaps, and waveform previews." />
            <FeatureCard accent="emerald" icon="🌐" title="Language Agnostic" desc="Phoneme-level matching means no language model required. Works equally on English, Hindi, Arabic — any tongue." />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="section" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="section-tag">Process</p>
          <h2 className="section-title">Three steps. Zero friction.</h2>
          <p className="section-sub">From raw audio to localized keyword intelligence in under a minute.</p>
          <div className="steps-row">
            <Step number="01" title="Ingest Audio" desc="Drop any audio file. We normalize sample rates instantly." active={false} />
            <div className="step-connector" />
            <Step number="02" title="Define Targets" desc="Enter comma-separated keywords — any language, any length." active={true} />
            <div className="step-connector" />
            <Step number="03" title="Get Results" desc="Precise timestamps + confidence metrics, ready to export." active={false} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <Link to="/app" className="btn-primary">Try it Now</Link>
          </div>
        </section>

        <footer>
          &copy; 2025 FSLAKWSS Cognitive Audio · Few-Shot Language-Agnostic Keyword Spotting System
        </footer>
      </div>
    </>
  );
}