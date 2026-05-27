import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import toast from 'react-hot-toast';

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
      toast.error('Session with this name already exists. Please choose another name.');
    });

    return () => {
      socket.off('session_created');
      socket.off('session_exists');
    };
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800">🃏 Planning Poker</h1>
        <p className="text-xl text-gray-600 mt-4">Streamline your agile estimations elegantly and in real-time.</p>
      </div>

      <div className="flex justify-center items-center mt-16">
        <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Session</h2>
          <input
            type="text"
            placeholder="e.g., iOS Sync"
            value={createId}
            onChange={(e) => setCreateId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="w-full mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            onClick={createSession}
            disabled={!createId.trim()}
          >
            Create & Start
          </button>
        </div>

        <div className="mx-8 text-gray-500 font-semibold">or</div>

        <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Join Session</h2>
          <input
            type="text"
            placeholder="Enter Session ID"
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-400"
            onClick={() => navigate(`/${joinId.trim()}`)}
            disabled={!joinId.trim()}
          >
            Join Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
