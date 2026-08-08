import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { Shield, Users, Server, HardDrive, Cpu, Activity, ShieldAlert, Settings } from 'lucide-react';

export default function Admin() {
  const { showToast } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // 1. Fetch system statistics
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch list of registered users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }
    } catch (err) {
      console.error(err);
      showToast('Admin Check Failed', 'Error fetching system logs.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: targetRole })
      });

      if (res.ok) {
        showToast('Role Updated', `User promoted to ${targetRole}`, 'success');
        fetchAdminData();
      } else {
        showToast('Authorization Denied', 'Unable to execute command.', 'warning');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="skeleton" style={{ height: '120px', width: '100%' }}></div>
        <div className="skeleton" style={{ height: '350px', width: '100%' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Server Health Cards */}
      {stats && (
        <div className="dashboard-grid">
          
          {/* Active node counts */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users size={20} color="var(--accent-primary)" />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered Accounts</span>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{stats.metrics.totalUsers}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(168,85,247,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity size={20} color="var(--accent-secondary)" />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Analyzed Resumes</span>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{stats.metrics.totalResumes}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Cpu size={20} color="var(--accent-green)" />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>CPU Utilization</span>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{stats.health.cpuUsage}</h3>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <HardDrive size={20} color="var(--accent-yellow)" />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Memory Buffer</span>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{stats.health.memoryUsage}</h3>
            </div>
          </div>

        </div>
      )}

      {/* System Status Table and User Manager */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* User manager table */}
        <div className="glass-card" style={{ padding: '24px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="var(--accent-primary)" /> Identity Management Index
          </h3>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 8px' }}>User Details</th>
                <th style={{ padding: '12px 8px' }}>Registered Email</th>
                <th style={{ padding: '12px 8px' }}>Permission Role</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((userItem) => (
                <tr key={userItem._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: '700', color: '#fff' }}>{userItem.username}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-subtitle)' }}>{userItem.email}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span className={`badge ${userItem.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                      {userItem.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleRoleToggle(userItem._id, userItem.role)}
                      className="btn-secondary" 
                      style={{ padding: '6px 10px', fontSize: '11px', display: 'inline-flex', marginLeft: 'auto' }}
                    >
                      {userItem.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Server status monitors */}
        {stats && (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={16} color="var(--accent-secondary)" /> Hardware Gateways
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>API Gateway</span>
                <span className="badge badge-success" style={{ fontSize: '10px' }}>{stats.health.apiStatus}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>MongoDB Clusters</span>
                <span className="badge badge-success" style={{ fontSize: '10px' }}>{stats.health.databaseStatus}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Socket.IO Node</span>
                <span className="badge badge-success" style={{ fontSize: '10px' }}>{stats.health.socketStatus}</span>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
