/* eslint-disable max-len */
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { body } = require('express-validator');
const Assignment = require('../../../../controller/api/v1/assignment/assignment');
const authenticateAdminToken = require('../../../../middleware/admin');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, 'IMAGE-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({storage: storage});

router.post('/create', upload.single('file'), [
  body('title').not().isEmpty().withMessage('Title is required'),
  body('description').not().isEmpty().withMessage('Description is required'),
  body('dueDate').not().isEmpty().withMessage('Due date is required'),
  body('startDate').not().isEmpty().withMessage('Start Date is required'),
  body('totalMarks').not().isEmpty().withMessage('Total marks is required'),
], authenticateAdminToken, Assignment.createAssignment);

router.post('/assign-to-TA', [
  body('ta_id').not().isEmpty().withMessage('TA id is required'),
  body('assignmentId').not().isEmpty().withMessage('assignment id is required'),
], authenticateAdminToken, Assignment.assignedAssignment);

router.put('/update', upload.single('file'), [
  body('assignmentId').not().isEmpty().withMessage('assignment Id is required'),
], authenticateAdminToken, Assignment.updateAssignment);

router.put('/delete', [
  body('assignmentId').not().isEmpty().withMessage('assignment Id is required'),
], authenticateAdminToken, Assignment.deleteAssignment);


module.exports = router;
