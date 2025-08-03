const express = require('express');
const cors = require('cors');
const mongoose =require('mongoose');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import routes
const musicRoutes = require('./routes/music');
const authRoutes = require('./routes/auth');
const playlistRoutes = require('./routes/playlists');
const userRoutes = require('./routes/user');

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();

app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api', musicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/user', userRoutes);


// --- SOCKET.IO LOGIC ---
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('create_room', (username) => {
    const roomId = socket.id;
    socket.join(roomId);
    rooms[roomId] = {
      host: socket.id,
      users: [{ id: socket.id, username: username }]
    };
    socket.emit('room_created', roomId);
    console.log(`Room created with ID: ${roomId} by host ${username} (${socket.id})`);
  });

  socket.on('join_room', ({ roomId, username }) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      
      // --- THE FIX: Check if user is already in the list before adding ---
      const userExists = rooms[roomId].users.some(user => user.id === socket.id);
      if (!userExists) {
        rooms[roomId].users.push({ id: socket.id, username: username });
      }
      
      io.to(roomId).emit('user_joined', { username, users: rooms[roomId].users });
      
      const hostSocket = io.sockets.sockets.get(rooms[roomId].host);
      if (hostSocket) {
          hostSocket.emit('get_current_player_state', socket.id);
      }
      
      console.log(`User ${username} (${socket.id}) joined room: ${roomId}`);
    } else {
      socket.emit('error', 'Room not found');
    }
  });
  
  socket.on('send_player_state_to_new_user', ({ state, targetSocketId }) => {
      io.to(targetSocketId).emit('sync_player_state', state);
  });

  socket.on('player_state_change', ({ roomId, state }) => {
    if (rooms[roomId] && socket.id === rooms[roomId].host) {
      socket.to(roomId).emit('sync_player_state', state);
    }
  });

  socket.on('send_message', ({ roomId, message, username }) => {
    if (rooms[roomId]) {
        io.to(roomId).emit('receive_message', { id: socket.id, username, message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
    
    // --- IMPROVED DISCONNECT LOGIC ---
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const userIndex = room.users.findIndex(user => user.id === socket.id);

      if (userIndex !== -1) {
        const [disconnectedUser] = room.users.splice(userIndex, 1);

        if (room.users.length === 0) {
          // If the room is now empty, delete it
          delete rooms[roomId];
          console.log(`Room ${roomId} is empty and has been closed.`);
        } else {
          // If the host disconnected, make the next user the new host
          if (room.host === socket.id) {
            room.host = room.users[0].id;
            console.log(`Host disconnected. New host for room ${roomId} is ${room.host}`);
          }
          // Notify the remaining users
          io.to(roomId).emit('user_left', { username: disconnectedUser.username, users: room.users });
        }
        break; // A user can only be in one room, so we can stop searching
      }
    }
  });
});


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));