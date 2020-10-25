const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
    memberId:  {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    joinedDate: {
        type: Date,
        required: false
    },
    status: {
        type: Number,
        required: true
    },
    memberAttendance: [{
        type: Schema.Types.ObjectId,
        ref: 'MemberAttendance'
    }]
});

const MemberModel = mongoose.model('Member', memberSchema);

module.exports = MemberModel;
