// routes/progressRoutes.js
const express = require('express');
const auth = require('../middleware/auth');
const { getDashboard,updateInsights,getModuleProgress} = require('../controllers/progress/progressController');

const router = express.Router();

router.get('/dashboard', auth, getDashboard);
router.get('/module/:moduleId', auth, getModuleProgress);
router.put('/insights/:moduleId', auth, updateInsights);

module.exports = router;
