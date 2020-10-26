const loggerEvent = require('../../events/logEvent');
const getRequestBodyContentString = require('../../helper/getRequestBodyContentString');
const setResponseError = require('../../helper/error');
const MemberDataStore = require('../../datastore/MemberDataStore');

const { 
    getMembers, 
    getMemberWithEventAndAttendance,
    addMember,
    updateMember,
    deleteMember,
    getMemberByNameOrStatus 
} = new MemberDataStore();

exports.getMembers = async (req, res) => {

    const members = await getMembers();

    loggerEvent.emit('logger', {
        endPointName: 'getMembers',
        requestBody: 'none',
        status: 'success'
    });
    
    res.send(members);

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
        
        await addMember(member);

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
    
    await updateMember(member);

    loggerEvent.emit('logger', {
        endPointName: 'updateMember',
        requestBody: `${getRequestBodyContentString(req.params)} ${getRequestBodyContentString(req.body)}`,
        status: 'success'
    });

    res.sendStatus(200);
}

exports.deleteMember = async (req, res) => {

    const { memberId } = req.params;

    await deleteMember(memberId);

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
        const filteredMembers = await getMemberByNameOrStatus(req.query);

        loggerStatus = 'success';

        if (filteredMembers.length === 0)
            res.status(404).json(setResponseError(1 ,'Not found.'));
        else
            res.send(filteredMembers);

    } catch (error) {
        res.status(400).json(setResponseError(1 ,error.message));;
        loggerStatus = 'failed';
    }

    loggerEvent.emit('logger', {
        endPointName: 'searchMember',
        requestBody: getRequestBodyContentString(req.query),
        status: loggerStatus
    });
}

