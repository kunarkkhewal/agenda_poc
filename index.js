const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`SERVER STARTED ON PORT: ${PORT}`);
})

app.post('/send', async (req, res) => {
    console.log('HIT SEND ROUTE')
    res.send(200)
})
