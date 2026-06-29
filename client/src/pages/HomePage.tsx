import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import toast from 'react-hot-toast';
import VotingSystemSelector from '../components/VotingSystemSelector';
import { useVotingSystem } from '../hooks/useVotingSystem';
import './HomePage.css';

const HomePage = () => {
  const [createId, setCreateId] = useState('');
  const [joinId, setJoinId] = useState('');
  const navigate = useNavigate();
  const { votingSystem, setVotingSystem } = useVotingSystem();

  const createSession = () => {
    if (createId.trim()) {
      socket.emit('create_session', { 
        sessionId: createId.trim(),
        votingSystem: votingSystem 
      });
    }
  };

  useEffect(() => {
    socket.on('session_created', (newSessionId) => {
      navigate(`/${newSessionId}`, { state: { isAdmin: true } });
    });

    socket.on('session_exists', () => {
      toast.error('Session with this name already exists. Please choose another name.');
    });

    return () => {
      socket.off('session_created');
      socket.off('session_exists');
    };
  }, [navigate]);

  return (
    <div className="pro-wrapper">
      <div className="pro-logo-wrap">
        <span className="pro-logo">🃏</span>
      </div>

      <div className="pro-header">
        <h1>Planning Poker</h1>
        <p>Streamline your agile estimations elegantly and in real-time.</p>
      </div>

      <div className="pro-card">
        <div className="pro-grid">
          
          {/* Create Section */}
          <div className="pro-section">
            <div className="pro-section-content">
              <h2>Create a New Session</h2>
              <div className="pro-input-group">
                <label>Session Name</label>
                <input
                  type="text"
                  placeholder="e.g., Sprint Planning Q3"
                  value={createId}
                  onChange={(e) => setCreateId(e.target.value)}
                />
              </div>
              <div className="pro-input-group">
                <label>Voting System</label>
                <div className="pro-voting-wrapper">
                  <VotingSystemSelector selected={votingSystem} onChange={setVotingSystem} />
                </div>
              </div>
            </div>
            <button 
              className="pro-btn pro-btn-primary" 
              onClick={createSession} 
              disabled={!createId.trim()}
            >
              Create & Start
            </button>
          </div>

          {/* Divider */}
          <div className="pro-divider">
            <span className="pro-badge">OR</span>
          </div>

          {/* Join Section */}
          <div className="pro-section">
            <div className="pro-section-content">
              <h2>Join an Existing Session</h2>
              <div className="pro-input-group">
                <label>Session ID</label>
                <input
                  type="text"
                  placeholder="Enter the session ID provided to you"
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                />
              </div>
            </div>
            <button 
              className="pro-btn pro-btn-secondary" 
              onClick={() => navigate(`/${joinId.trim()}`)} 
              disabled={!joinId.trim()}
            >
              Join Lobby
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;