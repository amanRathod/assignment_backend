/* eslint-disable max-len */
const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const User = require('../../../../controller/api/v1/user/user');
const reset_password = require('../../../../controller/api/v1/user/reset_password');
const authenticateUserToken = require('../../../../middleware/user');



module.exports = router;
