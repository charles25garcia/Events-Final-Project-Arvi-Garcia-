const AttendanceModel = require("../../models/attendanceModel");
const { validationResult } = require('express-validator');
const MemberModel = require("../../models/memberModel");
const EventModel = require("../../models/eventModel");
const e = require("express");
const setResponseError = require('../../helper/error');


exports.addAttendanceValidator = async (req, res, next) => {

    const { timeIn, timeOut, name, eventName } = req.body;

    const isValidTimeIn = timeIn < timeOut;

    const attendee = await MemberModel.find({ name });

    const event = await EventModel.find({ eventName });

    const isValidMember = attendee.length > 0;

    const isValidEvent = event.length > 0;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(setResponseError(0 ,errors.array()));
    } else if (!isValidTimeIn) {
        return res.status(409).json(setResponseError(0 ,'Time in should be before time out.'));
    } else if (!isValidEvent) {
        return res.status(409).json(setResponseError(0 ,'Event does not exist.'));
    } else if (!isValidMember) {
        return res.status(409).json(setResponseError(0 ,'Invalid attendee'));
    }
    else {
        res.locals.event = event[0];
        res.locals.member = attendee[0];
        next();
    }

}

exports.updateAttendanceValidator = async (req, res, next) => {
    try {
        const { attendanceId } = req.params;
        const reqAttendance = req.body;
        const errors = validationResult(req);

        const attendanceToUpdate = await AttendanceModel.findOne({ attendanceId });

        if (!attendanceToUpdate) return res.status(404).json(setResponseError(1 ,'Attendance does not exist.'));

        Object.keys(reqAttendance).forEach(propName => {
            attendanceToUpdate[propName] = reqAttendance[propName];
        })

        const { timeIn, timeOut } = attendanceToUpdate;

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        else if (!isValidTimeIn(timeIn, timeOut))
            res.status(409).json(setResponseError(0 ,'Attendance timeIn should be before timeOut.'));
        else { res.locals.attendance = attendanceToUpdate; next(); }

    } catch (error) {
        res.status(400).json(setResponseError(1 ,error.message));
    }
}

const isValidTimeIn = (startDate, endDate) => {
    return startDate < endDate;
}