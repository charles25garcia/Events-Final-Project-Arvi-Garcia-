const EventEmitter = require('events');
const LogCreator = require('../helper/LogCreator')
const leggerEvent = new EventEmitter();
const dateFormat = require('dateformat');

const logger = (logData) => {

    const logCreator = new LogCreator();
    
    const currentDate = new Date();

    const fileName = `AttendanceMonitoringLogs-${dateFormat(currentDate, 'yyyy-mm-dd')}.txt`;

    const logContent = `${dateFormat(currentDate, 'h:MM:ss TT')}:::::: EndPoint [${logData.endPointName}] :::::: RequestBody [${logData.requestBody}] :::::: Status [${logData.status}]`;

    logCreator.createFile(fileName,logContent);
}



leggerEvent.on('logger', logger);

module.exports = leggerEvent;