const dateFormat = require('dateformat');
const ExcelExportService = require('../../ExcelExportService');
const loggerEvent = require('../../events/logEvent');
const getRequestBodyContentString = require('../../helper/getRequestBodyContentString');
const EventDataStore = require('../../datastore/EventDataStore');
const setResponseError = require('../../helper/error');

const { 
    getEvents, 
    getEventWithMemberAttendance, 
    addEvent,
    updateEvent,
    deleteEvent,
    searchEvent 
} = new EventDataStore();

exports.getEvents = async (req, res) => {

    const events = await getEvents();

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

        addEvent(event);

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

    await updateEvent(event);

    loggerEvent.emit('logger', {
        endPointName: 'updateEvent',
        requestBody: `${getRequestBodyContentString(req.params)} ${getRequestBodyContentString(req.body)}`,
        status: 'success'
    });

    res.sendStatus(200);
}

exports.deleteEvent = async (req, res) => {

    const eventId = req.params.eventId;

    deleteEvent(eventId);

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

        const filteredEvents = await searchEvent(req.query);

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


