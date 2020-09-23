const User = require("../models/authModel");
const _ = require("lodash");
const { OAuth2Client, JWT } = require("google-auth-library");
const fetch = require("node-fetch");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

// custom errror
const { errorHandler } = require("../helpers/dbErrorHandling");
const nodemailer = require("nodemailer");
const { use } = require("../routes/authroute");
const { result } = require("lodash");

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
            user: { _id, name, email, role },
          });
        }
      });
    }
  } catch (error) {}
};

exports.forgetPasswordController = (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((err) => err.msg)[0];

    return res.status(422).json({
      error: firstError,
    });
  } else {
    User.findOne({ email }).exec((err, user) => {
      if (err || user == null) {
        return res.status(404).json({
          error: "User with that email does not exist",
        });
      } else {
        const token = jwt.sign(
          {
            _id: user._id,
          },
          process.env.JWT_SECRET_RESET,
          {
            expiresIn: "10m",
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
          subject: `Reset Password on StudMe`,
          html: `
                <div width="400px" style="padding:10px; " >   
                  <p style="color:white;"> You must follow this link to reset your password: </p>
                  <br/>
                  <a href="${process.env.REACT_URL}/users/password/reset/${token}"> ${process.env.REACT_URL}/users/password/reset/${token} </a>
                  <br /> 
                  <p style="color:white;"> Have fun, and don't hesitate to contact us with your feedback</p>
                  <hr/>
                  <p style="color:white;"> StadMe Team </p>
                  <a href="${process.env.REACT_URL}"> ${process.env.REACT_URL} </a>
                </div>
                
            `,
        };

        return user.updateOne(
          {
            resetPasswordLink: token,
          },
          (err, success) => {
            if (err) {
              return res.status(404).json({
                erro: errorHandler(err),
              });
            }

            transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                return res.status(400).json({
                  error: "Something went wrong, try again",
                });
              }
              return res.json({
                message: `email has been sent to ${email}`,
              });
            });
          }
        );

        // END ELSE
      }
    });
  }
};

exports.resetPasswordController = async (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array().map((err) => err.msg)[0];

      return res.status(422).json({
        error: firstError,
      });
    } else {
      if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_SECRET_RESET, function (
          err,
          decode
        ) {
          if (err) {
            return res.status(400).json({
              error: "Expired link, try again",
            });
          } else {
            User.findOne({ resetPasswordLink }, (err, user) => {
              if (err || user === null) {
                return res.status(400).json({
                  error: "Something went wrong, try later",
                });
              } else {
                user.resetPasswordLink = "";
                user.password = newPassword;
                user.save((err, user) => {
                  if (err) {
                    console.log("Save error", errorHandler(err));
                    return res.status(401).json({
                      error: errorHandler(err),
                    });
                  } else {
                    return res.json({
                      success: true,
                      message: "Successfuly reset password",
                    });
                  }
                });
              }
            });
          }
        });
      }
    }
  } catch (error) {}
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
// Google Login
exports.googleLoginController = (req, res) => {
  const { idToken } = req.body;
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
    .then((response) => {
      const { email_verified, name, email } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { _id, email, name, role } = user;
            return res.json({
              token,
              user: { _id, email, name, role },
            });
          } else {
            let password = email + process.env.JWT_SECRET;
            user = new User({ name, email, password });
            user.save((err, data) => {
              if (err) {
                return res.status(400).json({
                  error: "User signup failed with google",
                });
              } else {
                const token = jwt.sign(
                  { _id: data._id },
                  process.env.JWT_SECRET,
                  { expiresIn: "7d" }
                );
                const { _id, email, name, role } = data;
                return res.json({
                  token,
                  user: { _id, email, name, role },
                });
              }
            });
          }
        });
      } else {
        return res.status(400).json({
          error: "Google login failed. Try again",
        });
      }
    });
};

exports.facebookLoginController = (req, res) => {
  console.log("FACEBOOK LOGIN REQ BODY", req.body);
  const { userID, accessToken } = req.body;

  const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

  return (
    fetch(url, {
      method: "GET",
    })
      .then((response) => response.json())
      // .then(response => console.log(response))
      .then((response) => {
        const { email, name } = response;
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: "7d",
            });
            const { _id, email, name, role } = user;
            return res.json({
              token,
              user: { _id, email, name, role },
            });
          } else {
            let password = email + process.env.JWT_SECRET;
            user = new User({ name, email, password });
            user.save((err, data) => {
              if (err) {
                console.log("ERROR FACEBOOK LOGIN ON USER SAVE", err);
                return res.status(400).json({
                  error: "User signup failed with facebook",
                });
              } else {
                const token = jwt.sign(
                  { _id: data._id },
                  process.env.JWT_SECRET,
                  { expiresIn: "7d" }
                );
                const { _id, email, name, role } = data;
                return res.json({
                  token,
                  user: { _id, email, name, role },
                });
              }
            });
          }
        });
      })
      .catch((error) => {
        res.json({
          error: "Facebook login failed. Try later",
        });
      })
  );
};
