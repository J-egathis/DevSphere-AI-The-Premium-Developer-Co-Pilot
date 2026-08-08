import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { Plus, Trash2, MapPin, DollarSign, Calendar, FileEdit, MoreHorizontal, Columns } from 'lucide-react';

export default function JobTracker() {
  const { showToast, refreshProfileState } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Form Fields
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Wishlist');

  const columns = ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!company || !position) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ company, position, salary, location, notes, status })
      });

      if (res.ok) {
        showToast('Application Added', `${position} at ${company} logged.`, 'success');
        fetchJobs();
        refreshProfileState();
        // Reset form
        setCompany('');
        setPosition('');
        setSalary('');
        setLocation('');
        setNotes('');
        setStatus('Wishlist');
        setShowAddForm(false);
      } else {
        showToast('Error', 'Failed to save job application', 'warning');
      }
    } catch (err) {
      showToast('Error', 'Network request failed', 'warning');
    }
  };

  const handleDeleteJob = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Application Deleted', 'Removed card from board.', 'info');
        fetchJobs();
        refreshProfileState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // HTML5 Drag and Drop Managers
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, col) => {
    e.preventDefault();
    setDragOverColumn(col);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const jobId = e.dataTransfer.getData('text/plain');
    if (!jobId) return;

    // Local Optimistic UI update
    const updatedJobs = jobs.map(j => {
      if (j._id === jobId) {
        return { ...j, status: targetStatus };
      }
      return j;
    });
    setJobs(updatedJobs);

    // Call API
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      if (res.ok) {
        showToast('Status Updated', `Moved application to ${targetStatus}`, 'success');
        fetchJobs();
      } else {
        fetchJobs(); // Rollback if error
      }
    } catch (err) {
      console.error(err);
      fetchJobs();
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Columns size={20} color="var(--accent-primary)" />
          <p style={{ color: 'var(--text-subtitle)', fontSize: '14px' }}>
            Orchestrate your application cycle. Drag-and-drop cards between states.
          </p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary" style={{ gap: '6px' }}>
          <Plus size={16} /> Log Application
        </button>
      </div>

      {/* Add Job card Drawer Overlay */}
      {showAddForm && (
        <div className="glass-card animate-slide-up" style={{
          padding: '24px', background: 'rgba(15, 15, 30, 0.95)', border: '1px solid rgba(99, 102, 241, 0.2)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Log New Application</h3>
          <form onSubmit={handleAddJob} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label className="glass-label">Company Name *</label>
              <input type="text" required className="glass-input" placeholder="Google" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className="glass-label">Job Position *</label>
              <input type="text" required className="glass-input" placeholder="Software Engineer" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div>
              <label className="glass-label">Estimated Salary</label>
              <input type="text" className="glass-input" placeholder="$120k/yr" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </div>
            <div>
              <label className="glass-label">Location</label>
              <input type="text" className="glass-input" placeholder="Remote / SF" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="glass-label">Pipeline Stage</label>
              <select className="glass-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {columns.map((col, idx) => <option key={idx} value={col} style={{ background: '#0b0b18' }}>{col}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="glass-label">Application Notes / Keywords</label>
              <input type="text" className="glass-input" placeholder="Referral via LinkedIn, interview format has 3 rounds" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '12px', gridColumn: 'span 2', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Add Application</button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board Container */}
      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '16px',
        alignItems: 'flex-start'
      }}>
        {columns.map((column) => {
          const columnJobs = jobs.filter(j => j.status === column);
          const isOver = dragOverColumn === column;

          return (
            <div 
              key={column}
              onDragOver={(e) => handleDragOver(e, column)}
              onDrop={(e) => handleDrop(e, column)}
              className="glass-card"
              style={{
                flex: '1',
                minWidth: '260px',
                padding: '16px',
                background: isOver ? 'rgba(99, 102, 241, 0.05)' : 'var(--glass-bg)',
                borderColor: isOver ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                display: 'flex', flexDirection: 'column', gap: '12px'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {column}
                </h4>
                <span className="badge badge-info" style={{ borderRadius: '6px', padding: '2px 6px', fontSize: '10px' }}>
                  {columnJobs.length}
                </span>
              </div>

              {/* Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '350px' }}>
                {columnJobs.map((job) => (
                  <div 
                    key={job._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job._id)}
                    className="glass-card"
                    style={{
                      padding: '14px',
                      background: 'rgba(255,255,255,0.01)',
                      borderColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '10px',
                      cursor: 'grab',
                      display: 'flex', flexDirection: 'column', gap: '8px'
                    }}
                  >
                    <div>
                      <h5 style={{ fontSize: '14px', fontWeight: '800' }}>{job.position}</h5>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.company}</p>
                    </div>

                    {(job.salary || job.location) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                        {job.salary && (
                          <span style={{ fontSize: '10px', color: 'var(--text-subtitle)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <DollarSign size={10} /> {job.salary}
                          </span>
                        )}
                        {job.location && (
                          <span style={{ fontSize: '10px', color: 'var(--text-subtitle)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <MapPin size={10} /> {job.location}
                          </span>
                        )}
                      </div>
                    )}

                    {job.notes && (
                      <p style={{
                        fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.1)', 
                        padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {job.notes}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifySelf: 'flex-end', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Calendar size={10} /> {new Date(job.dateApplied).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => handleDeleteJob(job._id)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239, 68, 68, 0.6)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {columnJobs.length === 0 && (
                  <div style={{
                    border: '1px dashed rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '11px'
                  }}>
                    Drop applications here
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
