const AttendanceModel = require('../../models/attendanceModel');
const MemberModel = require('../../models/memberModel');
const EventModel = require('../../models/eventModel');
const MemberAttendanceModel = require('../../models/memberAttendanceModel');
const getRequestBodyContentString = require('../../helper/getRequestBodyContentString');
const loggerEvent = require('../../events/logEvent');
const setResponseError = require('../../helper/error');
const AttendanceDataStore = require('../../datastore/AttendanceDataStore');

const { 
    getAllAttendance,
    addAttendance,
    updateAttendance,
    deleteAttendance 
} = new AttendanceDataStore();

exports.getAttendance = async (req, res) => {

    const attendance = await getAllAttendance();

    loggerEvent.emit('logger', {
        endPointName: 'getAttendance',
        requestBody: `none`,
        status: 'success'
    });

    res.send(attendance);

}

exports.addAttendance = async (req, res) => {
    const attendance = req.body;
    const member = res.locals.member;
    const event = res.locals.event;
    loggerStatus = '';
    try {
        
        await addAttendance(attendance, member, event);

        loggerStatus = 'success';

        res.sendStatus(201);

    } catch (error) {
        loggerStatus = 'failed';
        res.status(400).json(setResponseError(1 ,error.message));
    }

    loggerEvent.emit('logger', {
        endPointName: 'addAttendance',
        requestBody: getRequestBodyContentString(req.body),
        status: loggerStatus
    });
}

exports.updateAttendance = async (req, res) => {
    const { attendance } = res.locals;

    await updateAttendance(attendance);

    loggerEvent.emit('logger', {
        endPointName: 'updateAttendance',
        requestBody: `${getRequestBodyContentString(req.params)} ${getRequestBodyContentString(req.body)}`,
        status: 'success'
    });

    res.sendStatus(200);
}

exports.deleteAttendance = async (req, res) => {

    const { attendanceId } = req.params;

    deleteAttendance(attendanceId);
    
    loggerEvent.emit('logger', {
        endPointName: 'deleteAttendance',
        requestBody: getRequestBodyContentString(req.params),
        status: 'success'
    });

    res.sendStatus(200);
}

