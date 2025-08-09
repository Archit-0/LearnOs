const { body } = require('express-validator');

const passwordValidator = ".matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)"
exports.registerValidator = [
  body('name').notEmpty().trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 6 })

];

exports.loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];
