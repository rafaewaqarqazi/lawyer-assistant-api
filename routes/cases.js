const express = require('express');
const router = express.Router();
const {
  getAllCases,
  addNewHearing,
  changeHearingStatus,
  completeCase
} = require('../controllers/cases');
const upload = require('../upload');
const {requireSignin} = require('../controllers/auth');

router.get('/all', getAllCases)
router.put('/hearing/add', requireSignin, addNewHearing)
router.put('/hearing/status', requireSignin, changeHearingStatus)
router.put('/complete', requireSignin, completeCase)
module.exports = router;