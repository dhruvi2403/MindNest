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

// Get recent assessments for client
router.get('/assessments/recent', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Access denied. Client role required.' });
    }

    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 5;

    // Get recent assessments
    const assessments = await db.assessments.findByUserId(userId, { limit, sort: { createdAt: -1 } });

    res.json({
      assessments: assessments || []
    });
  } catch (error) {
    console.error('Error fetching recent assessments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recommended therapists for client based on assessment results
router.get('/therapists/recommended', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Access denied. Client role required.' });
    }

    const userId = req.user.userId;

    // Get client's most recent assessment
    const recentAssessment = await db.assessments.findByUserId(userId, { limit: 1, sort: { createdAt: -1 } });

    let recommendedTherapists = [];

    if (recentAssessment && recentAssessment.length > 0) {
      const assessment = recentAssessment[0];
      const severity = assessment.result?.severity || 'Moderate';

      // Get therapists based on severity level
      const specializations = getRecommendedSpecializations(severity);
      recommendedTherapists = await db.therapists.findBySpecializations(specializations, { limit: 6 });
    } else {
      // If no assessment, get general therapists
      recommendedTherapists = await db.therapists.findAll({ limit: 6 });
    }

    res.json({
      recommendedTherapists: recommendedTherapists || [],
      basedOnAssessment: recentAssessment && recentAssessment.length > 0
    });
  } catch (error) {
    console.error('Error fetching recommended therapists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get recommended specializations based on severity
function getRecommendedSpecializations(severity) {
  const specializationMap = {
    'Low': ['Stress Management', 'Career Counseling', 'Mindfulness'],
    'Mild': ['Anxiety Disorders', 'Stress Management', 'Mindfulness', 'Career Counseling'],
    'Moderate': ['Anxiety Disorders', 'Depression', 'Stress Management', 'Trauma & PTSD'],
    'High': ['Depression', 'Trauma & PTSD', 'Anxiety Disorders', 'Crisis Intervention']
  };

  return specializationMap[severity] || specializationMap['Moderate'];
}

export default router;
