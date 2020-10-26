const EventModel = require("../models/eventModel");
const sortArray = require('sort-array');
const { v4: uuidv4 } = require('uuid');

class EventDataStore {

    async getEvents() {
        return await EventModel.find({})
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
    }

    async getEventWithMemberAttendance(id) {
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

    async getEventById (eventId) {
        return await EventModel.find({ eventId });
    }

    async getEventByName(eventName) {
        return await EventModel.find({ eventName });
    }

    async addEvent(event) {

        const newEvent = new EventModel({
            eventId: uuidv4()//new mongoose.Types.ObjectId()
        });

        Object.keys(event).forEach(propName => {
            newEvent[propName] = event[propName];
        });

        await newEvent.save();
    }

    async updateEvent(event) {
        await EventModel.findOneAndUpdate({ eventId: event.eventId }, event, { useFindAndModify: false });
    }

    async deleteEvent(eventId) {
        await EventModel.findOneAndDelete({ eventId }, { useFindAndModify: false });
    }

    async searchEvent(eventParam) {
        
        const { eventName, startDate, endDate } = eventParam;

        const events = await EventModel.find({}).select(['-_id', '-memberAttendance', '-__v']).exec();

        const filteredEvents = events.filter(i =>
            (
                i.eventName.toLowerCase() === (eventName || i.eventName).toLowerCase() &&
                (new Date(i.startDateTime).getTime() === new Date(startDate || i.startDateTime).getTime()) &&
                (new Date(i.endDateTime).getTime() === new Date(endDate || i.endDateTime).getTime())
            )
        );

        return filteredEvents;
    }
}

module.exports = EventDataStore;