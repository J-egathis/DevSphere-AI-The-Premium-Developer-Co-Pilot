import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { Upload, FileText, CheckCircle, HelpCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResumeAnalyzer() {
  const { showToast, refreshProfileState } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/resumes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
        if (data.length > 0) {
          setSelectedResume(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      triggerAnalysis(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      triggerAnalysis(e.target.files[0]);
    }
  };

  const triggerAnalysis = async (uploadedFile) => {
    setAnalyzing(true);
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('resume', uploadedFile);

    try {
      const res = await fetch('/api/resumes/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        // Trigger congratulations particles on nice scores
        if (data.score >= 70) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
        showToast('Analysis Complete', `Resume scored ${data.score}%!`, 'success');
        fetchResumes();
        refreshProfileState();
      } else {
        const err = await res.json();
        showToast('Processing Error', err.message || 'Failed to scan resume', 'warning');
      }
    } catch (err) {
      showToast('Error', 'Server upload failed', 'warning');
    } finally {
      setAnalyzing(false);
      setFile(null);
    }
  };

  // SVG Gauge calculations
  const radius = 50;
  const strokeWidth = 8;
  const circumference = radius * 2 * Math.PI;
  const getStrokeDashoffset = (score) => {
    return circumference - (score / 100) * circumference;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' }}>
      
      {/* Work zone */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Upload Zone */}
        <div 
          className="glass-card" 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            padding: '40px',
            border: isDragActive ? '2px dashed var(--accent-primary)' : '1px dashed rgba(255,255,255,0.15)',
            textAlign: 'center',
            background: isDragActive ? 'rgba(99, 102, 241, 0.05)' : 'var(--glass-bg)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
            cursor: 'pointer', position: 'relative'
          }}
        >
          <input 
            type="file" id="file-uploader" accept=".pdf,.doc,.docx,.txt" 
            onChange={handleFileChange} style={{ display: 'none' }} 
          />
          <label htmlFor="file-uploader" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <Upload size={24} color="var(--accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Upload your resume document</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                Drag & Drop or click to browse files (PDF, DOCX, TXT up to 5MB)
              </p>
            </div>
          </label>
        </div>

        {/* Loading / Analysing View */}
        {analyzing && (
          <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700' }}>AI ATS Parsing in Progress...</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                Extracting contact info, work background, educational milestones and developer skillsets.
              </p>
            </div>
          </div>
        )}

        {/* Selected Resume Score Details */}
        {selectedResume && !analyzing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header info */}
            <div className="glass-card" style={{ padding: '30px', display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
              
              {/* Radial Gauge */}
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="65" cy="65" r={radius}
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  <circle
                    cx="65" cy="65" r={radius}
                    stroke={selectedResume.score >= 75 ? 'var(--accent-green)' : selectedResume.score >= 60 ? 'var(--accent-yellow)' : 'var(--accent-red)'}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={getStrokeDashoffset(selectedResume.score)}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <span style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>{selectedResume.score}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>ATS Score</span>
                </div>
              </div>

              {/* Title & Feedback text */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FileText size={18} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{selectedResume.filename}</h3>
                </div>
                <p style={{ color: 'var(--text-subtitle)', fontSize: '14px', lineHeight: 1.6 }}>
                  {selectedResume.parsedData.atsFeedback}
                </p>
              </div>
            </div>

            {/* Resume report Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Matched Skills */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} color="var(--accent-green)" /> Skills Extracted ({selectedResume.parsedData.skillsMatched.length})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedResume.parsedData.skillsMatched.map((skill, idx) => (
                    <span key={idx} className="badge badge-success">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={16} color="var(--accent-yellow)" /> Recommended Skills
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedResume.parsedData.skillsMissing.map((skill, idx) => (
                    <span key={idx} className="badge badge-warning">{skill}</span>
                  ))}
                </div>
              </div>

              {/* Career Path recommendations */}
              <div className="glass-card" style={{ padding: '24px', gridColumn: 'span 2' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="var(--accent-secondary)" /> Optimal Career Trajectories
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {selectedResume.parsedData.careerPathRecommendations.map((career, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700' }}>{career}</span>
                      <ArrowRight size={14} color="var(--accent-secondary)" />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Sidebar history */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Audit History</h3>
        
        {resumes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
            No uploads archived yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '500px' }}>
            {resumes.map((res) => (
              <div 
                key={res._id}
                onClick={() => setSelectedResume(res)}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '12px 16px',
                  background: selectedResume?._id === res._id ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                  borderColor: selectedResume?._id === res._id ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ overflow: 'hidden', marginRight: '8px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.filename}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(res.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${res.score >= 75 ? 'badge-success' : res.score >= 60 ? 'badge-warning' : 'badge-danger'}`} style={{ minWidth: '40px', textAlign: 'center' }}>
                  {res.score}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
