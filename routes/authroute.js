const express = require('express');
const router = express.Router();

// Load controllers

const {
    registerController
} = require('../controllers/authController.js')

router.post('/register', registerController);
module.exports = router;

