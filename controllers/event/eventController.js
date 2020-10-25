const EventModel = require('../../models/eventModel');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const dateFormat = require('dateformat');
const ExcelExportService = require('../../ExcelExportService');
const sortArray = require('sort-array');
const loggerEvent = require('../../events/logEvent');
const getRequestBodyContentString = require('../../helper/getRequestBodyContentString');
const setResponseError = require('../../helper/error');

exports.getEvents = async (req, res) => {

    const events = await EventModel.find({})
        .select(
            [
                'eventId',
                'eventName',
                'eventType',
                'startDateTime',
                'endDateTime'
            ]
        )
        .select('-_id')
        .exec();

    loggerEvent.emit('logger', {
        endPointName: 'getEvents',
        requestBody: 'none',
        status: 'success'
    });

    res.send(events);

}

exports.getEventById = async (req, res) => {

    const event = await getEventWithMemberAttendance(req.params.eventId);

    res.send(event);

    loggerEvent.emit('logger', {
        endPointName: 'getEventById',
        requestBody: `eventId=${event.eventId}`,
        status: 'success'
    });

}

exports.addEvent = async (req, res) => {
    const event = req.body;

    try {
        const newEvent = new EventModel({
            eventId: uuidv4()//new mongoose.Types.ObjectId()
        });


        Object.keys(event).forEach(propName => {
            newEvent[propName] = event[propName];
        });

        await newEvent.save();

        loggerEvent.emit('logger', {
            endPointName: 'addEvent',
            requestBody: getRequestBodyContentString(event),
            status: 'success'
        });

        res.sendStatus(201);

    } catch (error) {

        loggerEvent.emit('logger', {
            endPointName: 'addEvent',
            requestBody: getRequestBodyContentString(event),
            status: 'failed'
        });

        res.status(400).json(setResponseError(1 ,error.message));
    }
}

exports.updateEvent = async (req, res) => {
    const { event } = res.locals;

    await EventModel.findOneAndUpdate({ eventId: event.eventId }, event, { useFindAndModify: false });

    loggerEvent.emit('logger', {
        endPointName: 'updateEvent',
        requestBody: `${getRequestBodyContentString(req.params)} ${getRequestBodyContentString(req.body)}`,
        status: 'success'
    });

    res.sendStatus(200);
}

exports.deleteEvent = async (req, res) => {

    const eventId = req.params.eventId;

    await EventModel.findOneAndDelete({ eventId }, { useFindAndModify: false });

    loggerEvent.emit('logger', {
        endPointName: 'deleteEvent',
        requestBody: getRequestBodyContentString(req.params),
        status: 'success'
    });

    res.sendStatus(200);
}

exports.searchEvent = async (req, res) => {
    let status = '';
    try {
        let { eventName, startDate, endDate } = req.query;

        const events = await EventModel.find({}).select(['-_id', '-memberAttendance', '-__v']).exec();

        const filteredEvents = events.filter(i =>
            (
                i.eventName.toLowerCase() === (eventName || i.eventName).toLowerCase() &&
                (new Date(i.startDateTime).getTime() === new Date(startDate || i.startDateTime).getTime()) &&
                (new Date(i.endDateTime).getTime() === new Date(endDate || i.endDateTime).getTime())
            )
        );
        status = 'success';
        if (filteredEvents.length === 0)
            res.status(404).json(setResponseError(1 ,'Not found.'));
        else
            res.send(filteredEvents);

    } catch (error) {
        res.status(400).json(setResponseError(1 ,error.message));
        status = 'failed';
    }

    loggerEvent.emit('logger', {
        endPointName: 'searchEvent',
        requestBody: getRequestBodyContentString(req.query),
        status: status
    });

}

exports.exportEvent = async (req, res) => {
    let status = '';
    try {
        const { eventId } = req.query;

        const eventToExport = await getEventWithMemberAttendance(eventId);

        const excelFileName = `${eventToExport.eventName}_${dateFormat(eventToExport.startDateTime, 'mm-dd-yyyy')}`;

        const excelEvent = new ExcelExportService(excelFileName, eventToExport);

        await excelEvent.export();

        status = 'success';

        res.download(excelEvent.filePath);

    } catch (error) {
        status = 'failed';
        res.status(500).json(setResponseError(1 ,error.message));
    }

    loggerEvent.emit('logger', {
        endPointName: 'exportEvent',
        requestBody: getRequestBodyContentString(req.query),
        status: status
    });
}

const getEventWithMemberAttendance = async (id) => {
    const event = await EventModel.findOne({ eventId: id })
        .select(
            [
                'eventId',
                'eventName',
                'eventType',
                'startDateTime',
                'endDateTime',
                '-_id'
            ]
        )
        .populate(
            {
                path: 'memberAttendance',
                populate: {
                    path: 'member',
                    select: '-_id -__v -memberAttendance -status -joinedDate'
                },
                select: '-_id -__v -event'
            }
        ).populate(
            {
                path: 'memberAttendance',
                populate: {
                    path: 'attendance',
                    select: '-_id -__v -attendanceId -memberAttendance'
                },
                select: '-_id -__v -event'
            }
        )
        .exec();

    const { eventId, eventName, eventType, startDateTime, endDateTime, memberAttendance } = event;

    return {
        eventId,
        eventName,
        eventType, 
        startDateTime, 
        endDateTime,
        memberAttendance: [
            ...sortArray(memberAttendance.map(i => ({
                memeberId: i.member.memberId,
                name: i.member.name,
                timeIn: i.attendance.timeIn,
                timeOut: i.attendance.timeOut
            })), {
                by: 'timeIn',
                order: 'asc'
            })
        ]
    };
}

