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

// Ensure therapist profile exists (create if doesn't exist)
router.post('/ensure', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied. Therapist role required.' });
    }

    const userId = req.user.userId;
    let therapist = await db.therapists.findByUserId(userId);
    
    if (!therapist) {
      // Create basic therapist profile
      const therapistData = {
        userId,
        onboarded: false,
        verified: false,
        specialization: [],
        bio: '',
        location: '',
        availability: [],
        licenseNumber: '',
        education: '',
        yearsOfPractice: ''
      };
      
      therapist = await db.therapists.create(therapistData);
    }

    res.json(therapist);
  } catch (error) {
    console.error('Error ensuring therapist profile:', error);
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

// Therapist onboarding endpoint
router.post('/onboard', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied. Therapist role required.' });
    }

    const userId = req.user.userId;
    let therapist = await db.therapists.findByUserId(userId);

    if (!therapist) {
      // Create new therapist profile
      const therapistData = {
        userId,
        ...req.body,
        onboarded: true,
        verified: false
      };

      therapist = await db.therapists.create(therapistData);
    } else {
      // Update existing therapist profile
      const updatedData = {
        ...req.body,
        onboarded: true
      };

      therapist = await db.therapists.update(therapist._id, updatedData);
    }

    res.json({
      message: 'Therapist profile onboarded successfully',
      therapist
    });
  } catch (error) {
    console.error('Error onboarding therapist:', error);
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

    // Get all appointments for this therapist
    const appointments = await db.appointments.findByTherapistId(therapist._id);

    // Calculate statistics
    const totalAppointments = appointments.length;
    const completedSessions = appointments.filter(apt => apt.status === 'completed').length;
    const upcomingSessions = appointments.filter(apt =>
      apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length;

    // Get unique clients
    const uniqueClientIds = [...new Set(appointments.map(apt => apt.clientId.toString()))];
    const totalClients = uniqueClientIds.length;

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

// Get recent client assessments for therapist's clients
router.get('/clients/assessments', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied. Therapist role required.' });
    }

    const userId = req.user.userId;
    const therapist = await db.therapists.findByUserId(userId);

    if (!therapist) {
      return res.status(404).json({ error: 'Therapist profile not found' });
    }

    // Get all appointments for this therapist to find client IDs
    const appointments = await db.appointments.findByTherapistId(therapist._id);
    const clientIds = [...new Set(appointments.map(apt => apt.clientId))];

    // Get recent assessments for these clients
    const assessments = await db.assessments.findByUserIds(clientIds, { limit: 10, sort: { createdAt: -1 } });

    res.json({
      assessments: assessments || []
    });
  } catch (error) {
    console.error('Error fetching client assessments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get therapist's client list with basic info
router.get('/clients', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied. Therapist role required.' });
    }

    const userId = req.user.userId;
    const therapist = await db.therapists.findByUserId(userId);

    if (!therapist) {
      return res.status(404).json({ error: 'Therapist profile not found' });
    }

    // Get all appointments for this therapist
    const appointments = await db.appointments.findByTherapistIdWithClientDetails(therapist._id);

    // Group by client and get latest appointment info
    const clientMap = new Map();
    appointments.forEach(apt => {
      const clientId = apt.clientId._id || apt.clientId;
      if (!clientMap.has(clientId.toString())) {
        clientMap.set(clientId.toString(), {
          _id: clientId,
          name: apt.clientId.name || 'Unknown Client',
          email: apt.clientId.email || '',
          totalSessions: 0,
          lastSession: null,
          nextSession: null,
          status: 'active'
        });
      }

      const client = clientMap.get(clientId.toString());
      client.totalSessions++;

      if (apt.status === 'completed' && (!client.lastSession || new Date(apt.date) > new Date(client.lastSession))) {
        client.lastSession = apt.date;
      }

      if (apt.status === 'scheduled' && (!client.nextSession || new Date(apt.date) < new Date(client.nextSession))) {
        client.nextSession = apt.date;
      }
    });

    const clients = Array.from(clientMap.values());

    res.json({
      clients: clients || []
    });
  } catch (error) {
    console.error('Error fetching therapist clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
