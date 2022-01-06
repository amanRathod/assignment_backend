const express = require('express');
const router = express.Router();
const TA = require('../../../../controller/api/v1/user/TA');
const authenticateTAToken = require('../../../../middleware/TA');

router.get('/assignStudents', authenticateTAToken, TA.getAssignStudents);

router.get('/', authenticateTAToken, TA.getTAData);
module.exports = router;
