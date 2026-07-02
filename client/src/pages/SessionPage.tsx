import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../socket';
import toast from 'react-hot-toast';
import { useVotingSystem } from '../hooks/useVotingSystem';

const SessionPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [isLoadingName, setIsLoadingName] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [reveal, setReveal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(location.state?.isAdmin || false);
  const [joined, setJoined] = useState(location.state?.isAdmin || false);
  const [currentVote, setCurrentVote] = useState<number | string | null>(null);
  const [copied, setCopied] = useState(false);
  const [highlightedUsers, setHighlightedUsers] = useState<{ user1: string, user2: string } | null>(null);
  const { setVotingSystem, getVotingOptions } = useVotingSystem();

  useEffect(() => {
    if (isAdmin) {
      socket.emit('join_session', sessionId, 'Admin');
    } else {
      socket.emit('get_session_details', sessionId);
    }
    
    socket.on('session_joined', (_joinedSessionId, userList, adminId, receivedVotingSystem, receivedSessionName) => {
      setUsers(userList);
      if (adminId === socket.id) {
        setIsAdmin(true);
      }
      if (receivedVotingSystem) {
        setVotingSystem(receivedVotingSystem);
      }
      if (receivedSessionName) {
        setSessionName(receivedSessionName);
      }
      setIsLoadingName(false);
    });

    socket.on('session_details', (details) => {
      if (details.sessionName) {
        setSessionName(details.sessionName);
      }
      setIsLoadingName(false);
    });

    socket.on('update_users', (userList) => {
      setUsers(userList);
    });

    socket.on('cards_revealed', (userList, _avg) => {
      setReveal(true);
      setUsers(userList);
    });

    socket.on('vote_restarted', (userList) => {
      setReveal(false);
      setCurrentVote(null);
      setUsers(userList);
      setHighlightedUsers(null);
    });

    socket.on('highlight_users', (users) => {
      setHighlightedUsers(users);
    });

    socket.on('session_not_found', () => {
      toast.error('Session not found');
      setIsLoadingName(false);
    });

    socket.on('voting_system_changed', (newVotingSystem) => {
        setVotingSystem(newVotingSystem);
    });

    return () => {
      socket.off('session_joined');
      socket.off('session_details');
      socket.off('update_users');
      socket.off('cards_revealed');
      socket.off('vote_restarted');
      socket.off('session_not_found');
      socket.off('highlight_users');
      socket.off('voting_system_changed');
    };
  }, [sessionId, isAdmin, setVotingSystem]);

  const joinSession = () => {
    if (sessionId && userName.trim()) {
      socket.emit('join_session', sessionId, userName.trim());
      setJoined(true);
    }
  };

  const vote = (value: number | string) => {
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
    toast.success('Copied to clipboard!');
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

    const frequencyMap: { [key: number | string]: number } = {};
    let maxCount = 0;

    votes.forEach(vote => {
      frequencyMap[vote] = (frequencyMap[vote] || 0) + 1;
      if (frequencyMap[vote] > maxCount) {
        maxCount = frequencyMap[vote];
      }
    });

    const modes = Object.keys(frequencyMap)
      .filter(vote => frequencyMap[vote] === maxCount);

    return {
      modes,
      count: maxCount
    };
  };

  if (!joined) {
    return (
        <div className="container narrow-card" style={{ textAlign: 'center', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👋 Welcome!</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                You've been invited to the planning session:
            </p>
            <p style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--primary)',
                background: 'rgba(9, 176, 44, 0.05)',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                display: 'inline-block',
                border: '1px solid rgba(9, 176, 44, 0.1)',
                marginBottom: '2.5rem'
            }}>
                {isLoadingName ? 'Loading Session...' : (sessionName || sessionId)}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder="Enter your name to join"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                />
                <button
                    className="btn-primary"
                    onClick={joinSession}
                    disabled={!userName.trim()}
                >
                    Join Session
                </button>
            </div>

            <button
                className="btn-back-home"
                onClick={() => navigate('/')}
            >
                Or create your own session
            </button>
        </div>
    );
}

  const validUsers = users.filter((user) => user && user.name && !user.isAdmin);

  return (
    <div className="container session-layout">
      <button className="nav-exit-button" onClick={leaveSession} title="Exit session and make a new room">
        🚪 Exit Room
      </button>

      <header className="session-header">
        <div>
          <h1>Room: {isLoadingName ? '...' : (sessionName || sessionId)}</h1>
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
              <div
                key={user.id}
                className={`user-card-wrapper ${user.vote ? 'has-voted' : ''} ${
                  highlightedUsers && (user.id === highlightedUsers.user1 || user.id === highlightedUsers.user2)
                    ? 'elevated'
                    : ''
                }`}
              >
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
          <h4 style={{textAlign: 'center', margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600}}>Cast Your Estimate</h4>
          <div className="deck">
            {getVotingOptions().map((value) => (
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
            <button className="btn-success" onClick={revealCards}>Reveal Estimates</button>
            <button className="btn-danger" onClick={restartVote}>Clear & Next Round</button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default SessionPage;
