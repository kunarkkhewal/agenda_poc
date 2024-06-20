const { agenda } = require('./agendaInit');
const amqplib = require('amqplib');
const moment = require('moment');
const { ObjectId } = require('mongodb');

const opt = {
    credentials: amqplib.credentials.plain(
        process.env.RABBIT_MQ_USERNAME,
        process.env.RABBIT_MQ_PASSWORD
    ),
};

const sendToQueue = async (data) => {
    const queueName = 'scheduler-queue-kunark';
    const connection = await amqplib.connect(process.env.RABBIT_MQ_HOST, opt);
    const channel = await connection.createChannel();

    try {
        // logger.info(`inside sendCheckStatusApptsToQueue`);
        await channel.assertQueue(queueName, { durable: true });
        const optional = { persistent: true };
        await channel.sendToQueue(
            queueName,
            Buffer.from(JSON.stringify(data)),
            optional
        );
    } catch (error) {
        console.log(' ----- Error : ', error);
        // logger.warning(`error in sendCheckStatusApptsToQueue: ${error}`);
    } finally {
        await channel.close();
        await connection.close();
    }
};

// const printConsole = () => {
//     console.log('Time is : ', new Date());
// };

const sendThrottleJobToQueue = async (message, time) => {
    const jobName = 'send scheduled message to queue'
    try {
         // Define the job
        agenda.define(jobName, async (job) => {
            const message = job.attrs.data;
            console.log(`Sending message: "${message}"`);
            await sendToQueue(message);
        });

        // Start Agenda
        await agenda.start();
        console.log('Agenda started');

        // Create and schedule the job
        const job = agenda.create(jobName, message);
        await job.schedule(time);
        await job.save();
        const jobId = job.attrs._id.toString()
        console.log('-jobId => ', jobId)
        console.log('Job scheduled');

        // Graceful shutdown
        const graceful = () => {
            console.log(' --- stopping gracefully');
            agenda.stop(() => {
                process.exit(0);
            });
        };

        process.on('SIGTERM', graceful);
        process.on('SIGINT', graceful);

        return jobId;
    } catch (error) {
        // console.log('Error in define job')
        console.error('Error:', error);
        process.exit(1);
    }
}

const deleteJobById = async (jobIds) => {
    try {
        // Convert jobId to ObjectId
        // const objectId = new ObjectId(jobId);
        const objectIds = jobIds.map(id => new ObjectId(id));

        console.log(' --- objectId => ', objectIds)

        // Cancel the job
        const numRemoved = await agenda.cancel({ _id: {$in: objectIds} });
        console.log(`Number of jobs cancelled: ${numRemoved}`);

        // Graceful shutdown
        const graceful = () => {
            console.log(' --- stopping gracefully');
            agenda.stop(() => {
                client.close(); // Close MongoDB connection
                process.exit(0);
            });
        };

        process.on('SIGTERM', graceful);
        process.on('SIGINT', graceful);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

(async function() {
    const time = moment().add(1, 'minute').toDate();
    const message = {
        applicationProperties: {
            type: 'message type'
        },
        body: {
            practiceId: 1,
            workflowId: 1,
            workflowName: 'test reminder',
            triggerConfigId: 1,
            jobTriggerTime: time,
            currentDate: new Date(),
            timezone: 'utc',
            fileName: 'utc/timezone',
            appointmentsCount: 1,
            fileNameWithArrivalDate: moment().format(),
            triggeredFrom: 'poc file',
        },
    };

    const jobId1 = await sendThrottleJobToQueue(message, time)
    const jobId2 = await sendThrottleJobToQueue( {message: "bye bye"}, moment().add(2, 'minute').toDate())

    setTimeout(async () => {
        await deleteJobById([jobId1, jobId2])
    }, 20000)
})()

