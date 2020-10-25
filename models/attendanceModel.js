const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
    attendanceId:  {
        type: String,
        required: true
    },
    timeIn: {
        type: Date,
        required: true
    },
    timeOut: {
        type: Date,
        required: false
    },
    memberAttendance: {
        type: Schema.Types.ObjectId,
        ref: 'MemberAttendance'
    }
});

const AttandanceModel = mongoose.model('Attendance', attendanceSchema);

module.exports = AttandanceModel;
