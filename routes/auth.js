const express = require('express');
const {userById} = require("../controllers/users");
const {
  register,
  createAdmin,
  editProfile,
  login,
  getUser,
  forgotPassword,
  resetPassword,
  registerAdmin,
  editProfileImage,
  changePassword,
  getAllAdmins,
  requireSignin,
  isAdmin,
  removeAdmin
} = require('../controllers/auth');
const router = express.Router();
const upload = require('../upload')
router.get('/:userId', getUser);
router.post('/register', register);
router.put('/profile/edit', editProfile);
router.put('/profile/image/:type', upload.single('image'), editProfileImage);
router.post('/lawyer/register', registerAdmin);
router.post('/login', login);
router.put('/forgot-password', forgotPassword);
router.put('/change-password', changePassword);
router.put('/reset-password', resetPassword);
router.get('/admins/all', requireSignin, isAdmin, getAllAdmins);
router.put('/admins/remove', requireSignin, isAdmin, removeAdmin);
router.post('/admins/create', requireSignin, isAdmin, createAdmin);

router.param("userId", userById);
module.exports = router;