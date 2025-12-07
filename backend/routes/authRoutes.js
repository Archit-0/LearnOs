const express = require("express");
const { validationResult } = require("express-validator");
const {
  register,
  login,
  getMe,
} = require("../controllers/auth/authController");
const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");
const auth = require("../middleware/auth");

const router = express.Router();

// Clean validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg, // Return only the FIRST error
      errors: errors.array(),
    });
  }
  next();
};

// AUTH ROUTES
router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);

// Protected route
router.get("/me", auth, getMe);

module.exports = router;
