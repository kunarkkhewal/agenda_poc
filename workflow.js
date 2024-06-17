const { agenda } = require('./agendaInit');


const printConsole = () => {
    console.log('Time is : ', new Date());
};

(async function () {
    try {

        // Define the job
        agenda.define('send message', async (job) => {
            console.log(' ---- job.attrs => ', job.attrs);
            const { message, recipient } = job.attrs.data;
            console.log(`Sending message: "${message}" to ${recipient}`);
            printConsole();
            // Here you would implement your actual message sending logic, e.g., using an email or SMS service
        });

        // Start Agenda
        await agenda.start();
        console.log('Agenda started');

        // Create and schedule the job
        const job1 = agenda.create('send message', { message: 'Hello, world!', recipient: 'user@example.com' });
        await job1.repeatEvery('in 5 seconds');
        await job1.save();

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
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
})();
