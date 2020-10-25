const express = require('express');
const memberController = require('../controllers/member/memberController');
const memberValidatorController = require('../controllers/member/memberValidatorController');
const { body } = require('express-validator');

const memberRouter = express.Router();

const { getMemberById, addMember, getMembers, updateMember, deleteMember, searchMember } = memberController;
const { getMemberByIdValidator, addMemberValidator, updateMemberValidator, deleteMemberValidator } = memberValidatorController;

memberRouter.get(
    '/search',
    searchMember
);

memberRouter.get('/', getMembers);

memberRouter.get('/:memberId', getMemberByIdValidator, getMemberById);

memberRouter.post('/', [
    body('name').trim().not().isEmpty(),
    body('status').trim().not().isEmpty(),
    body('joinedDate').toDate().not().isEmpty()
], addMemberValidator, addMember)

memberRouter.put('/:memberId', updateMemberValidator, updateMember);

memberRouter.delete('/:memberId',
    deleteMemberValidator,
    deleteMember);

module.exports = memberRouter;