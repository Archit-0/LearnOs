const express = require('express');
const { getModules, getModule, updateProgress } = require('../controllers/module/moduleController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', getModules);
router.get('/:slug', auth, getModule);
router.put('/:moduleId/progress', auth, updateProgress);

module.exports = router;
