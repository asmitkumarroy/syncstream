const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');

// Helper function to sign a token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user (password will be hashed by the pre-save hook in the model)
    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Create a token and send it back
    const token = signToken(user._id);
    res.status(201).json({ token });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


// @route   POST /api/auth/login
// @desc    Login a user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create a token and send it back
    const token = signToken(user._id);
    res.status(200).json({ token });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// --- ADD THIS NEW ROUTE AT THE BOTTOM ---
// @route   GET /api/auth/me
// @desc    Get the logged in user's data
// @access  Private
router.get('/me', protect, async (req, res) => {
    // The protect middleware already fetched the user and attached it to req.user
    res.status(200).json(req.user);
});


module.exports = router;
