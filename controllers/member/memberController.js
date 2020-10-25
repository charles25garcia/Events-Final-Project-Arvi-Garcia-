const MemberModel = require('../../models/memberModel');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const loggerEvent = require('../../events/logEvent');
const c = require('sort-array');
const sortArray = require('sort-array');
const { stat } = require('fs');
const getRequestBodyContentString = require('../../helper/getRequestBodyContentString');
const setResponseError = require('../../helper/error');

exports.getMembers = async (req, res) => {

    const members = await MemberModel.find({}).select('-memberAttendance -_id -__v').exec();

    loggerEvent.emit('logger', {
        endPointName: 'getMembers',
        requestBody: 'none',
        status: 'success'
    });
    
    res.send(members.map(
        i => ({
            memberId: i.memberId,
            name: i.name,
            status:  (i.status > 0 ? memberStatus.active: memberStatus.inactive),
            joinedDate: i.joinedDate
        })
    ));

}

exports.getMemberById = async (req, res) => {

    const memberId = req.params.memberId;

    const member = await getMemberWithEventAndAttendance(memberId);

    loggerEvent.emit('logger', {
        endPointName: 'getMemberById',
        requestBody: `memberId=${memberId}`,
        status: 'success'
    });

    res.send(member);

}

exports.addMember = async (req, res) => {
    const member = req.body;
    let status = '';

    try {
        const newMember = new MemberModel({
            memberId: uuidv4()//new mongoose.Types.ObjectId()
        });

        Object.keys(member).forEach(propName => {
            newMember[propName] = member[propName];
        });

        await newMember.save();
        status = 'success';

        res.sendStatus(201);

    } catch (error) {
        status = 'failed';
        res.status(400).json(setResponseError(1 ,error.message));
    }

    loggerEvent.emit('logger', {
        endPointName: 'addMember',
        requestBody: getRequestBodyContentString(member),
        status: status
    });

}

exports.updateMember = async (req, res) => {
    const { member } = res.locals;

    await MemberModel.findOneAndUpdate({ memberId: member.memberId }, member, { useFindAndModify: false });

    loggerEvent.emit('logger', {
        endPointName: 'updateMember',
        requestBody: `${getRequestBodyContentString(req.params)} ${getRequestBodyContentString(req.body)}`,
        status: 'success'
    });

    res.sendStatus(200);
}

exports.deleteMember = async (req, res) => {

    const { memberId } = req.params;

    await MemberModel.findOneAndDelete({ memberId }, { useFindAndModify: false });

    loggerEvent.emit('logger', {
        endPointName: 'deleteMember',
        requestBody: getRequestBodyContentString(req.params),
        status: 'success'
    });

    res.sendStatus(200);
}

exports.searchMember = async (req, res) => {

    let loggerStatus = '';
    try {
        const { name, status } = req.query;

        const members = await MemberModel.find({}).select(['-_id', '-memberAttendance', '-__v']).exec();

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

        loggerStatus = 'success';

        if (filteredMembers.length === 0)
            res.status(404).json(setResponseError(1 ,'Not found.'));
        else
            res.send(filteredMembers);

    } catch (error) {
        res.status(400).json(setResponseError(1 ,errors.message));;
        loggerStatus = 'failed';
    }

    loggerEvent.emit('logger', {
        endPointName: 'searchMember',
        requestBody: getRequestBodyContentString(req.query),
        status: loggerStatus
    });
}

const memberStatus = Object.freeze({
    active:   "Active",
    inactive:  "In-active"
});

const getMemberWithEventAndAttendance = async (id) => {

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
        status: status === 0 ? memberStatus.active: memberStatus.inactive,
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