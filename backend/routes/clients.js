import express from 'express';
import { db } from '../lib/db.js';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();

// Get client stats for dashboard
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Access denied. Client role required.' });
    }

    const userId = req.user.userId;

    // Get appointment statistics
    const totalSessions = await db.appointments.countByClientId(userId);
    const completedSessions = await db.appointments.countByClientIdAndStatus(userId, 'completed');
    const upcomingSessions = await db.appointments.countByClientIdAndStatus(userId, 'scheduled');
    const totalTherapists = await db.appointments.countUniqueTherapistsByClientId(userId);

    res.json({
      totalSessions,
      completedSessions,
      upcomingSessions,
      totalTherapists
    });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
