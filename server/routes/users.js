const express = require('express');
const router = express.Router();
const {
  uploadProfileImage,
  changePassword,
  changeName,
  removeUser,
} = require('../controllers/users');
const upload = require('../upload');
const {requireSignin} = require('../controllers/auth');

router.put('/profile/upload/:type', requireSignin, upload.single('file'), uploadProfileImage);


router.put('/change/name', requireSignin, changeName);
router.put('/change/password', requireSignin, changePassword);
router.delete('/remove/:userId', requireSignin, removeUser);
module.exports = router;