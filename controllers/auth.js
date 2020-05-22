const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');
require('dotenv').config();
const User = require('../models/users');
const {sendEmail} = require("../helpers");
const generator = require('generate-password');
exports.register = async (req, res) => {

  try {
    const body = JSON.parse(req.body.data)
    const userExists = await User.findOne({email: body.email});
    if (userExists) return res.json({
      success: false,
      message: "User Already Exists"
    });
    const newUserData = {
      ...body,
      role: '1',
      user_details: {
        cv: {
          filename: req.file.filename
        }
      }
    }
    const user = await new User(newUserData);
    const newUser = await user.save();
    if (newUser) {
      await res.json({
        success: true
      });
    } else {
      await res.json({success: false, message: 'Something went wrong!'})
    }
  } catch (e) {
    await res.json({success: false, message: 'Something went wrong!'})
  }

};
exports.createAdmin = async (req, res) => {

  try {
    const userExists = await User.findOne({email: req.body.email});
    if (userExists) return res.json({
      message: "User Already Exists",
      success: false
    });
    const password = generator.generate({
      length: 8,
      numbers: true
    });
    const user = await new User({
      ...req.body,
      role: '2',
      password
    });
    const newUser = await user.save();
    if (newUser) {
      const {email} = req.body;
      const emailData = {
        to: email,
        subject: "Admin Account Created | Recruitment Agency",
        html: `
          <p>Dear User,</p>
          <p>Your Account has been created.</p>
          <p> Please use following email & password to login</p>
          <h3>Email: ${email}</h3>
          <h3>Password: ${password}</h3>
        `
      };

      sendEmail(emailData);
      await res.json({success: true, message: `Admin created & email sent to the user with credentials`});
    } else {
      await res.json({
        success: false,
        message: 'Could No Create!'
      })
    }
  } catch (e) {
    await res.json({success: false, message: 'Something went wrong!'})
  }

};
exports.editProfile = async (req, res) => {
  try {
    const {userId, cv, ...body} = JSON.parse(req.body.data)
    const userUpdate = await User.findByIdAndUpdate(userId, {
      ...body,
      user_details: {
        cv: {
          filename: req.file ? req.file.filename : cv
        }
      }
    }, {new: true})
    if (userUpdate) {
      const {_id, firstName, lastName, email, role, user_details, admin_details, address, country, mobileNo, profileImage} = userUpdate;
      await res.json({
        success: true,
        message: 'Updated Successfully!',
        user: {
          _id, firstName, lastName, email, role, user_details, admin_details, address, country, mobileNo, profileImage
        }
      });
    } else {
      await res.json({success: false, message: 'Could not Edit!'})
    }
  } catch (e) {
    await res.json({success: false, message: 'Something went wrong!'})
  }
};
exports.editProfileImage = async (req, res) => {
  try {
    const {userId} = req.body
    const userUpdate = await User.findByIdAndUpdate(userId, {
      profileImage: {
        filename: req.file.filename
      }
    }, {new: true})
    if (userUpdate) {
      const {_id, firstName, lastName, email, role, user_details, admin_details, address, country, mobileNo, profileImage} = userUpdate;
      await res.json({
        success: true,
        message: 'Updated Successfully!',
        user: {
          _id, firstName, lastName, email, role, user_details, admin_details, address, country, mobileNo, profileImage
        }
      });
    } else {
      await res.json({success: false, message: 'Could not Edit!'})
    }
  } catch (e) {
    await res.json({success: false, message: 'Something went wrong!'})
  }
};
exports.registerAdmin = async (req, res) => {

  const {secret} = req.query
  if (secret === process.env.JWT_SECRET) {
    const {firstName, lastName, email, password, address, country, mobileNo} = req.body
    if (firstName && lastName && email && password && address && country && mobileNo) {
      const userExists = await User.findOne({email});
      if (userExists) return res.json({
        success: false,
        message: "User Already Exists"
      });
      const newUserData = {
        ...req.body,
        role: '2'
      }
      const user = await new User(newUserData);
      const newUser = await user.save();
      if (newUser) {
        await res.json({
          success: true,
          message: 'Admin User Created Successfully!'
        });
      }
    } else {
      await res.json({
        success: false,
        message: 'Some Fields are missing!'
      });
    }

  } else {
    await res.status(403).json({
      success: false,
      message: 'Could not create Admin User'
    });
  }

};

exports.login = (req, res) => {
  const {email, password} = req.body;
  User.findOne({email}, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        message: "User does not exist"
      })
    }

    if (!user.authenticate(password)) {
      return res.status(401).json({
        message: "Email/Password does not match"
      })
    }
    //Generating Key
    const {_id, firstName, lastName, email, role, user_details, admin_details, address, country, mobileNo, profileImage} = user;

    const authToken = jwt.sign({_id, role}, process.env.JWT_SECRET);
    const loggedInUser = {
      _id,
      email,
      firstName,
      lastName,
      role,
      user_details,
      admin_details,
      address,
      country,
      mobileNo, profileImage
    };
    return res.json({
      authToken,
      user: loggedInUser
    });
  })
};

exports.isAdmin = (req, res, next) => {
  let admin = req.auth && req.auth.role === "2";
  if (!admin) {
    return res.status(403).json({
      error: "You are Not Authorized to perform this action"
    })
  }
  next();
};
exports.isUser = (req, res, next) => {
  let user = req.auth && req.auth.role === "1";
  if (!user) {
    return res.status(403).json({
      error: "You are Not Authorized to perform this action"
    })
  }
  next();
};


exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'auth'
});


// add forgotPassword and resetPassword methods
exports.forgotPassword = (req, res) => {
  if (!req.body) return res.status(400).json({message: "No request body"});
  if (!req.body.email)
    return res.status(400).json({message: "No Email in request body"});

  const {email} = req.body;

  // find the user based on email
  User.findOne({email}, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.status("401").json({
        error: "User with this email does not exist!"
      });

    // generate a token with user id and secret
    const token = jwt.sign(
      {_id: user._id, iss: "NODEAPI"},
      process.env.JWT_SECRET
    );

    // email data
    const emailData = {
      to: email,
      subject: "Password Reset Instructions",
      html: `<p>Please use the following link to reset your password:</p> <p>${
        process.env.CLIENT_URL
      }/auth/reset-password/${token}</p>`
    };

    return user.updateOne({resetPasswordLink: token}, (err, success) => {
      if (err) {
        return res.json({message: err});
      } else {
        sendEmail(emailData);
        return res.status(200).json({
          message: `Email has been sent with reset password link.`
        });
      }
    });
  });
};


exports.resetPassword = (req, res) => {
  const {resetPasswordLink, newPassword} = req.body;

  User.findOne({resetPasswordLink}, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.json({
        success: false,
        message: "Invalid Link!"
      });

    const updatedFields = {
      password: newPassword,
      resetPasswordLink: ""
    };

    Object.assign(user, updatedFields);
    user.updated = Date.now();

    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: err
        });
      }
      res.json({
        success: true,
        message: `Great! You can login with new Password Now.`
      });
    });
  });
};
exports.changePassword = (req, res) => {
  const {userId, newPassword, oldPassword} = req.body;

  User.findOne({_id: userId}, (err, user) => {
    // if err or no user
    if (err || !user)
      return res.json({
        success: false,
        message: 'Something Went Wrong!'
      });
    if (!user.authenticate(oldPassword)) {
      return res.json({
        success: false,
        message: 'Old password is not correct!'
      });
    }

    const updatedFields = {
      password: newPassword
    };

    Object.assign(user, updatedFields);

    user.save((err, result) => {
      if (err) {
        return res.json({
          success: false,
          message: 'Something Went Wrong!'
        });
      }
      res.json({
        success: true,
        message: `Password Changed Successfully!`
      });
    });
  });
};
exports.getUser = (req, res) => {
  res.json(req.profile)
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({role: '2'}).select('firstName lastName email address country')
    await res.json({
      success: true,
      admins
    })
  } catch (e) {
    await res.json({
      success: false,
      message: 'Something Went Wrong!'
    })
  }
};

exports.removeAdmin = async (req, res) => {
  try {
    const admin = await User.findByIdAndRemove(req.body.adminId)
    if (admin) {
      await res.json({
        success: true,
        message: 'Admin Removed Successfully!'
      })
    } else {
      await res.json({
        success: false,
        message: 'Could Not Remove Admin!'
      })
    }

  } catch (e) {
    await res.json({
      success: false,
      message: 'Something Went Wrong!'
    })
  }
};
