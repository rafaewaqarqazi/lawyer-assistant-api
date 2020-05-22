const express = require('express');
const router = express.Router();
const {
  newJob,
  editJob,
  allJobs,
  deleteJob,
  applyForJob,
  changeStatusTestInterview,
  changeStatusApplication,
  scheduleTestInterview
} = require('../controllers/jobs');
const {requireSignin, isAdmin, isUser} = require('../controllers/auth');

router.post('/new', requireSignin, isAdmin, newJob);
router.put('/edit', requireSignin, isAdmin, editJob);
router.put('/delete', requireSignin, isAdmin, deleteJob);
router.put('/apply', requireSignin, isUser, applyForJob);
router.put('/schedule/testInterview', requireSignin, isAdmin, scheduleTestInterview);
router.put('/status/testInterview', requireSignin, isAdmin, changeStatusTestInterview);
router.put('/status/selectReject', requireSignin, isAdmin, changeStatusApplication);
router.get('/all', allJobs);
module.exports = router;