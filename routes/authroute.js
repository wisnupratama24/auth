const express = require("express");
const router = express.Router();

const {
  validLogin,
  validRegister,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../config/validation");

// Load controllers
const {
  registerController,
  activationController,
  loginController,
} = require("../controllers/authController");

router.post("/register", validRegister, registerController);
router.post("/login", validLogin, loginController);
router.post("/activation", activationController);
module.exports = router;
