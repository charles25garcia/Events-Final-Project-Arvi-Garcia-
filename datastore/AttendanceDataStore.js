const AttendanceModel = require('../models/attendanceModel');
const EventModel = require('../models/eventModel');
const MemberAttendanceModel = require('../models/memberAttendanceModel');
const { v4: uuidv4 } = require('uuid');
const MemberModel = require('../models/memberModel');

class AttendanceDataStore {
    async getAllAttendance() {
        return await AttendanceModel.find({}).select('-_id -__v -memberAttendance');
    }

    async addAttendance(attendance, member, event) {
        const newAttendance = new AttendanceModel({
            attendanceId: uuidv4()
        });

        Object.keys(attendance).forEach(propName => {
            newAttendance[propName] = attendance[propName];
        });

        await newAttendance.save(async () => {

            const newMemberAttendance = new MemberAttendanceModel({
                event: event._id,
                member: member._id,
                attendance: newAttendance._id
            });

            await newMemberAttendance.save(async () => {

                const eventToUpdate = await EventModel.findOne({ _id: event.id });

                const memberToUpdate = await MemberModel.findOne({ _id: member.id });

                eventToUpdate.memberAttendance.push(newMemberAttendance._id);

                memberToUpdate.memberAttendance.push(newMemberAttendance._id);

                newAttendance.memberAttendance = newMemberAttendance._id;

                await EventModel.findOneAndUpdate({ _id: eventToUpdate._id }, eventToUpdate, { useFindAndModify: false });

                await MemberModel.findOneAndUpdate({ _id: memberToUpdate._id }, memberToUpdate, { useFindAndModify: false });

                await AttendanceModel.findOneAndUpdate({ attendanceId: newAttendance.attendanceId }, { memberAttendance: newMemberAttendance._id }, { useFindAndModify: false });

            });
        });

    }

    async updateAttendance(attendance) {
        await AttendanceModel.findOneAndUpdate({ attendanceId: attendance.attendanceId }, attendance, { useFindAndModify: false });
    }

    async deleteAttendance(attendanceId) {
        const attendance = await AttendanceModel.findOne({ attendanceId });

        const memberAttendance = await MemberAttendanceModel.findOne({ _id: attendance.memberAttendance });

        const event = await EventModel.findOne({ _id: memberAttendance.event });

        event.memberAttendance = [...event.memberAttendance.filter(i => i.toString() != memberAttendance._id.toString())];

        const member = await MemberModel.findOne({ _id: memberAttendance.member });

        member.memberAttendance = [...member.memberAttendance.filter(i => i.toString() != memberAttendance._id.toString())];

        await MemberAttendanceModel.findOneAndDelete({ _id: memberAttendance._id });

        await AttendanceModel.findOneAndDelete({ attendanceId }, { useFindAndModify: false });

        await EventModel.findOneAndUpdate({ _id: event._id }, {
            memberAttendance: event.memberAttendance
        }, { useFindAndModify: false });

        await MemberModel.findOneAndUpdate({ _id: member._id }, {
            memberAttendance: member.memberAttendance
        }, { useFindAndModify: false });

    }
}

module.exports = AttendanceDataStore;