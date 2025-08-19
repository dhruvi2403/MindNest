import express from 'express';
import { db } from '../lib/db.js';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();

// Get all verified therapists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const therapists = await db.therapists.findAll();
    res.json(therapists);
  } catch (error) {
    console.error('Get therapists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get therapist by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const therapist = await db.therapists.findById(req.params.id);
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    res.json(therapist);
  } catch (error) {
    console.error('Get therapist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search therapists by specialization
router.get('/search/:specialization', authenticateToken, async (req, res) => {
  try {
    const therapists = await db.therapists.findBySpecialization(req.params.specialization);
    res.json(therapists);
  } catch (error) {
    console.error('Search therapists error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create therapist profile (for therapist users)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Only therapists can create therapist profiles' });
    }

    const therapistData = {
      userId: req.user.userId,
      ...req.body,
    };

    const newTherapist = await db.therapists.create(therapistData);
    res.status(201).json(newTherapist);
  } catch (error) {
    console.error('Create therapist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update therapist profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const therapist = await db.therapists.findByUserId(req.user.userId);
    if (!therapist || therapist._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const updatedTherapist = await db.therapists.update(req.params.id, req.body);
    res.json(updatedTherapist);
  } catch (error) {
    console.error('Update therapist error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get therapist profile by user ID
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // const { userId } = req.user;   //////////////////
    // const userId = req.user._id; // use _id instead of userId
    const userId = req.user.userId;

    
    // Check if user is a therapist
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied. Therapist role required.' });
    }

    const therapist = await db.therapists.findByUserId(userId);
    
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist profile not found' });
    }

    res.json({ therapist });
  } catch (error) {
    console.error('Error fetching therapist profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get therapist availability
router.get('/:id/availability', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const therapist = await db.therapists.findById(id);
    
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }

    // Get available time slots based on therapist's availability
    const availableSlots = therapist.availability || [];
    
    res.json({ 
      availableSlots,
      availability: therapist.availability,
      location: therapist.location
    });
  } catch (error) {
    console.error('Error fetching therapist availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get therapist stats for dashboard
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied. Therapist role required.' });
    }

    const userId = req.user.userId;
    const therapist = await db.therapists.findByUserId(userId);
    
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist profile not found' });
    }

    // Get appointment statistics
    const totalAppointments = await db.appointments.countByTherapistId(therapist._id);
    const completedSessions = await db.appointments.countByTherapistIdAndStatus(therapist._id, 'completed');
    const upcomingSessions = await db.appointments.countByTherapistIdAndStatus(therapist._id, 'scheduled');
    const totalClients = await db.appointments.countUniqueClientsByTherapistId(therapist._id);

    res.json({
      totalAppointments,
      completedSessions,
      upcomingSessions,
      totalClients
    });
  } catch (error) {
    console.error('Error fetching therapist stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
