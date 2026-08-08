import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  LayoutDashboard, FileText, Mic, Briefcase, 
  Map, MessageSquare, BriefcaseIcon, Github, 
  User as UserIcon, Shield, LogOut, Bell, Menu, X, CheckCircle, Info, AlertTriangle
} from 'lucide-react';

import ParticleBg from './components/ParticleBg';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import InterviewAssistant from './pages/InterviewAssistant';
import JobTracker from './pages/JobTracker';
import Roadmaps from './pages/Roadmaps';
import Chat from './pages/Chat';
import PortfolioBuilder from './pages/PortfolioBuilder';
import GithubAnalytics from './pages/GithubAnalytics';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// ==========================================
// REACT CONTEXTS DEFINITIONS
// ==========================================
export const AuthContext = createContext(null);
export const NotificationContext = createContext(null);
export const SocketContext = createContext(null);

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Toast helper trigger
  const showToast = (title, message, type = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Check local session
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedProfile = localStorage.getItem('profile');

    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      
      // Fetch fresh profile details
      fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(data => {
        setProfile(data);
        localStorage.setItem('profile', JSON.stringify(data));
      })
      .catch(err => console.log('Session check log:', err));
    }
    setAuthLoading(false);
  }, []);

  // 2. Initialize Socket.IO connection when user logs in
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = window.location.origin.includes('localhost') 
      ? 'http://localhost:5000' 
      : window.location.origin;

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected');
      newSocket.emit('register_user', { userId: user._id, username: user.username });
    });

    newSocket.on('typing_status', (status) => {
      // Handled inside individual chat pages
    });

    setSocket(newSocket);

    // Fetch Notifications
    fetchNotifications();

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const addNotification = async (title, content, type = 'info') => {
    // Standard triggers will hit the server in production. In our simulation,
    // we also insert local notifications and pull them.
    const token = localStorage.getItem('token');
    if (!token) return;
    fetchNotifications();
  };

  const handleLogin = (loginData) => {
    localStorage.setItem('token', loginData.token);
    localStorage.setItem('user', JSON.stringify(loginData.user));
    localStorage.setItem('profile', JSON.stringify(loginData.profile));
    setUser(loginData.user);
    setProfile(loginData.profile);
    showToast('Logged In', `Welcome back, ${loginData.user.username}!`, 'success');
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    setUser(null);
    setProfile(null);
    showToast('Logged Out', 'Successfully logged out of DevSphere AI', 'info');
    navigate('/auth');
  };

  const refreshProfileState = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        localStorage.setItem('profile', JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
        justifyContent: 'center', alignItems: 'center', background: '#050508', gap: '16px'
      }}>
        <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
        <p style={{ color: '#cbd5e1', fontSize: '14px', letterSpacing: '0.05em' }}>BOOTING DEVSPHERE ENGINE...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, handleLogin, handleLogout, refreshProfileState, showToast }}>
      <NotificationContext.Provider value={{ notifications, refreshNotifications: fetchNotifications, addNotification }}>
        <SocketContext.Provider value={socket}>
          <div className="aurora-bg">
            <div className="aurora-circle aurora-1"></div>
            <div className="aurora-circle aurora-2"></div>
            <div className="aurora-circle aurora-3"></div>
          </div>
          
          <ParticleBg />

          {/* Toast Notification HUD */}
          {toast && (
            <div className="glass-card animate-slide-up" style={{
              position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
              padding: '16px 20px', borderLeft: `4px solid ${
                toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : '#6366f1'
              }`, minWidth: '300px', display: 'flex', gap: '12px', alignItems: 'flex-start'
            }}>
              <div style={{ marginTop: '2px' }}>
                {toast.type === 'success' && <CheckCircle size={18} color="#10b981" />}
                {toast.type === 'warning' && <AlertTriangle size={18} color="#f59e0b" />}
                {toast.type === 'info' && <Info size={18} color="#6366f1" />}
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{toast.title}</h4>
                <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>{toast.message}</p>
              </div>
            </div>
          )}

          <Routes>
            {/* Auth screen */}
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
            
            {/* Application Console */}
            <Route path="/*" element={
              user ? (
                <div style={{ display: 'flex', minHeight: '100vh' }}>
                  {/* Sidebar Navigation */}
                  <aside className="glass-card" style={{
                    width: sidebarOpen ? '260px' : '0px',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    borderTop: 'none', borderBottom: 'none', borderLeft: 'none',
                    borderRadius: '0px',
                    zIndex: 100,
                    position: 'fixed', top: 0, bottom: 0, left: 0,
                    background: 'rgba(5, 5, 8, 0.85)'
                  }}>
                    {/* Logo */}
                    <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px'
                      }}>D</div>
                      <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>
                        DevSphere <span style={{ color: '#a855f7' }}>AI</span>
                      </span>
                    </div>

                    {/* Nav Links */}
                    <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" active={location.pathname === '/dashboard'} />
                      <SidebarLink to="/resume-analyzer" icon={<FileText size={18} />} label="AI Resume Score" active={location.pathname === '/resume-analyzer'} />
                      <SidebarLink to="/interview-assistant" icon={<Mic size={18} />} label="AI Interviewer" active={location.pathname === '/interview-assistant'} />
                      <SidebarLink to="/job-tracker" icon={<Briefcase size={18} />} label="Kanban Job Tracker" active={location.pathname === '/job-tracker'} />
                      <SidebarLink to="/roadmaps" icon={<Map size={18} />} label="Career Roadmaps" active={location.pathname === '/roadmaps'} />
                      <SidebarLink to="/chat" icon={<MessageSquare size={18} />} label="Global Socket Chat" active={location.pathname === '/chat'} />
                      <SidebarLink to="/portfolio-builder" icon={<BriefcaseIcon size={18} />} label="Portfolio Generator" active={location.pathname === '/portfolio-builder'} />
                      <SidebarLink to="/github-analytics" icon={<Github size={18} />} label="Github Analytics" active={location.pathname === '/github-analytics'} />
                      <SidebarLink to="/profile" icon={<UserIcon size={18} />} label="Profile Manager" active={location.pathname === '/profile'} />
                      
                      {user.role === 'admin' && (
                        <SidebarLink to="/admin" icon={<Shield size={18} />} label="System Admin" active={location.pathname === '/admin'} />
                      )}
                    </nav>

                    {/* Logged in User widget */}
                    <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={profile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} alt="Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</p>
                      </div>
                      <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px', borderRadius: '8px' }}>
                        <LogOut size={16} color="#f87171" />
                      </button>
                    </div>
                  </aside>

                  {/* Main Work Area */}
                  <div style={{
                    flex: 1,
                    marginLeft: sidebarOpen ? '260px' : '0px',
                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0
                  }}>
                    {/* Top glassmorphic Navbar */}
                    <header className="glass-card" style={{
                      height: '70px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 24px',
                      borderRadius: '0px',
                      borderLeft: 'none', borderRight: 'none', borderTop: 'none',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      background: 'rgba(5, 5, 8, 0.6)',
                      position: 'sticky', top: 0, zIndex: 90
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
                          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
                          {location.pathname === '/dashboard' && 'Dashboard Overview'}
                          {location.pathname === '/resume-analyzer' && 'AI Resume Audit'}
                          {location.pathname === '/interview-assistant' && 'AI Interview Co-Pilot'}
                          {location.pathname === '/job-tracker' && 'Kanban Applications Pipeline'}
                          {location.pathname === '/roadmaps' && 'Developer Roadmap Milestones'}
                          {location.pathname === '/chat' && 'Real-time Developer Lounge'}
                          {location.pathname === '/portfolio-builder' && 'Dynamic Portfolio Builder'}
                          {location.pathname === '/github-analytics' && 'Github Insights Dashboard'}
                          {location.pathname === '/profile' && 'Profile Settings'}
                          {location.pathname === '/admin' && 'SaaS Administration Control Panel'}
                        </h2>
                      </div>

                      {/* Right Hand Notification & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Notification Bell */}
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                          <Bell size={20} color="var(--text-subtitle)" />
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span style={{
                              position: 'absolute', top: '-4px', right: '-4px',
                              background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 'bold',
                              borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {notifications.filter(n => !n.read).length}
                            </span>
                          )}
                        </div>
                        <span style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', height: '20px' }}></span>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          June 25, 2026
                        </div>
                      </div>
                    </header>

                    {/* Content Section Container */}
                    <main style={{ padding: '30px', flex: 1 }}>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                        <Route path="/interview-assistant" element={<InterviewAssistant />} />
                        <Route path="/job-tracker" element={<JobTracker />} />
                        <Route path="/roadmaps" element={<Roadmaps />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
                        <Route path="/github-analytics" element={<GithubAnalytics />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/admin" element={user.role === 'admin' ? <Admin /> : <Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              ) : (
                <Navigate to="/auth" />
              )
            } />
          </Routes>
        </SocketContext.Provider>
      </NotificationContext.Provider>
    </AuthContext.Provider>
  );
}

// Sidebar Link Component helper
function SidebarLink({ to, icon, label, active }) {
  return (
    <Link to={to} style={{
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '10px',
      color: active ? '#fff' : 'var(--text-muted)',
      background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
      border: active ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid transparent',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      fontFamily: 'var(--font-display)'
    }}>
      <span style={{ color: active ? 'var(--accent-primary)' : 'inherit' }}>{icon}</span>
      {label}
    </Link>
  );
}
