const MemberModel = require("../../models/memberModel");
const setResponseError = require('../../helper/error')
const { validationResult } = require('express-validator');

exports.getMemberByIdValidator = async (req, res, next) => {
    const memberId = req.params.memberId;

    const member = await MemberModel.find({ memberId });

    if (member.length) {
        res.memberId = memberId;
        next();
    } else {
        res.status(404).json(setResponseError(0,'Member not found.'));
    }
}

exports.addMemberValidator = async (req, res, next) => {

    const { name, joinedDate, status } = req.body;

    const member = await MemberModel.find({ name });

    const memberIsExist = member.length > 0;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(setResponseError(0 ,errors.array()));
    } else if (memberIsExist) {
        res.status(409).json(setResponseError(0 ,'Member already exist.'));
    } else {
        next();
    }

}

exports.updateMemberValidator = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const errors = validationResult(req);

        const memberToUpdate = await MemberModel.findOne({ memberId });

        if (!memberToUpdate) res.status(404).json(setResponseError(0 ,'Member does not exist.'));
        else if (!errors.isEmpty()) res.status(400).json(setResponseError(0 ,errors.array()));
        else { res.locals.member = memberToUpdate; next();}

    } catch (error) {
        res.status(400).json(setResponseError(1 ,error.message));
    }
    
}

exports.deleteMemberValidator = async (req, res, next) => {
    const { memberId } = req.params;

    const member = await MemberModel.findOne({ memberId });

    if (!member)
        return res.status(409).json(setResponseError(0 ,'Member not exist.'));
        
    const isMemberHaveAttendance = member.memberAttendance.length > 0;

    if (isMemberHaveAttendance) res.status(409).json(setResponseError(0 ,'Failed to delete member with attendance.'));
    else next();

}

exports.searchMemberValidator = async (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) return res.status(400).json(setResponseError(0 ,errors.array()));

    next();
}