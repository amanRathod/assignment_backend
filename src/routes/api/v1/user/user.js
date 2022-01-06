/* eslint-disable max-len */
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { check, body } = require('express-validator');
const User = require('../../../../controller/api/v1/user/user');
const reset_password = require('../../../../controller/api/v1/user/reset_password');
const authenticateUserToken = require('../../../../middleware/user');
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, 'IMAGE-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({storage: storage});

router.post('/login', [
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
], User.login);

router.post('/register', [
  check('email').isEmail(),
  check('password').isLength({ min: 8 }),
  check('name').isEmpty(),
], User.register);

router.post('/forgotPassword', [
  body('email').not().isEmpty().withMessage('Email is required'),
], reset_password.forgotPassword);

router.put('/resetPassword', [
  body('password').not().isEmpty().withMessage('Password is required'),
  body('token').not().isEmpty().withMessage('Token is required'),
], reset_password.resetPassword);

router.put('/updateProfile', upload.single('file'), authenticateUserToken, User.updateProfile);
router.post('/updateGoogleProfile', authenticateUserToken, User.updateGoogleProfile);

module.exports = router;
