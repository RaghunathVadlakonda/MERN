require('dotenv').config()
const express = require('express');
const connectDB = require('./config/db');
const UserRoutes = require('./routes/api/users');
const AuthRoutes = require('./routes/api/auth');
const ProfileRoutes = require('./routes/api/profile');
const PostsRoutes = require('./routes/api/posts');

const app = express();

connectDB();

const PORT = process.env.PORT;

// body parser for allowed to data from body..
app.use(express.json({extended:false}))

app.get('/', (req, res) => {
    res.send("Home! This is sample.");
});

app.use('/api/users', UserRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/posts', PostsRoutes);
app.use('/api/profile', ProfileRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});