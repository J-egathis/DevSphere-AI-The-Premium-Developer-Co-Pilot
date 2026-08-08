import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Layout, Palette, Download, Eye, Smartphone, Monitor, Code } from 'lucide-react';

export default function PortfolioBuilder() {
  const { user, profile, showToast } = useContext(AuthContext);
  const [template, setTemplate] = useState('glass'); // 'glass' | 'cyber' | 'minimal'
  const [accentColor, setAccentColor] = useState('#6366f1'); // Indigo default
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop' | 'mobile'

  const templates = [
    { id: 'glass', name: 'Aero Glassmorphic', desc: 'Premium blur transparency overlay and fluid stardust grids.' },
    { id: 'cyber', name: 'Cyberpunk Grid', desc: 'High-contrast neon cyan/purple outline details and grid lines.' },
    { id: 'minimal', name: 'Vercel Minimalist', desc: 'Sleek dark aesthetics, sharp lines, and clean typographic grids.' }
  ];

  const colors = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e'];

  // Helper to compile self-contained template HTML
  const compilePortfolioHTML = () => {
    if (!profile) return '';

    const name = user?.username || 'Developer';
    const bio = profile.bio || 'Building the future, one line of code at a time.';
    const skillsList = profile.skills || ['HTML5', 'CSS3', 'JavaScript'];
    const experienceTimeline = profile.experience || [];
    const educationTimeline = profile.education || [];
    const certifications = profile.certifications || [];
    
    // Theme details
    let style = '';
    let particlesScript = '';

    if (template === 'glass') {
      style = `
        body { background: #050508; color: #f3f4f6; }
        .glass-card { background: rgba(15, 15, 25, 0.65); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 8px 32px 0 rgba(0,0,0,0.3); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        .accent-text { color: ${accentColor}; }
        .badge { background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; padding: 4px 10px; border-radius: 100px; font-size: 12px; display: inline-block; margin: 4px; }
      `;
      // Stardust interactive script
      particlesScript = `
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        const nodes = [];
        for(let i=0; i<35; i++) {
          nodes.push({
            x: Math.random()*width,
            y: Math.random()*height,
            vx: (Math.random()-0.5)*0.3,
            vy: (Math.random()-0.5)*0.3
          });
        }
        function draw() {
          ctx.clearRect(0,0,width,height);
          ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
          for(let n of nodes) {
            n.x += n.vx; n.y += n.vy;
            if(n.x<0 || n.x>width) n.vx*=-1;
            if(n.y<0 || n.y>height) n.vy*=-1;
            ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI*2); ctx.fill();
          }
          requestAnimationFrame(draw);
        }
        window.onresize = () => { width=canvas.width=window.innerWidth; height=canvas.height=window.innerHeight; };
        draw();
      `;
    } else if (template === 'cyber') {
      style = `
        body { background: #030303; color: #00ffcc; font-family: monospace; }
        .glass-card { border: 1px solid ${accentColor}; box-shadow: 0 0 10px ${accentColor}33; border-radius: 4px; padding: 24px; margin-bottom: 20px; background: rgba(0,0,0,0.85); }
        .accent-text { color: ${accentColor}; text-shadow: 0 0 5px ${accentColor}; }
        .badge { border: 1px solid #00ffcc; color: #00ffcc; padding: 4px 10px; font-size: 12px; display: inline-block; margin: 4px; }
      `;
    } else {
      // Minimalist
      style = `
        body { background: #000000; color: #ffffff; }
        .glass-card { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 24px 0; margin-bottom: 20px; }
        .accent-text { color: ${accentColor}; font-weight: 800; }
        .badge { background: #111; color: #eee; padding: 4px 10px; border-radius: 4px; font-size: 12px; display: inline-block; margin: 4px; }
      `;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Outfit', sans-serif; line-height: 1.6; padding: 40px 20px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 36px; margin-bottom: 10px; letter-spacing: -0.03em; }
    h2 { font-size: 20px; margin: 30px 0 15px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
    p { margin-bottom: 15px; }
    .timeline-item { margin-bottom: 16px; }
    .timeline-title { font-weight: 700; font-size: 15px; }
    .timeline-meta { font-size: 12px; color: #888; margin-bottom: 4px; }
    ${style}
  </style>
</head>
<body>
  <canvas id="bg-canvas" style="position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; pointer-events:none;"></canvas>
  
  <header style="margin-bottom: 40px;">
    <h1 class="accent-text">${name}</h1>
    <p style={{ fontSize: '18px' }}>${bio}</p>
  </header>

  <main>
    <section class="glass-card">
      <h2>Tech Stack</h2>
      <div style="margin-top: 10px;">
        ${skillsList.map(s => `<span class="badge">${s}</span>`).join('')}
      </div>
    </section>

    ${experienceTimeline.length > 0 ? `
    <section class="glass-card">
      <h2>Professional Experience</h2>
      ${experienceTimeline.map(exp => `
        <div class="timeline-item">
          <div class="timeline-title">${exp.position} at ${exp.company}</div>
          <div class="timeline-meta">${exp.startDate} - ${exp.endDate || 'Present'} | ${exp.location || ''}</div>
          <p style="font-size:14px;">${exp.description || ''}</p>
        </div>
      `).join('')}
    </section>` : ''}

    ${educationTimeline.length > 0 ? `
    <section class="glass-card">
      <h2>Education</h2>
      ${educationTimeline.map(edu => `
        <div class="timeline-item">
          <div class="timeline-title">${edu.degree} in ${edu.fieldOfStudy}</div>
          <div class="timeline-meta">${edu.institution} | ${edu.startDate} - ${edu.endDate}</div>
        </div>
      `).join('')}
    </section>` : ''}

    ${certifications.length > 0 ? `
    <section class="glass-card">
      <h2>Certifications</h2>
      ${certifications.map(cert => `
        <div class="timeline-item">
          <div class="timeline-title">${cert.name}</div>
          <div class="timeline-meta">Issued by ${cert.issuer} (${cert.issueDate})</div>
        </div>
      `).join('')}
    </section>` : ''}
  </main>

  <script>
    ${particlesScript}
  </script>
</body>
</html>`;
  };

  const handleDownload = () => {
    const htmlContent = compilePortfolioHTML();
    if (!htmlContent) {
      showToast('Error', 'Unable to compile profile data', 'warning');
      return;
    }

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user?.username || 'developer'}_portfolio.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Success', 'Portfolio file exported successfully!', 'success');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px' }}>
      
      {/* Design Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Template Selector */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layout size={16} color="var(--accent-primary)" /> Choose Layout Template
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {templates.map(t => (
              <div 
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '12px',
                  background: template === t.id ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.01)',
                  borderColor: template === t.id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)'
                }}
              >
                <h4 style={{ fontSize: '13px', fontWeight: '700' }}>{t.name}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accent Colors */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={16} color="var(--accent-secondary)" /> Accent Palette
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {colors.map(col => (
              <button
                key={col}
                onClick={() => setAccentColor(col)}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: col, border: accentColor === col ? '2.5px solid #fff' : 'none',
                  cursor: 'pointer', outline: 'none', transition: 'transform 0.1s ease',
                  transform: accentColor === col ? 'scale(1.1)' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Download Bundle */}
        <button onClick={handleDownload} className="btn-primary" style={{ padding: '14px', gap: '8px' }}>
          <Download size={16} /> Download Standalone HTML
        </button>

      </div>

      {/* Interactive Mockup Viewport */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '620px', overflow: 'hidden' }}>
        
        {/* Viewport Head */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,18,0.2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-subtitle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={14} /> Live Sandbox Rendering
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setViewportMode('desktop')} 
              style={{
                background: 'none', border: 'none', cursor: 'pointer', 
                color: viewportMode === 'desktop' ? 'var(--accent-primary)' : 'var(--text-muted)'
              }}
            >
              <Monitor size={16} />
            </button>
            <button 
              onClick={() => setViewportMode('mobile')} 
              style={{
                background: 'none', border: 'none', cursor: 'pointer', 
                color: viewportMode === 'mobile' ? 'var(--accent-primary)' : 'var(--text-muted)'
              }}
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        {/* Viewport Screen */}
        <div style={{
          flex: 1,
          background: '#040406',
          padding: '30px',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '100%',
            maxWidth: viewportMode === 'desktop' ? '700px' : '360px',
            transition: 'max-width 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            fontFamily: template === 'cyber' ? 'monospace' : 'var(--font-body)',
            color: template === 'cyber' ? '#00ffcc' : 'var(--text-main)'
          }}>
            
            {/* Portfolio Mockup details */}
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', color: accentColor, textShadow: template === 'cyber' ? `0 0 5px ${accentColor}` : 'none' }}>
                {user?.username || 'John Doe'}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                {profile?.bio || 'Full stack engineer building scalable microservices.'}
              </p>
            </div>

            {/* Skills */}
            <div className="glass-card" style={{
              padding: '16px', marginBottom: '20px', background: 'rgba(255,255,255,0.01)',
              borderColor: template === 'cyber' ? accentColor : 'rgba(255,255,255,0.05)',
              boxShadow: template === 'cyber' ? `0 0 8px ${accentColor}11` : 'none',
              borderRadius: template === 'cyber' ? '4px' : '12px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '6px' }}>
                Skills Grid
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(profile?.skills || ['JavaScript', 'React', 'Node.js']).map((s, idx) => (
                  <span 
                    key={idx} 
                    className="badge"
                    style={{
                      borderRadius: template === 'cyber' ? '2px' : '100px',
                      border: template === 'cyber' ? '1px solid #00ffcc' : '1px solid rgba(255,255,255,0.08)',
                      background: template === 'cyber' ? 'none' : 'rgba(99, 102, 241, 0.1)'
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience timeline */}
            {profile?.experience && profile.experience.length > 0 && (
              <div className="glass-card" style={{
                padding: '16px', background: 'rgba(255,255,255,0.01)',
                borderColor: template === 'cyber' ? accentColor : 'rgba(255,255,255,0.05)',
                borderRadius: template === 'cyber' ? '4px' : '12px'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '6px' }}>
                  Professional Timeline
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {profile.experience.map((exp, idx) => (
                    <div key={idx} style={{ fontSize: '13px' }}>
                      <p style={{ fontWeight: '700', color: '#fff' }}>{exp.position} at {exp.company}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.startDate} — {exp.endDate || 'Present'} | {exp.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
