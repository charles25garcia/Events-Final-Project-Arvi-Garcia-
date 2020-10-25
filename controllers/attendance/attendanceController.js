const AttendanceModel = require('../../models/attendanceModel');
const { v4: uuidv4 } = require('uuid');
const MemberModel = require('../../models/memberModel');
const EventModel = require('../../models/eventModel');
const MemberAttendanceModel = require('../../models/memberAttendanceModel');
const getRequestBodyContentString = require('../../helper/getRequestBodyContentString');
const loggerEvent = require('../../events/logEvent');
const setResponseError = require('../../helper/error');

exports.getAttendance = async (req, res) => {

    const attendance = await AttendanceModel.find({}).select('-_id -__v -memberAttendance');

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
        const newAttendance = new AttendanceModel({
            attendanceId: uuidv4()
        });

        Object.keys(attendance).forEach(propName => {
            newAttendance[propName] = attendance[propName];
        });

        await newAttendance.save(async (err) => {
            if (err) {
                return res.status(500).send();
            }

            const newMemberAttendance = new MemberAttendanceModel({
                event: event._id,
                member: member._id,
                attendance: newAttendance._id
            });

            await newMemberAttendance.save(async (err) => {
                if (err)  return res.status(500).send(err);

                const eventToUpdate = await EventModel.findOne({ _id: event.id });
                
                const memberToUpdate = await MemberModel.findOne({ _id: member.id });

                eventToUpdate.memberAttendance.push(newMemberAttendance._id);

                memberToUpdate.memberAttendance.push(newMemberAttendance._id);

                newAttendance.memberAttendance = newMemberAttendance._id;

                await EventModel.findOneAndUpdate({ _id: eventToUpdate._id}, eventToUpdate, { useFindAndModify: false});

                await MemberModel.findOneAndUpdate({ _id: memberToUpdate._id}, memberToUpdate, { useFindAndModify: false});

                await AttendanceModel.findOneAndUpdate({ attendanceId: newAttendance.attendanceId }, { memberAttendance: newMemberAttendance._id }, { useFindAndModify: false});

                res.sendStatus(201);
            });
        });
        loggerStatus = 'success';

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

    await AttendanceModel.findOneAndUpdate({ attendanceId: attendance.attendanceId }, attendance, { useFindAndModify: false });

    loggerEvent.emit('logger', {
        endPointName: 'updateAttendance',
        requestBody: `${getRequestBodyContentString(req.params)} ${getRequestBodyContentString(req.body)}`,
        status: 'success'
    });

    res.sendStatus(200);
}

exports.deleteAttendance = async (req, res) => {

    const { attendanceId } = req.params;

    const attendance = await AttendanceModel.findOne({ attendanceId });

    const memberAttendance = await MemberAttendanceModel.findOne({ _id: attendance.memberAttendance });
    
    const event = await EventModel.findOne({ _id: memberAttendance.event });
    
    event.memberAttendance = [...event.memberAttendance.filter(i => i.toString() != memberAttendance._id.toString()) ];
    
    const member = await MemberModel.findOne({ _id: memberAttendance.member });

    member.memberAttendance = [...member.memberAttendance.filter(i => i.toString() != memberAttendance._id.toString()) ];

    await MemberAttendanceModel.findOneAndDelete({ _id: memberAttendance._id });

    await AttendanceModel.findOneAndDelete({ attendanceId }, { useFindAndModify: false });

    await EventModel.findOneAndUpdate({ _id: event._id }, { useFindAndModify: false });

    await MemberModel.findOneAndUpdate({ _id: member._id }, { useFindAndModify: false });

    loggerEvent.emit('logger', {
        endPointName: 'deleteAttendance',
        requestBody: getRequestBodyContentString(req.params),
        status: 'success'
    });

    res.sendStatus(200);
}

