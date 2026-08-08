import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { Search, Github, GitFork, Star, Users, BookOpen, AlertCircle, BarChart2 } from 'lucide-react';

export default function GithubAnalytics() {
  const { profile, showToast } = useContext(AuthContext);
  const [username, setUsername] = useState('octocat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stats State
  const [userData, setUserData] = useState(null);
  const [repoData, setRepoData] = useState([]);
  const [languages, setLanguages] = useState({});

  useEffect(() => {
    if (profile?.githubUsername) {
      setUsername(profile.githubUsername);
      fetchGithubData(profile.githubUsername);
    } else {
      fetchGithubData('octocat');
    }
  }, [profile]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (username.trim()) {
      fetchGithubData(username.trim());
    }
  };

  const fetchGithubData = async (userStr) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch user general details
      const userRes = await fetch(`https://api.github.com/users/${userStr}`);
      if (!userRes.ok) {
        if (userRes.status === 403 || userRes.status === 429) {
          // Fallback to beautiful mock data to satisfy rate limit restrictions
          generateMockData(userStr);
          showToast('API Rate Limited', 'Displaying simulated GitHub stats.', 'info');
          return;
        }
        throw new Error('User not found in GitHub directory.');
      }
      const uData = await userRes.json();
      setUserData(uData);

      // 2. Fetch user repositories
      const repoRes = await fetch(`https://api.github.com/users/${userStr}/repos?per_page=100&sort=updated`);
      if (repoRes.ok) {
        const rData = await repoRes.json();
        setRepoData(rData);

        // Aggregate languages
        const langMap = {};
        rData.forEach(repo => {
          if (repo.language) {
            langMap[repo.language] = (langMap[repo.language] || 0) + 1;
          }
        });
        setLanguages(langMap);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error pulling GitHub data');
      generateMockData(userStr); // Fallback mock
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (userStr) => {
    setUserData({
      login: userStr,
      avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${userStr}`,
      name: userStr.charAt(0).toUpperCase() + userStr.slice(1) + ' (Simulated)',
      public_repos: 34,
      followers: 125,
      following: 89,
      bio: 'Enterprise developer building next-gen systems.'
    });

    setRepoData([
      { name: 'neural-networks-model', stargazers_count: 12, forks_count: 4, language: 'Python' },
      { name: 'react-glassmorphic-dashboard', stargazers_count: 38, forks_count: 9, language: 'JavaScript' },
      { name: 'rust-networking-kernel', stargazers_count: 55, forks_count: 14, language: 'Rust' },
      { name: 'devsphere-setup', stargazers_count: 5, forks_count: 1, language: 'TypeScript' }
    ]);

    setLanguages({
      'JavaScript': 12,
      'Python': 8,
      'Rust': 6,
      'TypeScript': 5,
      'HTML/CSS': 3
    });
  };

  const getTotalStars = () => {
    return repoData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
  };

  const getTotalForks = () => {
    return repoData.reduce((acc, repo) => acc + (repo.forks_count || 0), 0);
  };

  // Calculations for custom SVG Pie Chart
  const renderLanguagePieChart = () => {
    const totalCount = Object.values(languages).reduce((a, b) => a + b, 0);
    if (totalCount === 0) return null;

    let accumulatedPercentage = 0;
    const slices = [];
    const colorsList = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

    Object.entries(languages).forEach(([lang, val], index) => {
      const percentage = (val / totalCount) * 100;
      const col = colorsList[index % colorsList.length];
      
      // Calculate coordinates for SVG paths
      const x1 = Math.cos(2 * Math.PI * accumulatedPercentage);
      const y1 = Math.sin(2 * Math.PI * accumulatedPercentage);
      accumulatedPercentage += val / totalCount;
      const x2 = Math.cos(2 * Math.PI * accumulatedPercentage);
      const y2 = Math.sin(2 * Math.PI * accumulatedPercentage);
      
      const largeArc = percentage > 50 ? 1 : 0;
      
      // Scale from unit circle coordinates to SVG coords
      const sx1 = 50 + x1 * 40;
      const sy1 = 50 + y1 * 40;
      const sx2 = 50 + x2 * 40;
      const sy2 = 50 + y2 * 40;

      slices.push({
        d: `M 50 50 L ${sx1} ${sy1} A 40 40 0 ${largeArc} 1 ${sx2} ${sy2} Z`,
        fill: col,
        name: lang,
        value: Math.round(percentage)
      });
    });

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <svg width="150" height="150" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          {slices.map((slice, i) => (
            <path key={i} d={slice.d} fill={slice.fill} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />
          ))}
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: s.fill }} />
              <span style={{ fontWeight: '600' }}>{s.name} ({s.value}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search Input bar */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
            <input 
              type="text" className="glass-input" placeholder="Type GitHub username (e.g. torvalds)" value={username} 
              onChange={(e) => setUsername(e.target.value)} style={{ paddingLeft: '42px' }} 
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            Analyze Account
          </button>
        </form>
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 16px' }}></div>
          <h4 style={{ color: '#fff', fontWeight: '700' }}>Fetching public Git trees...</h4>
        </div>
      )}

      {userData && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main User Card */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <img src={userData.avatar_url} alt="avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{userData.name || userData.login}</h3>
                <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Github size={10} /> @{userData.login}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{userData.bio || 'No GitHub bio present.'}</p>
            </div>
            
            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Repositories</span>
                <p style={{ fontSize: '18px', fontWeight: '800' }}>{userData.public_repos}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Followers</span>
                <p style={{ fontSize: '18px', fontWeight: '800' }}>{userData.followers}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Following</span>
                <p style={{ fontSize: '18px', fontWeight: '800' }}>{userData.following}</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Languages slice chart */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart2 size={16} color="var(--accent-secondary)" /> Language Distribution
              </h3>
              {renderLanguagePieChart()}
            </div>

            {/* Git Metadata card */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} color="var(--accent-yellow)" /> Repository Insights
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-subtitle)', display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={14} color="var(--accent-yellow)" /> Cumulative Stars</span>
                  <span style={{ fontSize: '15px', fontWeight: '800' }}>{getTotalStars()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-subtitle)', display: 'flex', alignItems: 'center', gap: '8px' }}><GitFork size={14} color="var(--accent-primary)" /> Repository Forks</span>
                  <span style={{ fontSize: '15px', fontWeight: '800' }}>{getTotalForks()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-subtitle)', display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={14} color="var(--accent-green)" /> Top Lang</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-green)' }}>
                    {Object.keys(languages).length > 0 ? Object.keys(languages)[0] : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Top Repos list */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Indexed Repositories</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              {repoData.slice(0, 4).map((repo, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{repo.name}</h4>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {repo.language && <span className="badge badge-info" style={{ fontSize: '9px', padding: '2px 6px' }}>{repo.language}</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Star size={12} /> {repo.stargazers_count}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><GitFork size={12} /> {repo.forks_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
