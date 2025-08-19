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

// Get upcoming appointments for therapist
router.get('/therapist/upcoming', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userId = req.user.userId;
    const therapist = await db.therapists.findByUserId(userId);
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist profile not found' });
    }

    const appointments = await db.appointments.findUpcomingByTherapist(therapist._id);
    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching therapist appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get scheduled appointments for client
router.get('/client/scheduled', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'client') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userId = req.user.userId;
    const appointments = await db.appointments.findScheduledByClient(userId);
    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching client appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointments for a specific therapist on a specific date
router.get('/therapist/:therapistId', authenticateToken, async (req, res) => {
  try {
    const { therapistId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const appointments = await db.appointments.findByTherapistIdAndDate(therapistId, date);
    res.json({ appointments });
  } catch (error) {
    console.error('Error fetching therapist appointments:', error);
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
      appointments = await db.appointments.findUpcomingByTherapist(therapist._id);
    } else {
      appointments = await db.appointments.findUpcomingByClient(userId);
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
    const { therapistId, date, time, type, notes } = req.body;
    const clientId = req.user.userId;

    // Validate required fields
    if (!therapistId || !date || !time || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if therapist exists and is verified
    const therapist = await db.therapists.findById(therapistId);
    if (!therapist || !therapist.verified) {
      return res.status(404).json({ error: 'Therapist not found or not verified' });
    }

    // Check if time slot is available
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if therapist is available on this day
    if (!therapist.availability || !therapist.availability.includes(dayOfWeek)) {
      return res.status(400).json({ error: 'Therapist is not available on this day' });
    }

    // Check for time conflicts
    const existingAppointments = await db.appointments.findByTherapistIdAndDate(therapistId, date);
    const conflictingAppointment = existingAppointments.find(apt => 
      apt.status !== 'cancelled' && apt.time === time
    );

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'Time slot not available' });
    }

    // Create appointment
    const appointmentData = {
      clientId,
      therapistId,
      date: appointmentDate,
      time,
      type,
      notes: notes || '',
      status: 'scheduled'
    };

    const appointment = await db.appointments.create(appointmentData);
    
    // Populate the appointment with user details
    const populatedAppointment = await db.appointments.findByIdWithDetails(appointment._id);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: populatedAppointment,
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm appointment (therapist)
router.put('/:appointmentId/confirm', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { role } = req.user;

    if (role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const therapist = await db.therapists.findByUserId(req.user.userId);
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist profile not found' });
    }

    const appointment = await db.appointments.findById(appointmentId);
    if (!appointment || appointment.therapistId.toString() !== therapist._id.toString()) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updatedAppointment = await db.appointments.updateStatus(appointmentId, 'confirmed');
    res.json({
      message: 'Appointment confirmed successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete appointment (therapist)
router.put('/:appointmentId/complete', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { role } = req.user;

    if (role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const therapist = await db.therapists.findByUserId(req.user.userId);
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist profile not found' });
    }

    const appointment = await db.appointments.findById(appointmentId);
    if (!appointment || appointment.therapistId.toString() !== therapist._id.toString()) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updatedAppointment = await db.appointments.updateStatus(appointmentId, 'completed');
    res.json({
      message: 'Appointment completed successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel appointment (client)
router.put('/:appointmentId/cancel', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { role } = req.user;

    if (role !== 'client') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointment = await db.appointments.findById(appointmentId);
    if (!appointment || appointment.clientId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updatedAppointment = await db.appointments.updateStatus(appointmentId, 'cancelled');
    res.json({
      message: 'Appointment cancelled successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reschedule appointment (client)
router.put('/:appointmentId/reschedule', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { date, time } = req.body;
    const { role } = req.user;

    if (role !== 'client') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }

    const appointment = await db.appointments.findById(appointmentId);
    if (!appointment || appointment.clientId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if new time slot is available
    const therapist = await db.therapists.findById(appointment.therapistId);
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!therapist.availability || !therapist.availability.includes(dayOfWeek)) {
      return res.status(400).json({ error: 'Therapist is not available on this day' });
    }

    const existingAppointments = await db.appointments.findByTherapistIdAndDate(appointment.therapistId, date);
    const conflictingAppointment = existingAppointments.find(apt => 
      apt._id.toString() !== appointmentId && apt.status !== 'cancelled' && apt.time === time
    );

    if (conflictingAppointment) {
      return res.status(400).json({ error: 'Time slot not available' });
    }

    const updatedAppointment = await db.appointments.updateDateTime(appointmentId, date, time);
    res.json({
      message: 'Appointment rescheduled successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment status (legacy)
router.patch('/:appointmentId/status', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;
    const { role } = req.user;

    // Validate status
    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user has permission to update this appointment
    const appointment = await db.appointments.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    let hasPermission = false;
    if (role === 'client') {
      hasPermission = appointment.clientId.toString() === req.user.userId;
    } else if (role === 'therapist') {
      const therapist = await db.therapists.findByUserId(req.user.userId);
      hasPermission = therapist && appointment.therapistId.toString() === therapist._id.toString();
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

// Cancel appointment (legacy)
router.delete('/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { role } = req.user;

    // Check if user has permission to cancel this appointment
    const appointment = await db.appointments.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    let hasPermission = false;
    if (role === 'client') {
      hasPermission = appointment.clientId.toString() === req.user.userId;
    } else if (role === 'therapist') {
      const therapist = await db.therapists.findByUserId(req.user.userId);
      hasPermission = therapist && appointment.therapistId.toString() === therapist._id.toString();
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
