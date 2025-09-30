require('dotenv').config();

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, User, CastingCall, Submission } = require('./models');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// AUTHENTICATION ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword
    });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      city: user.city,
      state: user.state,
      actualAge: user.actualAge,
      playableAgeMin: user.playableAgeMin,
      playableAgeMax: user.playableAgeMax,
      gender: user.gender,
      ethnicity: user.ethnicity,
      unionStatus: user.unionStatus,
      roleTypes: user.roleTypes,
      specialSkills: user.specialSkills,
      isAdmin: user.isAdmin
    };
    
    res.json({ token, user: userData });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// USER PROFILE ROUTES

// Update profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    // Clean up empty strings for integer fields
    const cleanData = { ...req.body };
    ['actualAge', 'playableAgeMin', 'playableAgeMax'].forEach(field => {
      if (cleanData[field] === '') {
        cleanData[field] = null;
      }
    });
    
    await user.update(cleanData);
    
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// CASTING CALL ROUTES

// Get all casting calls
app.get('/api/casting-calls', async (req, res) => {
  try {
    const { search, roleType, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where.title = { [sequelize.Sequelize.Op.iLike]: `%${search}%` };
    }
    if (roleType && roleType !== 'all') {
      where.roleType = roleType;
    }
    
    const { count, rows } = await CastingCall.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      castingCalls: rows,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching casting calls:', error);
    res.status(500).json({ error: 'Failed to fetch casting calls' });
  }
});

// Create casting call (admin only)
app.post('/api/casting-calls', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const castingCall = await CastingCall.create(req.body);
    res.json(castingCall);
  } catch (error) {
    console.error('Error creating casting call:', error);
    res.status(500).json({ error: 'Failed to create casting call' });
  }
});

// Delete casting call (admin only)
app.delete('/api/casting-calls/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    await CastingCall.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Casting call deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete casting call' });
  }
});

// SUBMISSION ROUTES

// Get user submissions
app.get('/api/submissions', authenticateToken, async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: { UserId: req.user.id },
      include: [{ model: CastingCall }],
      order: [['createdAt', 'DESC']]
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Create submission
app.post('/api/submissions', authenticateToken, async (req, res) => {
  try {
    const { castingCallId, status, matchScore } = req.body;
    
    // Check if already submitted
    const existing = await Submission.findOne({
      where: {
        UserId: req.user.id,
        CastingCallId: castingCallId
      }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Already submitted to this casting call' });
    }
    
    const submission = await Submission.create({
      UserId: req.user.id,
      CastingCallId: castingCallId,
      status,
      matchScore
    });
    
    res.json(submission);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Failed to create submission' });
  }
});

// STRIPE ROUTES

// Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { userEmail, userName } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'CastingCompanion Pro',
              description: '$1 trial for 14 days, then $39.97/month',
            },
            unit_amount: 3997,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
      },
      customer_email: userEmail,
      metadata: {
        userName: userName,
      },
      success_url: `${req.headers.origin || 'http://localhost:3000'}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}?payment_cancelled=true`,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});