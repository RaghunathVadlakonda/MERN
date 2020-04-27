// mongoose to connect with the MongoDB Database.
const mongoose = require('mongoose');

// config folder created for mention global variables. 
const config = require('config');

const db = config.get('mongoURI');

// Using async and await here

const connectDB = async () => {
    try {
        await mongoose.connect(db,{
            useNewUrlParser:true,  
            useUnifiedTopology:true, 
            useCreateIndex:true, 
            useFindAndModify: false});

        console.log("Successfully connected to MongoDB.");
    } catch(err)
    {
        console.error(err.message);
        process.exit(1);

    }
};

module.exports = connectDB;