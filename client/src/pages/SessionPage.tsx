import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../socket';
import toast from 'react-hot-toast';
import { useVotingSystem } from '../hooks/useVotingSystem';
import VotingSystemSelector from '../components/VotingSystemSelector';

const SessionPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [reveal, setReveal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(location.state?.isAdmin || false);
  const [joined, setJoined] = useState(location.state?.isAdmin || false);
  const [currentVote, setCurrentVote] = useState<number | string | null>(null);
  const [copied, setCopied] = useState(false);
  const [highlightedUsers, setHighlightedUsers] = useState<{ user1: string, user2: string } | null>(null);
  const { votingSystem, setVotingSystem, getVotingOptions } = useVotingSystem();

  useEffect(() => {
    if (isAdmin) {
      socket.emit('join_session', sessionId);
    }

    socket.on('session_joined', (_joinedSessionId, userList, adminId) => {
      setUsers(userList);
      if (adminId === socket.id) {
        setIsAdmin(true);
      }
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
    });

    return () => {
      socket.off('session_joined');
      socket.off('update_users');
      socket.off('cards_revealed');
      socket.off('vote_restarted');
      socket.off('session_not_found');
      socket.off('highlight_users');
    };
  }, [sessionId, isAdmin]);

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
      <div className="container mx-auto px-4 py-16 max-w-md">
        <button
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800"
          onClick={() => navigate('/')}
        >
          🏠 Back to Home
        </button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Lobby Invitation</h1>
        <p className="text-lg text-gray-600 mb-8">You're joining: <strong>{sessionId}</strong></p>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="What should we call you?"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            onClick={joinSession}
            disabled={!userName.trim()}
          >
            Enter Session
          </button>
        </div>
      </div>
    );
  }

  const validUsers = users.filter((user) => user && user.name);

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        onClick={leaveSession}
        title="Exit session and make a new room"
      >
        🚪 Exit Room
      </button>

      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Room: {sessionId}</h1>
          {isAdmin && <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-full">Host Admin</span>}
        </div>
        <div className="flex items-center">
          <input type="text" readOnly value={window.location.href} className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none" />
          <button onClick={copyToClipboard} className={`ml-2 px-4 py-2 font-semibold rounded-lg ${copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </header>

      <main className="mb-8">
        {validUsers.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold text-gray-800">⏳ Waiting for your squad...</h2>
            <p className="text-xl text-gray-600 mt-4">Send the invite link to your product managers, developers, and testers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {validUsers.map((user) => (
              <div key={user.id} className={`text-center p-2 rounded-lg transition-transform duration-300 ${highlightedUsers && (user.id === highlightedUsers.user1 || user.id === highlightedUsers.user2) ? 'transform scale-110 shadow-lg z-10' : ''}`}>
                <div className={`relative w-24 h-36 mx-auto rounded-lg shadow-md transition-transform transform ${reveal ? 'rotate-y-180' : ''}`}>
                  <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{user.vote ? '👍' : '⏳'}</span>
                  </div>
                  <div className="absolute inset-0 bg-blue-500 rounded-lg flex items-center justify-center text-white text-3xl font-bold backface-hidden rotate-y-180">
                    {user.vote ?? '-'}
                  </div>
                </div>
                <p className="mt-4 text-lg font-semibold text-gray-800">{user.name}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {reveal && calculateMode(validUsers) && (
        <section className="bg-gray-100 rounded-lg p-6 mb-8">
          {(() => {
            const result = calculateMode(validUsers);
            if (!result) return null;

            const isTie = result.modes.length > 1;
            return (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800">{isTie ? "Split Consensus (Tie)" : "Team Consensus (Mode)"}</h3>
                <div className="text-5xl font-bold text-blue-500 my-4">
                  {result.modes.join(' & ')}
                </div>
                <p className="text-lg text-gray-600">
                  {result.count} {result.count === 1 ? 'person' : 'people'} voted for this estimate
                </p>
              </div>
            );
          })()}
        </section>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h4 className="text-lg font-semibold text-gray-800">Cast Your Estimate</h4>
            <div className="flex space-x-2">
              {getVotingOptions().map((value) => (
                <button
                  key={value}
                  className={`w-12 h-16 rounded-lg font-semibold transition-colors ${currentVote === value ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  onClick={() => vote(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center space-x-4">
              <VotingSystemSelector selected={votingSystem} onChange={setVotingSystem} />
              <button className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600" onClick={revealCards}>Reveal Estimates</button>
              <button className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600" onClick={restartVote}>Clear & Next Round</button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default SessionPage;
