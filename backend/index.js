const express = require('express');
const cors = require('cors');
const mongoose =require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

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

// --- Connect to MongoDB ---
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

// A simple in-memory object to store room state. 
// In a larger app, you might use a database like Redis for this.
const rooms = {};

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Event: When a user creates a new room
  socket.on('create_room', (username) => {
    const roomId = socket.id; // Use the creator's socket ID as the unique room ID
    socket.join(roomId);
    rooms[roomId] = {
      host: socket.id,
      users: [{ id: socket.id, username: username }]
    };
    // Send the room ID back to the creator
    socket.emit('room_created', roomId);
    console.log(`Room created with ID: ${roomId} by host ${username} (${socket.id})`);
  });

  // Event: When a user joins an existing room
  socket.on('join_room', ({ roomId, username }) => {
    // Check if the room exists
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].users.push({ id: socket.id, username: username });
      
      // Notify everyone in the room that a new user has joined
      io.to(roomId).emit('user_joined', { username, users: rooms[roomId].users });
      
      // Send the current player state of the host to the new user
      const hostSocket = io.sockets.sockets.get(rooms[roomId].host);
      if (hostSocket) {
          hostSocket.emit('get_current_player_state', socket.id);
      }
      
      console.log(`User ${username} (${socket.id}) joined room: ${roomId}`);
    } else {
      socket.emit('error', 'Room not found');
    }
  });
  
  // Event: The host sends its current state to a newly joined user
  socket.on('send_player_state_to_new_user', ({ state, targetSocketId }) => {
      io.to(targetSocketId).emit('sync_player_state', state);
  });

  // Event: When the host's player state changes (play, pause, seek, new song)
  socket.on('player_state_change', ({ roomId, state }) => {
    // We only trust the host to send state changes
    if (socket.id === rooms[roomId]?.host) {
      // Broadcast the new state to all OTHER clients in the room
      socket.to(roomId).emit('sync_player_state', state);
    }
  });

  // Event: When a user sends a chat message
  socket.on('send_message', ({ roomId, message, username }) => {
    // Broadcast the message to EVERYONE in the room (including the sender)
    io.to(roomId).emit('receive_message', {
      id: socket.id,
      username,
      message,
    });
  });

  // Event: When a user disconnects
  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
    // Clean up any rooms the user was in
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const userIndex = room.users.findIndex(user => user.id === socket.id);

      if (userIndex !== -1) {
        const disconnectedUser = room.users.splice(userIndex, 1)[0];
        // If the host disconnects, we can either end the room or assign a new host.
        // For simplicity, we'll just notify others.
        io.to(roomId).emit('user_left', { username: disconnectedUser.username, users: room.users });
        break;
      }
    }
  });
});


const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));