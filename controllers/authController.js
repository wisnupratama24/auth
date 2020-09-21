const User = require("../models/authModel");
const expressJwt = require("express-jwt");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

// custom errror
const { errorHandler } = require("../helpers/dbErrorHandling");
const nodemailer = require("nodemailer");
const { use } = require("../routes/authroute");

exports.registerController = (req, res) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((err) => err.msg)[0];

    return res.status(422).json({
      error: firstError,
    });
  } else {
    User.findOne({
      email,
    }).exec((err, user) => {
      if (user) {
        return res.status(400).json({
          error: "Email has taken",
        });
      }
    });

    // generate token
    const token = jwt.sign(
      {
        name,
        email,
        password,
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: "1h",
      }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: "Dewisavitri:*1",
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Confirm your account on StudMe`,
      html: `
            <div width="400px" style="padding:10px; " >   
              <p style="color:white;"> Thanks for signing up with StudMe! You must follow this link to activate your account: </p>
              <br/>
              <a href="${process.env.REACT_URL}/users/activate/${token}"> ${process.env.REACT_URL}/users/activate/${token} </a>
              <br /> 
              <p style="color:white;"> Have fun, and don't hesitate to contact us with your feedback</p>
              <hr/>
              <p style="color:white;"> StadMe Team </p>
              <a href="${process.env.REACT_URL}"> ${process.env.REACT_URL} </a>
            </div>
            
        `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) throw err;
      return res.json({
        message: `email has been sent to ${email}`,
      });
    });
  }
};

exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
      if (err) {
        console.log("Activation error");
        return res.status(401).json({
          errors: "Expired link. Signup again",
        });
      } else {
        const { name, email, password } = jwt.decode(token);

        console.log(email);
        const user = new User({
          name,
          email,
          password,
        });

        user.save((err, user) => {
          if (err) {
            console.log("Save error", errorHandler(err));
            return res.status(401).json({
              errors: errorHandler(err),
            });
          } else {
            return res.json({
              success: true,
              message: user,
              message: "Signup success",
            });
          }
        });
      }
    });
  } else {
    return res.json({
      message: "error happening please try again",
    });
  }
};

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array().map((err) => err.msg)[0];
      return res.status(422).json({
        error: firstError,
      });
    } else {
      User.findOne({
        email,
      }).exec((err, user) => {
        if (err || user == null) {
          return res.status(400).json({
            error: "User with that email does not exist. Please signup",
          });
        } else {
          // // Authenticate
          if (!user.authenticate(password)) {
            return res.status(400).json({
              error: "Email and password don't match",
            });
          }
          // Generate token
          const token = jwt.sign(
            {
              _id: user._id,
            },
            process.env.JWT_SECRET,
            {
              expiresIn: "7d",
            }
          );
          const { _id, name, email, role } = user;
          return res.json({
            message: `Welcome, ${name}`,
            token,
            _id,
            name,
            email,
            role,
          });
        }
      });
    }
  } catch (error) {}
};
