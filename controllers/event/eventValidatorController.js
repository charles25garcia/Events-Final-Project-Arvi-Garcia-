const EventModel = require("../../models/eventModel");
const setResponseError = require('../../helper/error');
const { validationResult } = require('express-validator');
const { eventNames } = require("../../models/eventModel");

exports.getEventByIdValidator = async (req, res, next) => {
    const eventId = req.params.eventId;

    const event = await EventModel.find({ eventId });

    if (event.length) {
        res.eventId = eventId;
        next();
    } else {
        res.status(404).json(setResponseError(1,'Event not found.'));
    }
}

exports.addEventValidator = async (req, res, next) => {

    const { eventId, eventName, eventType, startDateTime, endDateTime } = req.body;

    const event = await EventModel.find({ eventName });

    const eventIsExist = event.length > 0;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(setResponseError(0, errors.array()));
    } else if (eventIsExist) {
        res.status(409).json(setResponseError(1,'Event already exist.'));
    } else if (!isValidStartEndDate(startDateTime, endDateTime)) {
        res.status(409).json(setResponseError(0 ,'Event start date should be before end date.'));
    } else {
        next();
    }

}

exports.updateEventValidator = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const reqEvent = req.body;
        const errors = validationResult(req);

        const eventToUpdate = await EventModel.findOne({ eventId });

        if (!eventToUpdate) return res.status(404).json(setResponseError(0 ,'Event does not exist.'));

        Object.keys(reqEvent).forEach(propName => {
            eventToUpdate[propName] = reqEvent[propName];
        })

        const { startDateTime, endDateTime } = eventToUpdate;

        if (!errors.isEmpty()) return res.status(400).json(setResponseError(0 ,errors.array()));
        else if (!isValidStartEndDate(startDateTime, endDateTime)) 
            res.status(409).json(setResponseError(0 ,'Event start date should be before end date.'));
        else { res.locals.event = eventToUpdate; next();}

    } catch (error) {
        res.status(400).json(setResponseError(1 ,error.message));
    }

}

exports.searchEventValidator = async (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    next();
}

exports.deleteEventValidator = async (req, res, next) => {

    const { eventId } = req.params;

    const event = await EventModel.findOne({ eventId });

    if (!event) return res.status(409).json(setResponseError(0 ,'Event does not exist.'));

    const isEventHaveAttendance = event.memberAttendance.length > 0;

    if (isEventHaveAttendance) return res.status(409).json(setResponseError(1 ,'Failed to delete event with attendance.'));
    else next();

}

exports.exportEventValidator = async (req, res, next) => {
    const { eventId } = req.query;

    const events = await EventModel.find({ eventId });

    if (!events) res.sendStatus(404);
    else next();
}

const isValidStartEndDate = (startDate, endDate) => {
    return startDate < endDate;
}