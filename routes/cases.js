const express = require('express');
const router = express.Router();
const {
  getAllCases,
  addNewHearing,
  changeHearingStatus
} = require('../controllers/cases');
const upload = require('../upload');
const {requireSignin} = require('../controllers/auth');

router.get('/all', getAllCases)
router.put('/hearing/add', requireSignin, addNewHearing)
router.put('/hearing/status', requireSignin, changeHearingStatus)
// router.put('/lawyers/allow/hiring', allowHiring)
// router.post('/lawyers/hire', hireLawyer)
// router.put('/change/name', requireSignin, changeName);
// router.put('/change/password', requireSignin, changePassword);
// router.delete('/remove/:userId', requireSignin, removeUser);
// router.post('/test', testNlp);
module.exports = router;