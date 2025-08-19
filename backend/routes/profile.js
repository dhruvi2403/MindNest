import express from 'express';
import { db } from '../lib/db.js';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    const updatedUser = await db.users.update(req.user.userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
