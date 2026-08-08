import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../App';
import { User, Plus, Trash2, Tag, Calendar, GraduationCap, Briefcase, Award, Save } from 'lucide-react';

export default function Profile() {
  const { profile, showToast, refreshProfileState } = useContext(AuthContext);

  // General profile settings
  const [bio, setBio] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  // Experience form fields
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Education form fields
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');

  // Certification fields
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certDate, setCertDate] = useState('');

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setGithubUsername(profile.githubUsername || '');
      setAvatar(profile.avatar || '');
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, githubUsername, avatar, skills })
      });

      if (res.ok) {
        showToast('Profile Saved', 'Profile settings updated.', 'success');
        refreshProfileState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Skills tag manager
  const addSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Timeline adders
  const addExperience = async (e) => {
    e.preventDefault();
    if (!company || !position) return;

    const newExp = { company, position, location: expLocation, startDate: expStart, endDate: expEnd, description: expDesc };
    const updatedExperience = [...(profile?.experience || []), newExp];
    
    await saveTimelineData({ experience: updatedExperience });
    // Reset fields
    setCompany(''); setPosition(''); setExpLocation(''); setExpStart(''); setExpEnd(''); setExpDesc('');
  };

  const deleteExperience = async (idx) => {
    const updated = (profile?.experience || []).filter((_, i) => i !== idx);
    await saveTimelineData({ experience: updated });
  };

  const addEducation = async (e) => {
    e.preventDefault();
    if (!institution || !degree) return;

    const newEdu = { institution, degree, fieldOfStudy, startDate: eduStart, endDate: eduEnd };
    const updatedEducation = [...(profile?.education || []), newEdu];

    await saveTimelineData({ education: updatedEducation });
    // Reset fields
    setInstitution(''); setDegree(''); setFieldOfStudy(''); setEduStart(''); setEduEnd('');
  };

  const deleteEducation = async (idx) => {
    const updated = (profile?.education || []).filter((_, i) => i !== idx);
    await saveTimelineData({ education: updated });
  };

  const addCertification = async (e) => {
    e.preventDefault();
    if (!certName || !certIssuer) return;

    const newCert = { name: certName, issuer: certIssuer, issueDate: certDate };
    const updatedCerts = [...(profile?.certifications || []), newCert];

    await saveTimelineData({ certifications: updatedCerts });
    // Reset fields
    setCertName(''); setCertIssuer(''); setCertDate('');
  };

  const deleteCertification = async (idx) => {
    const updated = (profile?.certifications || []).filter((_, i) => i !== idx);
    await saveTimelineData({ certifications: updated });
  };

  const saveTimelineData = async (payload) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast('Timeline Updated', 'Changes saved to profile.', 'success');
        refreshProfileState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'flex-start' }}>
      
      {/* General Settings and Skills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Core fields */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} color="var(--accent-primary)" /> Basic Profile Data
          </h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="glass-label">Professional Summary</label>
              <textarea className="glass-input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell companies about your trajectory..." />
            </div>
            <div>
              <label className="glass-label">GitHub Username</label>
              <input type="text" className="glass-input" value={githubUsername} onChange={(e) => setGithubUsername(e.target.value)} placeholder="octocat" />
            </div>
            <div>
              <label className="glass-label">Avatar Seed Name</label>
              <input type="text" className="glass-input" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="Custom seeds trigger robot icons" />
            </div>
            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', gap: '6px' }}>
              <Save size={14} /> Save Configuration
            </button>
          </form>
        </div>

        {/* Skills Tags manager */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={16} color="var(--accent-secondary)" /> Tech Skills Tags
          </h3>
          <form onSubmit={addSkill} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input type="text" className="glass-input" placeholder="Add skill (e.g. Kubernetes)" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
            <button type="submit" className="btn-secondary" style={{ padding: '12px' }}><Plus size={16} /></button>
          </form>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skills.map((skill, idx) => (
              <span 
                key={idx} 
                className="badge badge-info"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px' }}
              >
                {skill}
                <button 
                  type="button" 
                  onClick={() => removeSkill(skill)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '10px' }}
                >
                  ✕
                </button>
              </span>
            ))}
            {skills.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No skills indexed. Add them using the form above.</p>}
          </div>
        </div>

      </div>

      {/* Timelines timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Experience log */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={16} color="var(--accent-green)" /> Work Experience
          </h3>

          {/* Current log list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {profile?.experience?.map((exp, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700' }}>{exp.position} at {exp.company}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{exp.startDate} - {exp.endDate || 'Present'}</p>
                </div>
                <button onClick={() => deleteExperience(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239, 68, 68, 0.6)' }}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>

          <form onSubmit={addExperience} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input type="text" required placeholder="Company name" className="glass-input" value={company} onChange={(e) => setCompany(e.target.value)} />
            <input type="text" required placeholder="Job position" className="glass-input" value={position} onChange={(e) => setPosition(e.target.value)} />
            <input type="text" placeholder="Start date" className="glass-input" value={expStart} onChange={(e) => setExpStart(e.target.value)} />
            <input type="text" placeholder="End date (or Present)" className="glass-input" value={expEnd} onChange={(e) => setExpEnd(e.target.value)} />
            <div style={{ gridColumn: 'span 2' }}>
              <input type="text" placeholder="Location" className="glass-input" value={expLocation} onChange={(e) => setExpLocation(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '10px' }}><Plus size={14} /> Add Experience</button>
          </form>
        </div>

        {/* Education Timeline */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={16} color="var(--accent-yellow)" /> Academic Degrees
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {profile?.education?.map((edu, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700' }}>{edu.degree} in {edu.fieldOfStudy}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{edu.institution} | {edu.startDate} - {edu.endDate}</p>
                </div>
                <button onClick={() => deleteEducation(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239, 68, 68, 0.6)' }}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>

          <form onSubmit={addEducation} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input type="text" required placeholder="University / Academy" className="glass-input" value={institution} onChange={(e) => setInstitution(e.target.value)} />
            <input type="text" required placeholder="Degree (e.g. Bachelor)" className="glass-input" value={degree} onChange={(e) => setDegree(e.target.value)} />
            <input type="text" placeholder="Field of study" className="glass-input" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} />
            <input type="text" placeholder="Years (e.g. 2020-2024)" className="glass-input" value={eduStart} onChange={(e) => setEduStart(e.target.value)} />
            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '10px' }}><Plus size={14} /> Add Education</button>
          </form>
        </div>

        {/* Certifications Timeline */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} color="var(--accent-glow)" /> Certifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {profile?.certifications?.map((cert, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700' }}>{cert.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Issued by {cert.issuer} ({cert.issueDate})</p>
                </div>
                <button onClick={() => deleteCertification(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239, 68, 68, 0.6)' }}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>

          <form onSubmit={addCertification} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input type="text" required placeholder="Cert Title (e.g. AWS Cloud)" className="glass-input" value={certName} onChange={(e) => setCertName(e.target.value)} />
            <input type="text" required placeholder="Issuing Institution" className="glass-input" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} />
            <div style={{ gridColumn: 'span 2' }}>
              <input type="text" placeholder="Issue Date" className="glass-input" value={certDate} onChange={(e) => setCertDate(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2', padding: '10px' }}><Plus size={14} /> Add Certification</button>
          </form>
        </div>

      </div>

    </div>
  );
}
