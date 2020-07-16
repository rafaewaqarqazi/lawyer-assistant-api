const express = require('express');
const router = express.Router();
const {
  getAllCases,
  addNewHearing
} = require('../controllers/cases');
const upload = require('../upload');
const {requireSignin} = require('../controllers/auth');

router.get('/all', getAllCases)
router.put('/add/hearing', requireSignin, addNewHearing)
// router.put('/lawyers/allow/hiring', allowHiring)
// router.post('/lawyers/hire', hireLawyer)
// router.put('/change/name', requireSignin, changeName);
// router.put('/change/password', requireSignin, changePassword);
// router.delete('/remove/:userId', requireSignin, removeUser);
// router.post('/test', testNlp);
module.exports = router;