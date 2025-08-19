import express from 'express';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();

// Chatbot endpoint
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // This is a placeholder response
    // In the actual implementation, this would integrate with the Python chatbot service
    const response = {
      message: "I'm here to help you with your mental health journey. How can I assist you today?",
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
