const express = require('express');
const router = express.Router();
const { 
  createAppointment, 
  markAsPaid,
  getStudentAppointments,
  getCounsellorAppointments,
  getAppointmentById,
  getCounsellorDashboard
} = require('../controllers/appointmentController');

router.post('/', createAppointment);
router.patch('/:id/pay', markAsPaid);
router.get('/student/:studentId', getStudentAppointments);
router.get('/counsellor/:counsellorId', getCounsellorAppointments);
router.get('/:id', getAppointmentById);
router.get('/counsellor/:counsellorId/dashboard', getCounsellorDashboard);

module.exports = router;