const express = require('express');
const auth = require('../middleware/auth');
const { body } = require('express-validator');
const {updatePreferences,updateProfile , getAchievements, addAchievement ,getProfile} =  require('../controllers/user/userController');

const router = express.Router();

router.get('/profile', auth, getProfile);

router.put('/profile', 
  auth,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('email').optional().isEmail().normalizeEmail()
  ],
  updateProfile
);

router.put('/preferences', auth, updatePreferences);

router.get('/achievements', auth, getAchievements);

router.post('/achievements', auth, addAchievement);

module.exports = router;
