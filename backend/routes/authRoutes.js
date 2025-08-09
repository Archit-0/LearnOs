const express = require('express');
const { validationResult } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');

const router = express.Router();

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', getMe);

module.exports = router;
