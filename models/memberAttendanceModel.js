const mongoose = require('mongoose');
const { stringify } = require('uuid');
const Schema = mongoose.Schema;

const memberAttendanceSchema = new Schema({
    event: { 
        type: Schema.Types.ObjectId, ref: 'Event' 
    },
    member: {
        type: Schema.Types.ObjectId, ref: 'Member' 
    },
    attendance: {
        type: Schema.Types.ObjectId, ref: 'Attendance' 
    }
});

const MemberAttendanceModel = mongoose.model('MemberAttendance', memberAttendanceSchema);

module.exports = MemberAttendanceModel;