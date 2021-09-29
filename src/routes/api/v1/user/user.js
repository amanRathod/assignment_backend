/* eslint-disable max-len */
const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const User = require('../../../../controller/api/v1/user/user');
const reset_password = require('../../../../controller/api/v1/user/reset_password');
const authenticateUserToken = require('../../../../middleware/user');

router.post('/login', [
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
], User.login);

router.post('/register', [
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
  check('name').isEmpty(),
  check('registration_no').isAlpha(),
], User.register);

router.post('/forgotPassword', [
  body('email').not().isEmpty().withMessage('Email is required'),
], reset_password.forgotPassword);

router.put('/resetPassword', [
  body('password').not().isEmpty().withMessage('Password is required'),
  body('token').not().isEmpty().withMessage('Token is required'),
], reset_password.resetPassword);

router.put('/updateProfile', authenticateUserToken, User.updateProfile);

module.exports = router;
