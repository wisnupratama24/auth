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
} = require("../controllers/authController.js");

router.post("/register", registerController);
router.post("/activation", activationController);
module.exports = router;
