import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../App';
import { MessageSquare, HelpCircle, RefreshCw, Send, ShieldAlert, Award, Star, Compass } from 'lucide-react';

export default function InterviewAssistant() {
  const { showToast, refreshProfileState, profile } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Input & Evaluation response states
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState(null);

  // History stats
  const [sessionHistory, setSessionHistory] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;
    let filtered = [...questions];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty === selectedDifficulty);
    }
    if (selectedType !== 'All') {
      filtered = filtered.filter(q => q.type === selectedType);
    }

    setFilteredQuestions(filtered);
    if (filtered.length > 0) {
      setCurrentQuestion(filtered[0]);
    } else {
      setCurrentQuestion(null);
    }
    setResult(null);
    setAnswer('');
  }, [selectedCategory, selectedDifficulty, selectedType, questions]);

  const fetchQuestions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/interviews/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
        setFilteredQuestions(data);
        if (data.length > 0) {
          setCurrentQuestion(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim() || !currentQuestion) return;

    setEvaluating(true);
    setResult(null);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/interviews/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questionId: currentQuestion._id, answer })
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setSessionHistory(prev => [
          {
            question: currentQuestion.question,
            score: data.score,
            timestamp: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
        showToast('Evaluation Complete', `Received a score of ${data.score}%`, 'success');
        refreshProfileState();
      } else {
        showToast('Evaluation Error', 'Failed to retrieve assessment data', 'warning');
      }
    } catch (err) {
      showToast('Error', 'Server processing failure', 'warning');
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    const currentIndex = filteredQuestions.indexOf(currentQuestion);
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentQuestion(filteredQuestions[currentIndex + 1]);
    } else {
      setCurrentQuestion(filteredQuestions[0]);
    }
    setAnswer('');
    setResult(null);
  };

  const categories = ['All', ...new Set(questions.map(q => q.category))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const types = ['All', 'HR', 'Technical', 'Coding'];

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px' }}>
      
      {/* Simulation console */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Filters bar */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div>
            <label className="glass-label">Domain Category</label>
            <select 
              value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} 
              className="glass-input" style={{ width: '150px', padding: '8px 12px' }}
            >
              {categories.map((c, i) => <option key={i} value={c} style={{ background: '#0c0c19' }}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="glass-label">Level Difficulty</label>
            <select 
              value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} 
              className="glass-input" style={{ width: '130px', padding: '8px 12px' }}
            >
              {difficulties.map((d, i) => <option key={i} value={d} style={{ background: '#0c0c19' }}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="glass-label">Question Type</label>
            <select 
              value={selectedType} onChange={(e) => setSelectedType(e.target.value)} 
              className="glass-input" style={{ width: '130px', padding: '8px 12px' }}
            >
              {types.map((t, i) => <option key={i} value={t} style={{ background: '#0c0c19' }}>{t}</option>)}
            </select>
          </div>

          <button onClick={fetchQuestions} className="btn-secondary" style={{ padding: '8px 16px', marginTop: '18px', marginLeft: 'auto' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Question Panel */}
        {currentQuestion ? (
          <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Badges metadata */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className="badge badge-info">{currentQuestion.type}</span>
              <span className={`badge ${
                currentQuestion.difficulty === 'Easy' ? 'badge-success' : currentQuestion.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'
              }`}>{currentQuestion.difficulty}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Category: {currentQuestion.category}</span>
            </div>

            {/* Question Text */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', lineHeight: 1.5 }}>{currentQuestion.question}</h3>
              {currentQuestion.hint && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                  💡 Hint: {currentQuestion.hint}
                </p>
              )}
            </div>

            {/* Answer Input */}
            <form onSubmit={submitAnswer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="glass-label">Your Response</label>
              <textarea
                value={answer} onChange={(e) => setAnswer(e.target.value)} required rows={5}
                className="glass-input" placeholder="Type your detailed explanation or sample code snippet here..."
                style={{ resize: 'vertical', minHeight: '120px' }}
                disabled={evaluating || result !== null}
              />
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                {result !== null && (
                  <button type="button" onClick={nextQuestion} className="btn-secondary">
                    Next Question
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={evaluating || !answer.trim() || result !== null} 
                  className="btn-primary" 
                  style={{ minWidth: '150px' }}
                >
                  {evaluating ? 'Analyzing...' : <><Send size={14} /> Submit Answer</>}
                </button>
              </div>
            </form>

            {/* Evaluation Results Drawer */}
            {result && (
              <div className="glass-card animate-slide-up" style={{
                padding: '24px',
                borderLeft: `4px solid ${result.score >= 70 ? 'var(--accent-green)' : result.score >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'}`,
                background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={18} color="var(--accent-secondary)" /> Assessment Report
                  </h4>
                  <span className={`badge ${result.score >= 70 ? 'badge-success' : result.score >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                    Score: {result.score}%
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-subtitle)', lineHeight: 1.6 }}>{result.feedback}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '14px' }}>
                  <h5 style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '6px' }}>Ideal Answer Rubric:</h5>
                  <p style={{ fontSize: '13px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', color: 'var(--text-main)', border: '1px solid rgba(255,255,255,0.04)', fontFamily: currentQuestion.type === 'Coding' ? 'monospace' : 'inherit', whiteSpace: 'pre-wrap' }}>
                    {result.sampleAnswer}
                  </p>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No questions matched your selected filters. Try broadening your criteria.
          </div>
        )}

      </div>

      {/* History sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Readiness Index */}
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
          <Compass size={24} color="var(--accent-primary)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Readiness Index</h4>
          <h2 style={{ fontSize: '28px', fontWeight: '800', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
            {profile?.stats?.interviewReadiness > 0 ? `${profile.stats.interviewReadiness}%` : 'N/A'}
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>Average score from completed questions.</p>
        </div>

        {/* History Log */}
        <div className="glass-card" style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Recent Attempts</h3>
          {sessionHistory.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Your submissions during this session will display here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '350px' }}>
              {sessionHistory.map((item, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.question}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.timestamp}</span>
                    <span className={`badge ${item.score >= 70 ? 'badge-success' : item.score >= 50 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                      {item.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
