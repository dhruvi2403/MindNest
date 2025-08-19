import express from 'express';
import { db } from '../lib/db.js';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();

// Get user assessments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const assessments = await db.assessments.findByUserId(req.user.userId);
    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new assessment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { answers, result } = req.body;

    if (!answers || !result) {
      return res.status(400).json({ error: 'Answers and result are required' });
    }

    const assessmentData = {
      userId: req.user.userId,
      answers,
      result,
    };

    const newAssessment = await db.assessments.create(assessmentData);
    res.status(201).json(newAssessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
