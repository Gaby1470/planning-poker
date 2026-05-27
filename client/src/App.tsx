import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import './App.css';
import { Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';

const HomePage = () => {
  const [createId, setCreateId] = useState('');
  const [joinId, setJoinId] = useState('');
  const navigate = useNavigate();

  const createSession = () => {
    if (createId.trim()) {
      socket.emit('create_session', createId.trim());
    }
  };

  useEffect(() => {
    socket.on('session_created', (newSessionId) => {
      navigate(`/${newSessionId}`, { state: { isAdmin: true } });
    });

    socket.on('session_exists', () => {
      alert('Session with this name already exists. Please choose another name.');
    });

    return () => {
      socket.off('session_created');
      socket.off('session_exists');
    };
  }, [navigate]);

  return (
    <div className="container hero-layout">
      <div className="brand-header">
        <h1>🃏 Planning Poker</h1>
        <p>Streamline your agile estimations elegantly and in real-time.</p>
      </div>
      
      <div className="auth-split">
        <div className="auth-card">
          <h2>Create Session</h2>
          <input
            type="text"
            placeholder="e.g., iOS Sync"
            value={createId}
            onChange={(e) => setCreateId(e.target.value)}
          />
          <button className="btn-primary" onClick={createSession} disabled={!createId.trim()}>
            Create & Start
          </button>
        </div>

        <div className="divider-vertical">or</div>

        <div className="auth-card">
          <h2>Join Session</h2>
          <input
            type="text"
            placeholder="Enter Session ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
          />
          <button className="btn-secondary" onClick={() => navigate(`/${joinId.trim()}`)} disabled={!joinId.trim()}>
            Join Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

const SessionPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [reveal, setReveal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(location.state?.isAdmin || false);
  const [joined, setJoined] = useState(location.state?.isAdmin || false);
  const [currentVote, setCurrentVote] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      socket.emit('join_session', sessionId);
    }

    socket.on('session_joined', (joinedSessionId, userList, adminId) => {
      setUsers(userList);
      if (adminId === socket.id) {
        setIsAdmin(true);
      }
    });

    socket.on('update_users', (userList) => {
      setUsers(userList);
    });

    socket.on('cards_revealed', (userList, avg) => {
      setReveal(true);
      setUsers(userList);
    });

    socket.on('vote_restarted', (userList) => {
      setReveal(false);
      setCurrentVote(null);
      setUsers(userList);
    });

    socket.on('session_not_found', () => {
      alert('Session not found');
    });

    return () => {
      socket.off('session_joined');
      socket.off('update_users');
      socket.off('cards_revealed');
      socket.off('vote_restarted');
      socket.off('session_not_found');
    };
  }, [sessionId, isAdmin]);

  const joinSession = () => {
    if (sessionId && userName.trim()) {
      socket.emit('join_session', sessionId, userName.trim());
      setJoined(true);
    }
  };

  const vote = (value: number) => {
    if (sessionId) {
      setCurrentVote(value);
      socket.emit('vote', sessionId, value);
    }
  };

  const revealCards = () => {
    if (sessionId) socket.emit('reveal_cards', sessionId);
  };

  const restartVote = () => {
    if (sessionId) socket.emit('restart_vote', sessionId);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const leaveSession = () => {
    socket.emit('leave_session', sessionId);
    navigate('/');
  };

  const calculateMode = (userList: any[]) => {
    const votes = userList
      .filter(user => user && user.vote !== undefined && user.vote !== null)
      .map(user => user.vote);

    if (votes.length === 0) return null;

    const frequencyMap: { [key: number]: number } = {};
    let maxCount = 0;

    votes.forEach(vote => {
      frequencyMap[vote] = (frequencyMap[vote] || 0) + 1;
      if (frequencyMap[vote] > maxCount) {
        maxCount = frequencyMap[vote];
      }
    });

    const modes = Object.keys(frequencyMap)
      .map(Number)
      .filter(vote => frequencyMap[vote] === maxCount);

    return {
      modes,
      count: maxCount
    };
  };

  if (!joined) {
    return (
      <div className="container narrow-card">
        <button className="btn-back-home" onClick={() => navigate('/')}>
          🏠 Back to Home
        </button>
        <h1>Lobby Invitation</h1>
        <p className="subtitle">You're joining: <strong>{sessionId}</strong></p>
        <div className="form-group">
          <input
            type="text"
            placeholder="What should we call you?"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button className="btn-primary full-width" onClick={joinSession} disabled={!userName.trim()}>
            Enter Session
          </button>
        </div>
      </div>
    );
  }

  const validUsers = users.filter((user) => user && user.name);

  return (
    <div className="container session-layout">
      {/* Absolute Header Layout Layer */}
      <button className="nav-exit-button" onClick={leaveSession} title="Exit session and make a new room">
        🚪 Exit Room
      </button>

      <header className="session-header">
        <div>
          <h1>Room: {sessionId}</h1>
          {isAdmin && <span className="badge-admin">Host Admin</span>}
        </div>
        <div className="share-box">
          <input type="text" readOnly value={window.location.href} />
          <button onClick={copyToClipboard} className={copied ? "btn-success" : ""}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </header>

      <main className="session-workspace">
        {validUsers.length === 0 ? (
          <div className="empty-state">
            <h2>⏳ Waiting for your squad...</h2>
            <p>Send the invite link to your product managers, developers, and testers.</p>
          </div>
        ) : (
          <div className="users-grid">
            {validUsers.map((user) => (
              <div key={user.id} className={`user-card-wrapper ${user.vote ? 'has-voted' : ''}`}>
                <div className={`poker-card ${reveal ? 'revealed' : ''}`}>
                  <div className="card-face card-front">
                    <span className="card-status">{user.vote ? '👍' : '⏳'}</span>
                  </div>
                  <div className="card-face card-back">
                    {user.vote ?? '-'}
                  </div>
                </div>
                <p className="user-name">{user.name}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {reveal && calculateMode(validUsers) && (
        <section className="results-banner">
          {(() => {
            const result = calculateMode(validUsers);
            if (!result) return null;
            
            const isTie = result.modes.length > 1;
            return (
              <>
                <h3>{isTie ? "Split Consensus (Tie)" : "Team Consensus (Mode)"}</h3>
                <div className="metric">
                  {result.modes.join(' & ')}
                </div>
                <p className="subtitle-metric">
                  {result.count} {result.count === 1 ? 'person' : 'people'} voted for this estimate
                </p>
              </>
            );
          })()}
        </section>
      )}

      <footer className="action-tray">
        <div className="voting-section">
          <h4>Cast Your Estimate</h4>
          <div className="deck">
            {[0.5, 1, 2, 3, 5, 8, 13].map((value) => (
              <button 
                key={value} 
                className={`deck-card ${currentVote === value ? 'selected' : ''}`}
                onClick={() => vote(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="admin-tray">
            <button className="btn-success" onClick={revealCards}>👁 Reveal Estimates</button>
            <button className="btn-danger" onClick={restartVote}>🔄 Clear & Next Round</button>
          </div>
        )}
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:sessionId" element={<SessionPage />} />
    </Routes>
  );
};

export default App;