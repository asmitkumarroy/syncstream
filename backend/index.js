const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const musicRoutes = require('./routes/music');
const authRoutes = require('./routes/auth');
const playlistRoutes = require('./routes/playlists');
const userRoutes = require('./routes/user'); // 1. Import user routes

const connectDB = async () => {
  //... (no changes here)
   try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Use Routes
app.use('/api', musicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/user', userRoutes); // 2. Use user routes

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));