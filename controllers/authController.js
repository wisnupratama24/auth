const User = require('../models/authModel');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const {OAuth2Client} = require('google-auth-library');
const fetch = require('node-fetch');
const {validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

// custom errror 
const {errorHandler} = require('../helpers/dbErrorHandling');
const nodemailer = require('nodemailer');



exports.registerController = (req,res) =>  {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const firstError = error.array().map(err => err.msg)[0];

        return res.status(422).json({
            error : firstError
        })
    } else {
        User.findOne({
            email
        }).exec((err, user) => {
            if(user){
                return res.status(400).json({
                    error : "Email has taken"
                })
            }
        })

        // generate token

        const token = jwt.sign(
            {
                name, 
                email,
                password
            },
            process.env.JWT_ACCOUNT_ACTIVATION,
            {
                expiresIn : "15m"
            }
        )

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'pratamag983@gmail.com',
                pass: 'Dewisavitri:*1'
            }
        });

        const mailOptions = {
            from: 'pratamag983@gmail.com',
            to: 'wisnuputrapratama24@gmail.com',
            subject :  `Activate your account`,
            html : `
            <h1> Please click to link to activate</h1>
            <a href="${process.env.CLIENT_URL}/users/activate/${token}"> click this to activate your account </a>
            <hr/>

            <p> ${process.env.CLIENT_URL}</p>
        `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) throw err;
            return res.json({
                message : `email has been sent to ${email}`
            })
        });
    }
    
}