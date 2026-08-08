import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext, SocketContext } from '../App';
import { Send, Users, MessageCircle, Hash, Shield } from 'lucide-react';

export default function Chat() {
  const { user, profile } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsersList, setOnlineUsersList] = useState([]);
  
  // Recipient target (null = Global Chat)
  const [activeChannel, setActiveChannel] = useState({ id: 'global', name: 'global-chat', type: 'channel' });
  const [typingUser, setTypingUser] = useState(null);
  const typingTimeoutRef = useRef(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  useEffect(() => {
    // Fetch initial chat logs from REST API
    fetch('/api/chat/history')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('receive_message', (msg) => {
      // For channel chat:
      setMessages(prev => [...prev, msg]);
    });

    // Listen for typing events
    socket.on('typing_status', ({ username, isTyping }) => {
      if (isTyping) {
        setTypingUser(username);
      } else {
        setTypingUser(null);
      }
    });

    // Listen for online users
    socket.on('online_users', (users) => {
      setOnlineUsersList(users);
    });

    // Request active user listing
    socket.emit('register_user', { userId: user._id, username: user.username });

    return () => {
      socket.off('receive_message');
      socket.off('typing_status');
      socket.off('online_users');
    };
  }, [socket, user]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket) return;

    // Trigger typing indicator
    socket.emit('typing', { username: user.username, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { username: user.username, isTyping: false });
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    // Send payload to socket
    socket.emit('send_message', {
      senderId: user._id,
      content: inputText
    });

    // Reset local field & clear typing state
    setInputText('');
    socket.emit('typing', { username: user.username, isTyping: false });
  };

  return (
    <div className="glass-card animate-fade-in" style={{
      display: 'grid', gridTemplateColumns: '240px 1fr', height: 'calc(100vh - 170px)', overflow: 'hidden'
    }}>
      
      {/* Sidebar Channel / Users */}
      <div style={{
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(5, 5, 8, 0.4)',
        display: 'flex', flexDirection: 'column', height: '100%'
      }}>
        {/* Section: Channels */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Channels
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button 
              onClick={() => setActiveChannel({ id: 'global', name: 'global-chat', type: 'channel' })}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', width: '100%',
                background: activeChannel.id === 'global' ? 'rgba(99,102,241,0.15)' : 'none',
                border: activeChannel.id === 'global' ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                borderRadius: '8px', color: activeChannel.id === 'global' ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', textAlign: 'left', fontWeight: '600', fontSize: '13px'
              }}
            >
              <Hash size={14} color="var(--accent-primary)" /> global-lounge
            </button>
          </div>
        </div>

        {/* Section: Active Users */}
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={12} /> Active Developers ({onlineUsersList.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {onlineUsersList.map((onlineUser, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${onlineUser.username}`} 
                    alt="avatar" 
                    style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} 
                  />
                  <span style={{
                    position: 'absolute', bottom: '-2px', right: '-2px',
                    width: '8px', height: '8px', background: 'var(--accent-green)',
                    borderRadius: '50%', border: '1.5px solid var(--bg-primary)'
                  }}></span>
                </div>
                <span style={{ fontWeight: '500', color: '#fff' }}>{onlineUser.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Pane */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Chat Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10, 10, 18, 0.2)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <Hash size={18} color="var(--accent-primary)" />
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800' }}>#{activeChannel.name}</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Discussing career roadmaps, programming paradigms and general SaaS queries.</p>
          </div>
        </div>

        {/* Message Log */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'rgba(0,0,0,0.1)'
        }}>
          {messages.map((msg, idx) => {
            const isMe = msg.sender?._id === user._id || msg.sender === user._id;
            return (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  gap: '10px',
                  alignItems: 'flex-start'
                }}
              >
                {!isMe && (
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender?.username || 'user'}`} 
                    alt="avatar" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', marginTop: '4px' }} 
                  />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: isMe ? 'var(--accent-secondary)' : '#fff' }}>
                      {isMe ? 'You' : msg.sender?.username}
                    </span>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="glass-card" style={{
                    padding: '10px 16px',
                    borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    background: isMe ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                    borderColor: isMe ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.06)'
                  }}>
                    <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#fff', wordBreak: 'break-word' }}>{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing status display */}
          {typingUser && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', alignSelf: 'flex-start', marginLeft: '42px' }}>
              <span className="skeleton" style={{ width: '30px', height: '10px', borderRadius: '4px' }}></span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>{typingUser} is typing...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Message Input box */}
        <form onSubmit={handleSendMessage} style={{
          padding: '20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(5, 5, 8, 0.5)',
          display: 'flex', gap: '12px'
        }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Type your message here..."
            value={inputText}
            onChange={handleInputChange}
          />
          <button type="submit" className="btn-primary" style={{ padding: '12px 20px' }}>
            <Send size={14} /> Send
          </button>
        </form>

      </div>

    </div>
  );
}
