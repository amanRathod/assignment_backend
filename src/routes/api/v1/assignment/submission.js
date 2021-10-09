/* eslint-disable max-len */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body } = require('express-validator');
const SubmitAssignment = require('../../../../controller/api/v1/assignment/submission');
const authenticateUserToken = require('../../../../middleware/user');
const authenticateTAToken = require('../../../../middleware/TA');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, 'IMAGE-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({storage: storage});

router.post('/', upload.single('file'), [
  body('assignmentId').not().isEmpty().withMessage('Assignment ID is required'),
  // body('ta_id').not().isEmpty().withMessage('Teaching Assistant Id is required'),
], authenticateUserToken, SubmitAssignment.submit);

router.put('/evaluate', [
  body('grade').not().isEmpty().withMessage('Grade is required'),
  body('assignmentId').not().isEmpty().withMessage('assignment Id is required'),
  body('submission_status').not().isEmpty().withMessage('submission_status is required'),
], authenticateTAToken, SubmitAssignment.evaluate);

router.put('/update', upload.single('file'), authenticateUserToken, SubmitAssignment.update);

router.post('/comment', [
  body('submission_id').not().isEmpty().withMessage('assignment Id is required'),
  body('comment').not().isEmpty().withMessage('comment is requied'),
], authenticateUserToken, SubmitAssignment.comment);

router.get('/', authenticateUserToken, SubmitAssignment.getSubmission);

module.exports = router;
