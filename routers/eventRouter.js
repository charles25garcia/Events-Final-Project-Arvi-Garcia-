const express = require('express');
const eventController = require('../controllers/event/eventController');
const eventValidatorController = require('../controllers/event/eventValidatorController');
const { body } = require('express-validator');

const eventRouter = express.Router();

const { searchEvent, exportEvent, getEvents, getEventById, addEvent, updateEvent, deleteEvent } = eventController;
const { searchEventValidator, exportEventValidator, getEventByIdValidator, addEventValidator, deleteEventValidator, updateEventValidator } = eventValidatorController;

eventRouter.get(
    '/search',
    searchEventValidator,
    searchEvent
);

eventRouter.get('/export', [ body('eventId').trim().not().isEmpty() ], exportEventValidator, exportEvent);

eventRouter.get('/', getEvents);

eventRouter.get('/:eventId', getEventByIdValidator, getEventById);

eventRouter.post('/', [
    body('eventName').trim().not().isEmpty(),
    body('eventType').trim().not().isEmpty(),
    body('startDateTime').toDate().not().isEmpty(),
    body('endDateTime').toDate().not().isEmpty(),
],
    addEventValidator,
    addEvent
    );

eventRouter.put('/:eventId', updateEventValidator, updateEvent);

eventRouter.delete('/:eventId',
    deleteEventValidator,
    deleteEvent);

module.exports = eventRouter;