const User = require('../models/authModel');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const {OAuth2Client} = require('google-auth-library');
const fetch = require('node-fetch');
const {validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// custom errror 
const {errorHandler} = require('../helpers/dbErrorHandling');

const sgMail = require('@sendgrid/mail');



exports.registerController = (req,res) =>  {
    const { name, email, password } = req.body;
    
}