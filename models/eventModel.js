const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
    eventId: {
        type: String,
        required: true
    },
    eventName: {
        type: String,
        required: true,
    },
    eventType: {
        type: String,
        required: true,
    },
    startDateTime: {
        type: Date,
        required: true,
    },
    endDateTime: {
        type: Date,
        required: true,
    },
    memberAttendance: [{
        type: Schema.Types.ObjectId,
        ref: 'MemberAttendance'
    }]
});

const EventModel = mongoose.model('Event', eventSchema);

module.exports = EventModel;