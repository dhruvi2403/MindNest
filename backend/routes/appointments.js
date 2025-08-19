import express from 'express';
import { db } from '../lib/db.js';
import { authenticateToken } from '../lib/auth.js';

const router = express.Router();

// Get all appointments for a user (client or therapist)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user.userId;
    
    let appointments;
    if (role === 'therapist') {
      // Find therapist profile first
      const therapist = await db.therapists.findByUserId(userId);
      if (!therapist) {
        return res.status(404).json({ error: 'Therapist profile not found' });
      }
      appointments = await db.appointments.findByTherapistId(therapist._id);
    } else {
      appointments = await db.appointments.findByClientId(userId);
    }

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming appointments
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user.userId;
    
    let appointments;
    if (role === 'therapist') {
      const therapist = await db.therapists.findByUserId(userId);
      if (!therapist) {
        return res.status(404).json({ error: 'Therapist profile not found' });
      }
      appointments = await db.appointments.findUpcoming(therapist._id, 'therapist');
    } else {
      appointments = await db.appointments.findUpcoming(userId, 'client');
    }

    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Book a new appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { therapistId, date, startTime, endTime, sessionType, notes } = req.body;
    const clientId = req.user.userId;

    // Validate required fields
    if (!therapistId || !date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if therapist exists and is verified
    const therapist = await db.therapists.findById(therapistId);
    if (!therapist || !therapist.verified) {
      return res.status(404).json({ error: 'Therapist not found or not verified' });
    }

    // Check if time slot is available
    const appointmentDate = new Date(date);
    const existingAppointment = await db.appointments.findByTherapistId(therapistId);
    const conflictingAppointment = existingAppointment.find(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === appointmentDate.toDateString() &&
             apt.status === 'scheduled' &&
             ((startTime >= apt.startTime && startTime < apt.endTime) ||
              (endTime > apt.startTime && endTime <= apt.endTime));
    });

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'Time slot not available' });
    }

    // Create appointment
    const appointmentData = {
      clientId,
      therapistId,
      date: appointmentDate,
      startTime,
      endTime,
      sessionType: sessionType || 'follow-up',
      notes: notes || '',
    };

    const appointment = await db.appointments.create(appointmentData);
    
    // Populate the appointment with user details
    const populatedAppointment = await db.appointments.findByClientId(clientId);
    const newAppointment = populatedAppointment.find(apt => apt._id.toString() === appointment._id.toString());

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment status
router.patch('/:appointmentId/status', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const { role } = req.user;

    // Validate status
    const validStatuses = ['scheduled', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user has permission to update this appointment
    const appointment = await db.appointments.findByClientId(req.user.userId);
    const therapist = await db.therapists.findByUserId(req.user.userId);
    
    let hasPermission = false;
    if (role === 'client') {
      hasPermission = appointment.some(apt => apt._id.toString() === appointmentId);
    } else if (role === 'therapist' && therapist) {
      const therapistAppointments = await db.appointments.findByTherapistId(therapist._id);
      hasPermission = therapistAppointments.some(apt => apt._id.toString() === appointmentId);
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update appointment status
    const updatedAppointment = await db.appointments.updateStatus(appointmentId, status);

    res.json({
      message: 'Appointment status updated successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel appointment
router.delete('/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { role } = req.user;

    // Check if user has permission to cancel this appointment
    const appointment = await db.appointments.findByClientId(req.user.userId);
    const therapist = await db.therapists.findByUserId(req.user.userId);
    
    let hasPermission = false;
    if (role === 'client') {
      hasPermission = appointment.some(apt => apt._id.toString() === appointmentId);
    } else if (role === 'therapist' && therapist) {
      const therapistAppointments = await db.appointments.findByTherapistId(therapist._id);
      hasPermission = therapistAppointments.some(apt => apt._id.toString() === appointmentId);
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update appointment status to cancelled
    await db.appointments.updateStatus(appointmentId, 'cancelled');

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
