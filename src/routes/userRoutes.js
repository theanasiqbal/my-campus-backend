const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body } = require('express-validator');

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
];

const loginPhoneValidation = [
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
];

const loginEmailValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

// All routes are public (no authentication)
router.post('/register', registerValidation, userController.register);
router.post('/login/phone', loginPhoneValidation, userController.loginWithPhone);
router.post('/login/email', loginEmailValidation, userController.loginWithEmail);
router.get('/check-phone/:phone', userController.checkPhone);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateProfile);

module.exports = router;