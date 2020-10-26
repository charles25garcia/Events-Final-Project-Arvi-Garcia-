const MemberModel = require('../models/memberModel');
const sortArray = require('sort-array');
const { v4: uuidv4 } = require('uuid');

class MemberDataStore {

    async getMembers() {
        const members = await MemberModel.find({}).select('-memberAttendance -_id -__v').exec();

        return members.map(
            i => ({
                memberId: i.memberId,
                name: i.name,
                status: (i.status > 0 ? memberStatus.active : memberStatus.inactive),
                joinedDate: i.joinedDate
            })
        )
    }

    async getMemberWithEventAndAttendance(id) {

        const member = await MemberModel.findOne({ memberId: id })
            .select('-_id -__v')
            .populate(
                {
                    path: 'memberAttendance',
                    select: '-_id -__v -member',
                    populate: {
                        path: 'event',
                        select: 'eventName -_id'
                    }
                }
            )
            .populate(
                {
                    path: 'memberAttendance',
                    select: '-_id -__v -member',
                    populate: {
                        path: 'attendance',
                        select: '-_id -__v -attendanceId -memberAttendance'
                    }
                }
            )
            .exec();

        const { memberId, status, joinedDate, name, memberAttendance } = member;

        return {
            memberId,
            name,
            status: status === 0 ? memberStatus.active : memberStatus.inactive,
            joinedDate,
            eventAttendance: sortArray(memberAttendance.map(i => ({
                eventName: i.event.eventName,
                timeIn: i.attendance.timeIn,
                timeOut: i.attendance.timeOut
            })), {
                by: 'timeIn',
                order: 'asc'
            })
        }
    }

    async addMember(member) {
        const newMember = new MemberModel({
            memberId: uuidv4()
        });

        Object.keys(member).forEach(propName => {
            newMember[propName] = member[propName];
        });

        await newMember.save();
    }

    async updateMember(member) {
        await MemberModel.findOneAndUpdate({ memberId: member.memberId }, member, { useFindAndModify: false });
    }

    async deleteMember(memberId) {
        await MemberModel.findOneAndDelete({ memberId }, { useFindAndModify: false });
    }

    async getMemberByNameOrStatus (reqMember) {
        const { name, status } = reqMember;

        const members = await MemberModel.find({}).select('-memberAttendance -_id -__v').exec();

        const filteredMembers = members.filter(i =>
            (i.name.toLowerCase() === (name || i.name).toLowerCase() &&
            (i.status > 0 ? memberStatus.active: memberStatus.inactive).toLowerCase() === (status || (i.status > 0 ? memberStatus.active: memberStatus.inactive)).toLowerCase())
        ).map(
            i => ({
                memberId: i.memberId,
                name: i.name,
                status:  (i.status > 0 ? memberStatus.active: memberStatus.inactive),
                joinedDate: i.joinedDate
            })
        );

        return filteredMembers;

    }
}

const memberStatus = Object.freeze({
    active: "Active",
    inactive: "In-active"
});

module.exports = MemberDataStore;