import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
  FileText, Briefcase, Mic, Map, Github, User, ArrowUpRight, CheckCircle2, TrendingUp, Cpu
} from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useContext(AuthContext);
  const navigate = useNavigate();

  // Targets for animated countup
  const targets = {
    profileCompletion: profile?.stats?.profileCompletion || 20,
    resumeScore: profile?.stats?.resumeScore || 0,
    interviewReadiness: profile?.stats?.interviewReadiness || 0,
    projectsCount: profile?.stats?.projectsCount || 0,
    githubActivityCount: profile?.stats?.githubActivityCount || 0,
    learningProgress: profile?.stats?.learningProgress || 0
  };

  // State for counters
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [resumeScore, setResumeScore] = useState(0);
  const [interviewReadiness, setInterviewReadiness] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [githubActivityCount, setGithubActivityCount] = useState(0);
  const [learningProgress, setLearningProgress] = useState(0);

  useEffect(() => {
    // Count-up animation
    const duration = 1200; // ms
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);

    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      // Easing function outQuad
      const ease = progress * (2 - progress);

      setProfileCompletion(Math.round(targets.profileCompletion * ease));
      setResumeScore(Math.round(targets.resumeScore * ease));
      setInterviewReadiness(Math.round(targets.interviewReadiness * ease));
      setProjectsCount(Math.round(targets.projectsCount * ease));
      setGithubActivityCount(Math.round(targets.githubActivityCount * ease));
      setLearningProgress(Math.round(targets.learningProgress * ease));

      if (frame >= totalFrames) {
        clearInterval(timer);
        // Ensure exact target is set
        setProfileCompletion(targets.profileCompletion);
        setResumeScore(targets.resumeScore);
        setInterviewReadiness(targets.interviewReadiness);
        setProjectsCount(targets.projectsCount);
        setGithubActivityCount(targets.githubActivityCount);
        setLearningProgress(targets.learningProgress);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [profile]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        padding: '30px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
            Welcome Back, {user?.username || 'Developer'}
          </h1>
          <p style={{ color: 'var(--text-subtitle)', fontSize: '15px', maxWidth: '600px' }}>
            DevSphere AI has indexed your activity. Explore career matches, practice with real-time technical questions, and optimize your ATS scoring.
          </p>
        </div>
        <button onClick={() => navigate('/profile')} className="btn-primary" style={{ gap: '6px' }}>
          <User size={16} /> Complete Profile
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="dashboard-grid">
        
        {/* Profile Completion */}
        <div className="glass-card glow-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Profile Completion</span>
            <span className="badge badge-info">{profileCompletion}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>{profileCompletion}%</h2>
          </div>
          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${profileCompletion}%`,
              background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '3px', transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Resume Score */}
        <div className="glass-card glow-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>ATS Resume Score</span>
            <FileText size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
              {resumeScore > 0 ? `${resumeScore}%` : 'Unrated'}
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {resumeScore > 0 ? 'Optimal score for enterprise companies.' : 'Upload your resume to get instant ATS feedback.'}
          </p>
        </div>

        {/* Projects Count */}
        <div className="glass-card glow-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Jobs Tracked</span>
            <Briefcase size={18} color="var(--accent-green)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>{projectsCount}</h2>
            <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
              Active Pipeline
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Applications in wishlist, interviewing or offer phases.</p>
        </div>

        {/* Interview Readiness */}
        <div className="glass-card glow-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Interview Readiness</span>
            <Mic size={18} color="var(--accent-yellow)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
              {interviewReadiness > 0 ? `${interviewReadiness}%` : 'Not Tested'}
            </h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {interviewReadiness > 0 ? 'Based on latest AI evaluation responses.' : 'Complete an AI audio mock interview.'}
          </p>
        </div>

      </div>

      {/* Analytics Graph & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* SVG Activity Graph */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Weekly System Progression</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> +12.4% this week
            </span>
          </div>
          <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
            {/* Visualizer Graph Columns */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '100%', height: '40px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '4px', borderTop: '2px solid #6366f1' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mon</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '100%', height: '80px', background: 'rgba(99, 102, 241, 0.3)', borderRadius: '4px', borderTop: '2px solid #6366f1' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tue</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '100%', height: '65px', background: 'rgba(99, 102, 241, 0.25)', borderRadius: '4px', borderTop: '2px solid #6366f1' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wed</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '100%', height: '110px', background: 'linear-gradient(to top, rgba(99, 102, 241, 0.1) 0%, #6366f1 100%)', borderRadius: '4px', borderTop: '2px solid #a855f7' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Thu</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '100%', height: '95px', background: 'rgba(99, 102, 241, 0.3)', borderRadius: '4px', borderTop: '2px solid #6366f1' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fri</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '100%', height: '140px', background: 'linear-gradient(to top, rgba(99, 102, 241, 0.1) 0%, #a855f7 100%)', borderRadius: '4px', borderTop: '2px solid #a855f7' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sat</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '100%', height: '160px', background: 'linear-gradient(to top, #6366f1 0%, #a855f7 100%)', borderRadius: '4px', borderTop: '2px solid #fff' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sun</span>
            </div>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Fast Track Services</h3>
          
          <button onClick={() => navigate('/resume-analyzer')} className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={16} /> Audit Resume</span>
            <ArrowUpRight size={16} />
          </button>

          <button onClick={() => navigate('/interview-assistant')} className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mic size={16} /> Launch Interviewer</span>
            <ArrowUpRight size={16} />
          </button>

          <button onClick={() => navigate('/roadmaps')} className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Map size={16} /> Check Roadmap</span>
            <ArrowUpRight size={16} />
          </button>
        </div>

      </div>

      {/* Learning roadmap progression block */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-secondary)" /> Learning Roadmap Milestones Completed
          </h3>
          <span className="badge badge-success">{learningProgress}% Complete</span>
        </div>
        <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{
            height: '100%', width: `${learningProgress}%`,
            background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)', transition: 'width 0.5s ease'
          }}></div>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          {learningProgress > 0 
            ? `You have cleared multiple developer milestone tasks. Head over to Career Roadmaps to toggle additional achievements.` 
            : `You haven't checked any roadmap milestones yet. Tap "Career Roadmaps" in the sidebar to review frontend, backend, or AI tracks.`}
        </p>
      </div>

    </div>
  );
}
