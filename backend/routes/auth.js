import express from 'express';
import { db } from '../lib/db.js';
import { hashPassword, comparePassword, generateToken } from '../lib/auth.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // Find user
    const user = await db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify role matches
    if (user.role !== role) {
      return res.status(403).json({ 
        error: `This account is registered as a ${user.role}, not a ${role}. Please select the correct role.` 
      });
    }

    const token = generateToken(user._id.toString(), user.email, user.role);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'client' } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
    };

    const newUser = await db.users.create(userData);

    // Generate token
    const token = generateToken(newUser._id.toString(), newUser.email, newUser.role);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
