const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB =require('./config/db');
const app = express();

// connect db
require('dotenv').config({
    path : './config/config.env'
})

connectDB();


app.use(bodyParser.json())

// config for only development

if(process.env.NODE_ENV === 'development'){
    app.use(cors({
        origin:process.env.CLIENT_URL
    }))
    app.use(morgan('dev'))
    // morgan give information about each request
    // cors it's allow to deal
}

// Load all routes

const authRouter = require('./routes/authroute');

app.use('/api/', authRouter);


app.use((req,res,next) => {
    res.status(404).json({
        success : false,
        message : 'page not found'
    })
})
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`app listening on port ${PORT}`)
})