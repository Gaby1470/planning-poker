const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const crypto = require('crypto');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const sessions = {};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('create_session', ({ sessionName, votingSystem }) => {
    const sessionId = crypto.randomBytes(6).toString('hex');
    sessions[sessionId] = {
      admin: socket.id,
      users: [],
      reveal: false,
      votingSystem: votingSystem,
      sessionName: sessionName,
    };
    socket.join(sessionId);
    socket.emit('session_created', sessionId);
  });

  socket.on('join_session', (sessionId, userName) => {
    if (sessions[sessionId]) {
      if (userName) {
        const newUser = { id: socket.id, name: userName, vote: null };
        sessions[sessionId].users.push(newUser);
        io.to(sessionId).emit('update_users', sessions[sessionId].users);
      }
      socket.join(sessionId);
      socket.emit('session_joined', sessionId, sessions[sessionId].users, sessions[sessionId].admin, sessions[sessionId].votingSystem, sessions[sessionId].sessionName);
    } else {
      socket.emit('session_not_found');
    }
  });

  socket.on('get_session_details', (sessionId) => {
    if (sessions[sessionId]) {
      socket.emit('session_details', { sessionName: sessions[sessionId].sessionName });
    } else {
      socket.emit('session_not_found');
    }
  });

  socket.on('vote', (sessionId, vote) => {
    if (sessions[sessionId]) {
      const user = sessions[sessionId].users.find((u) => u.id === socket.id);
      if (user) {
        user.vote = vote;
        io.to(sessionId).emit('update_users', sessions[sessionId].users);
      }
    }
  });

  socket.on('reveal_cards', (sessionId) => {
    if (sessions[sessionId]) {
      sessions[sessionId].reveal = true;
      const votes = sessions[sessionId].users.map((u) => u.vote).filter((v) => v !== null);
      const avg = votes.length > 0 ? votes.reduce((acc, v) => acc + v, 0) / votes.length : 0;
      io.to(sessionId).emit('cards_revealed', sessions[sessionId].users, avg);

      const numericVotes = votes.map(v => Number(v)).filter(v => !isNaN(v) && v > 0);
      if (numericVotes.length > 1) {
        const minVote = Math.min(...numericVotes);
        const maxVote = Math.max(...numericVotes);

        if (maxVote >= minVote * 3) {
          const minVoters = sessions[sessionId].users.filter(u => Number(u.vote) === minVote);
          const maxVoters = sessions[sessionId].users.filter(u => Number(u.vote) === maxVote);

          const randomMinVoter = minVoters[Math.floor(Math.random() * minVoters.length)];
          const randomMaxVoter = maxVoters[Math.floor(Math.random() * maxVoters.length)];

          if (randomMinVoter && randomMaxVoter) {
            io.to(sessionId).emit('highlight_users', { user1: randomMinVoter.id, user2: randomMaxVoter.id });
          }
        }
      }
    }
  });

  socket.on('restart_vote', (sessionId) => {
    if (sessions[sessionId]) {
      sessions[sessionId].reveal = false;
      sessions[sessionId].users.forEach((u) => (u.vote = null));
      io.to(sessionId).emit('vote_restarted', sessions[sessionId].users);
    }
  });

  socket.on('set_voting_system', ({ sessionId, votingSystem }) => {
    if (sessions[sessionId]) {
      sessions[sessionId].votingSystem = votingSystem;
      io.to(sessionId).emit('voting_system_changed', votingSystem);
    }
  });

  socket.on('leave_session', (sessionId) => {
    if (sessions[sessionId]) {
      const index = sessions[sessionId].users.findIndex((u) => u.id === socket.id);
      if (index !== -1) {
        sessions[sessionId].users.splice(index, 1);
        io.to(sessionId).emit('update_users', sessions[sessionId].users);
        if (sessions[sessionId].users.length === 0) {
          delete sessions[sessionId];
          console.log(`Session ${sessionId} deleted because last user left.`);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
    for (const sessionId in sessions) {
      const index = sessions[sessionId].users.findIndex((u) => u.id === socket.id);
      if (index !== -1) {
        sessions[sessionId].users.splice(index, 1);
        io.to(sessionId).emit('update_users', sessions[sessionId].users);
        if (sessions[sessionId].users.length === 0) {
          delete sessions[sessionId];
        }
        break;
      }
    }
  });
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
