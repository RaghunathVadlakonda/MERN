require('dotenv').config()
const express = require('express');
const connectDB = require('./config/db');
const app = express();

connectDB();

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send("Home! This is sample.");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});