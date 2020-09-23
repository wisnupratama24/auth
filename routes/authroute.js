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
  forgetPasswordController,
  resetPasswordController,
  googleLoginController,
  facebookLoginController,
} = require("../controllers/authController");

router.post("/register", validRegister, registerController);
router.post("/login", validLogin, loginController);
router.post("/activation", activationController);
router.post("/forget", forgotPasswordValidator, forgetPasswordController);
router.put("/reset", resetPasswordValidator, resetPasswordController);
router.post("/googlelogin", googleLoginController);
router.post("/facebooklogin", facebookLoginController);
module.exports = router;
