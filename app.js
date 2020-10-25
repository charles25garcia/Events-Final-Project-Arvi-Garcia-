const express = require('express');
const dotenv = require('dotenv');
const connect = require('./db');
const eventRouter = require('./routers/eventRouter');
const memberRouter = require('./routers/memberRouter');
const attendanceRounter = require('./routers/attendanceRouter');
//  const EventModel = require('./models/eventModel');

const app = express();

dotenv.config({ path: './config/config.env' });
connect();

const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/events', eventRouter);
app.use('/api/members', memberRouter);
app.use('/api/attendance', attendanceRounter);

app.get('/', (req, res, next) => {
    res.send({
        message: 'Hello NodeJs Masters!'
    });
});

app.listen(port, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port: ${port}`);
});