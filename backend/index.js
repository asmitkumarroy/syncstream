// Import required packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Create an Express application
const app = express();

// Use middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow the server to parse JSON in request bodies

// Define a simple root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the SyncStream backend!' });
});

// Get the port from environment variables or use a default
const PORT = process.env.PORT || 5001;

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});