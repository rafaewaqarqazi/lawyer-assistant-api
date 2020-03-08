const User = require('../models/users');
const fs = require('fs');
require('dotenv').config()
exports.userById = (req, res, next, id) => {
  User.findById(id)
    .then(user => {
        const {_id, name, email, role, institute, isEmailVerified, lawyer_details, skills, qualification, createdAt, profileImage} = user;
        const loggedInUser = {
          _id,
          email,
          name,
          role,
          createdAt,
          institute,
          qualification,
          profileImage,
          isEmailVerified,
          lawyer_details,
          skills
        };
        req.profile = loggedInUser;
        next();
    })
    .catch(err => {
      res.status(400).json({error: err});
      next();
    })
};

exports.uploadProfileImage = (req, res) => {
  const {oldImage, userId} = req.body;
  fs.unlink(`public/static/images/${oldImage}`, err => {
    if (err) {
      console.log(err)
    }
    User.updateOne({"_id": userId}, {
      $set: {"profileImage.filename": req.file.filename}
    }).then(result => {
      if (result.ok) {
        res.json(req.file.filename)
      }
    }).catch(error => res.json({error: error.message}))

  });
};

exports.changeName = async (req, res) => {
  try {
    const {name, userId} = req.body;
    const result = await User.updateOne({"_id": userId}, {
      $set: {"name": name}
    });
    if (result.ok) {
      await res.json({message: 'Successfully Updated'})
    }
  } catch (e) {
    await res.json({error: e.message})
  }
};
exports.changePassword = async (req, res) => {
  try {
    const {oldPassword, newPassword, userId} = req.body;
    const user = await User.findOne({"_id": userId});
    if (!user.authenticate(oldPassword)) {
      return res.status(401).json({
        error: "Old Password is incorrect"
      })
    }
    const updatedFields = {
      password: newPassword
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
        message: `Password Changed Successfully`
      });
    });
  } catch (e) {
    await res.json({error: e.message})
  }
};

exports.removeUser = async (req, res) => {
  try {
    const result = await User.remove({"_id": req.params.userId});
    await res.json(result);
  } catch (e) {
    await res.json({error: e.message})
  }
};
