const express = require('express');
const router = express.Router();

router.use('/user', require('./user/user'));
router.use('/admin', require('./user/admin'));
router.use('/TA', require('./user/teacher'));
router.use('/student', require('./user/student'));
// router.use('/assignment', require('./assignment/assignment'));

module.exports = router;


