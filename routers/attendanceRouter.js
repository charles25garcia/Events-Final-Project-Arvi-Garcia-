const express = require('express');
const attendanceController = require('../controllers/attendance/attendanceController');
const attendanceValidatorController = require('../controllers/attendance/attendanceValidatorController');
const { body } = require('express-validator');

const attendanceRounter = express.Router();

const { addAttendance, getAttendance, updateAttendance, deleteAttendance } = attendanceController;
const { addAttendanceValidator, updateAttendanceValidator } = attendanceValidatorController;

attendanceRounter.get('/', getAttendance);

attendanceRounter.post('/', [
    body('eventName').trim().not().isEmpty(),
    body('name').trim().not().isEmpty(),
    body('timeIn').trim().not().isEmpty(),
    body('timeOut').trim().not().isEmpty(),
    body('timeIn').toDate(),
    body('timeOut').toDate(),
], addAttendanceValidator, addAttendance)

attendanceRounter.put('/:attendanceId', updateAttendanceValidator, updateAttendance);

attendanceRounter.delete('/:attendanceId',
    deleteAttendance);

module.exports = attendanceRounter;