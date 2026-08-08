const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Profile, Notification } = require('../models/Schemas');

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_devsphere_token_key_2026', {
    expiresIn: '30d'
  });
};

// Register
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User or email already exists' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (first user is admin for demo administration purposes)
    const totalUsers = await User.countDocuments({});
    const role = totalUsers === 0 ? 'admin' : 'user';

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      isVerified: true // Auto-verify for ease of use in demo/2026 SaaS
    });

    if (user) {
      // Create empty profile
      const profile = await Profile.create({
        user: user._id,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        bio: 'Developer building the future.',
        skills: ['JavaScript', 'HTML5', 'CSS3'],
        stats: {
          profileCompletion: 40,
          resumeScore: 0,
          interviewReadiness: 0,
          projectsCount: 0,
          githubActivityCount: 0,
          learningProgress: 0
        }
      });

      // Create welcome notification
      await Notification.create({
        user: user._id,
        title: 'Welcome to DevSphere AI!',
        content: 'Get started by uploading your resume or trying our AI interview generator.',
        type: 'success'
      });

      res.status(201).json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        },
        profile
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const profile = await Profile.findOne({ user: user._id });

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      profile
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // In a production setup, we would generate a crypto token and mail it.
    // For DevSphere 2026 mock verification flows:
    res.json({
      message: 'Password reset link sent to your registered email address.',
      resetToken: generateToken(user._id) // Temporary login token for demonstration
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Invalid parameters' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_devsphere_token_key_2026');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ message: 'Password has been successfully updated' });
  } catch (error) {
    res.status(400).json({ message: 'Expired or invalid token' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};
