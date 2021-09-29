const express = require('express');
const router = express.Router();
const Student = require('../../../../controller/api/v1/user/student');
const authenticateUserToken = require('../../../../middleware/user');

router.get('/', authenticateUserToken, Student.getStudentData);

module.exports = router;
