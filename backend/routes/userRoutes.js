const express = require("express");
const auth = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const {
  updatePreferences,
  updateProfile,
  getAchievements,
  addAchievement,
  getProfile,
} = require("../controllers/user/userController");

const router = express.Router();

// Validation Handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// -----------------------
// USER PROFILE ROUTES
// -----------------------
router.get("/profile", auth, getProfile);

router.put(
  "/profile",
  auth,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2–100 characters."),

    body("email")
      .optional()
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
  ],
  validate,
  updateProfile
);

// -----------------------
// USER PREFERENCES ROUTE
// -----------------------
router.put("/preferences", auth, updatePreferences);

// -----------------------
// ACHIEVEMENTS ROUTES
// -----------------------
router.get("/achievements", auth, getAchievements);

router.post(
  "/achievements",
  auth,
  [body("title").notEmpty().withMessage("Achievement title is required.")],
  validate,
  addAchievement
);

module.exports = router;
