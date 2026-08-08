import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { Mail, Lock, User, Key, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function Auth() {
  const { handleLogin, showToast } = useContext(AuthContext);
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  
  // Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password strength checker helper
  const checkPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: '#e5e7eb' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score, label: 'Weak', color: '#f87171' };
      case 3:
      case 4:
        return { score, label: 'Moderate', color: '#fbbf24' };
      case 5:
        return { score, label: 'Strong', color: '#34d399' };
      default:
        return { score: 0, label: 'None', color: '#e5e7eb' };
    }
  };

  const strength = checkPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
          handleLogin(data);
        } else {
          showToast('Login Failed', data.message || 'Incorrect credentials', 'warning');
        }
      } else if (mode === 'register') {
        if (password.length < 6) {
          showToast('Validation Error', 'Password must be at least 6 characters long', 'warning');
          setLoading(false);
          return;
        }
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
          handleLogin(data);
        } else {
          showToast('Registration Failed', data.message || 'Error occurred', 'warning');
        }
      } else if (mode === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Reset Requested', data.message, 'success');
          // Automatically navigate user to reset mode for demo convenience
          setResetToken(data.resetToken);
          setMode('reset');
        } else {
          showToast('Request Failed', data.message || 'Email not found', 'warning');
        }
      } else if (mode === 'reset') {
        if (password !== confirmPassword) {
          showToast('Validation Error', 'Passwords do not match', 'warning');
          setLoading(false);
          return;
        }
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, password })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Reset Successful', 'Password updated, please log in.', 'success');
          setMode('login');
          setPassword('');
        } else {
          showToast('Reset Failed', data.message || 'Token invalid or expired', 'warning');
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Server connection failure', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh', width: '100vw', 
      justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div className="glass-card glow-card animate-slide-up" style={{
        width: '100%', maxWidth: '450px', padding: '40px', 
        background: 'rgba(10, 10, 20, 0.75)', border: '1px solid rgba(255,255,255,0.08)'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '45px', height: '45px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 'bold', fontSize: '24px', margin: '0 auto 16px'
          }}>D</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>
            DevSphere <span style={{ color: '#a855f7' }}>AI</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            {mode === 'login' && 'Sign in to access your AI developer console'}
            {mode === 'register' && 'Create your account and unlock ATS resume parsing'}
            {mode === 'forgot' && 'Provide your email address to recover your account'}
            {mode === 'reset' && 'Create a new secure credentials password'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* USERNAME (Register Only) */}
          {mode === 'register' && (
            <div>
              <label className="glass-label">Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="text" required className="glass-input" placeholder="john_doe" value={username}
                  onChange={(e) => setUsername(e.target.value)} style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
          )}

          {/* EMAIL (Excludes Reset) */}
          {mode !== 'reset' && (
            <div>
              <label className="glass-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="email" required className="glass-input" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
          )}

          {/* TOKEN (Reset Only) */}
          {mode === 'reset' && (
            <div>
              <label className="glass-label">Verification Token</label>
              <div style={{ position: 'relative' }}>
                <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="text" required className="glass-input" placeholder="Paste reset verification token" value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)} style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
          )}

          {/* PASSWORD (Excludes Forgot) */}
          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="glass-label" style={{ marginBottom: 0 }}>Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} style={{
                    background: 'none', border: 'none', color: '#6366f1', fontSize: '12px', cursor: 'pointer', fontWeight: '600'
                  }}>Forgot Password?</button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type={showPassword ? 'text' : 'password'} required className="glass-input" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: '42px', paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: '14px', top: '14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {mode === 'register' && password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Password Strength:</span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: strength.color }}>{strength.label}</span>
                  </div>
                  <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${(strength.score / 5) * 100}%`, 
                      backgroundColor: strength.color, transition: 'all 0.3s ease'
                    }}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONFIRM PASSWORD (Reset Only) */}
          {mode === 'reset' && (
            <div>
              <label className="glass-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="password" required className="glass-input" placeholder="••••••••" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>
          )}

          {/* REMEMBER ME (Login Only) */}
          {mode === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'var(--accent-primary)', width: '16px', height: '16px', borderRadius: '4px', cursor: 'pointer'
                }}
              />
              <label htmlFor="remember" style={{ fontSize: '13px', color: 'var(--text-subtitle)', cursor: 'pointer' }}>Remember me</label>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            {loading ? (
              <div className="skeleton" style={{ width: '100px', height: '16px' }}></div>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot' && 'Send recovery link'}
                {mode === 'reset' && 'Save credentials'}
              </>
            )}
          </button>
        </form>

        {/* Footer toggles */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }}>
          {mode === 'login' ? (
            <p style={{ color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} style={{
                background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: '700'
              }}>Sign Up</button>
            </p>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <button onClick={() => setMode('login')} style={{
                background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: '700'
              }}>Sign In</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
