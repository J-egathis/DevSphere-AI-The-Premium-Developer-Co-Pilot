import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { Map, CheckCircle2, Circle, Compass, Sparkles, ChevronRight, Award } from 'lucide-react';

export default function Roadmaps() {
  const { showToast, refreshProfileState } = useContext(AuthContext);
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeType, setActiveType] = useState('frontend');

  const roadmapTypes = ['frontend', 'backend', 'fullstack', 'ai', 'devops'];

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/roadmaps', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmaps(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    const token = localStorage.getItem('token');
    try {
      // Optimistic update
      const updated = roadmaps.map(rm => {
        if (rm.type === activeType) {
          return {
            ...rm,
            progress: rm.progress.map(p => {
              if (p.milestoneId === milestoneId) {
                return { ...p, completed: !p.completed };
              }
              return p;
            })
          };
        }
        return rm;
      });
      setRoadmaps(updated);

      const res = await fetch('/api/roadmaps/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roadmapType: activeType, milestoneId })
      });

      if (res.ok) {
        showToast('Milestone Updated', 'Roadmap progress saved.', 'success');
        fetchRoadmaps();
        refreshProfileState();
      } else {
        fetchRoadmaps(); // rollback
      }
    } catch (err) {
      console.error(err);
      fetchRoadmaps();
    }
  };

  const activeRoadmap = roadmaps.find(rm => rm.type === activeType);
  
  // Calculate completion percentage
  const getCompletionPercentage = (rm) => {
    if (!rm || !rm.progress || rm.progress.length === 0) return 0;
    const completed = rm.progress.filter(p => p.completed).length;
    return Math.round((completed / rm.progress.length) * 100);
  };

  const completionPct = getCompletionPercentage(activeRoadmap);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Selector Tabs */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {roadmapTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={activeType === type ? 'btn-primary' : 'btn-secondary'}
            style={{
              padding: '10px 20px',
              textTransform: 'capitalize',
              boxShadow: activeType === type ? '0 4px 15px rgba(99, 102, 241, 0.2)' : 'none'
            }}
          >
            {type} Path
          </button>
        ))}
      </div>

      {/* Main Details and Tree Graph */}
      {activeRoadmap ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* Timeline Tree Nodes */}
          <div className="glass-card" style={{ padding: '30px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
              <Compass size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{activeRoadmap.title} Curriculum</h3>
            </div>

            {/* Vertically running connection line */}
            <div style={{
              position: 'absolute',
              left: '49px',
              top: '90px',
              bottom: '50px',
              width: '2px',
              background: 'linear-gradient(to bottom, var(--accent-primary) 0%, rgba(255,255,255,0.05) 100%)',
              zIndex: 0
            }}></div>

            {/* Tree nodes list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
              {activeRoadmap.progress.map((milestone, idx) => {
                return (
                  <div 
                    key={milestone.milestoneId} 
                    style={{
                      display: 'flex',
                      gap: '20px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Node circle tracker */}
                    <div 
                      onClick={() => handleToggleMilestone(milestone.milestoneId)}
                      style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: milestone.completed ? 'var(--accent-primary)' : 'rgba(10, 10, 18, 0.9)',
                        border: `2px solid ${milestone.completed ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: milestone.completed ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {milestone.completed ? <CheckCircle2 size={18} color="#fff" /> : <Circle size={18} color="var(--text-muted)" />}
                    </div>

                    {/* Node details */}
                    <div 
                      onClick={() => handleToggleMilestone(milestone.milestoneId)}
                      className="glass-card glass-card-interactive"
                      style={{
                        flex: 1,
                        padding: '16px 20px',
                        background: milestone.completed ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255,255,255,0.01)',
                        borderColor: milestone.completed ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>STAGE {idx + 1}</span>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px', color: milestone.completed ? '#fff' : 'var(--text-subtitle)' }}>
                          {milestone.title}
                        </h4>
                      </div>
                      <ChevronRight size={16} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats details panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Progress Gauge */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
              <Award size={28} color="var(--accent-secondary)" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Progress Completion</h4>
              <h2 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-display)', margin: '6px 0' }}>
                {completionPct}%
              </h2>
              <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ height: '100%', width: `${completionPct}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '3px' }}></div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {completionPct === 100 ? 'Outstanding! You have cleared this career path.' : 'Clear all stages to finalize the curriculum.'}
              </p>
            </div>

            {/* Recommendations card */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="var(--accent-yellow)" /> Path Insights
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Our algorithms cross-check these roadmap items against your resume. Upload updated CV documents in the Resume Analyzer to reveal missing skills matching this path.
              </p>
            </div>

          </div>

        </div>
      ) : (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          Initializing Roadmap Curriculum...
        </div>
      )}

    </div>
  );
}
