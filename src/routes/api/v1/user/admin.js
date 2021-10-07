/* eslint-disable max-len */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const Admin = require('../../../../controller/api/v1/user/admin');
const authenticateAdminToken = require('../../../../middleware/admin');

router.post('/student_to_TA', [
  body('student_ids').not().isEmpty().withMessage('students id is required'),
  body('ta_id').not().isEmpty().withMessage('TA id is required'),
], authenticateAdminToken, Admin.assignStudentToTA);

router.post('/remove-student', [
  body('student_ids').not().isEmpty().withMessage('Student id is required'),
  body('ta_id').not().isEmpty().withMessage('TA id is required'),
], authenticateAdminToken, Admin.removeStudent);

router.get('/TA', authenticateAdminToken, Admin.getAllTA);
router.get('/student', authenticateAdminToken, Admin.getAllStudents);

router.get('/', authenticateAdminToken, Admin.getTAData);

module.exports = router;
