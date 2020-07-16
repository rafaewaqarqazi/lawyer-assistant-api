const express = require('express');
const router = express.Router();
const {
  uploadProfileImage,
  changePassword,
  changeName,
  removeUser,
  getAllLawyers,
  testNlp,
  allowHiring,
  hireLawyer
} = require('../controllers/users');
const upload = require('../upload');
const {requireSignin} = require('../controllers/auth');

router.put('/profile/upload/:type', requireSignin, upload.single('file'), uploadProfileImage);

router.get('/lawyers/all', getAllLawyers)
router.put('/lawyers/allow/hiring', allowHiring)
router.post('/lawyers/hire', hireLawyer)
router.put('/change/name', requireSignin, changeName);
router.put('/change/password', requireSignin, changePassword);
router.delete('/remove/:userId', requireSignin, removeUser);
router.post('/test', testNlp);
module.exports = router;