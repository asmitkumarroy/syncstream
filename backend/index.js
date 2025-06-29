const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const musicRoutes = require('./routes/music');
const authRoutes = require('./routes/auth'); // Import auth routes

// --- Connect to MongoDB ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Exit process with failure
  }
};
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// --- Use Routes ---
app.use('/api', musicRoutes);
app.use('/api/auth', authRoutes); // Use auth routes

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));