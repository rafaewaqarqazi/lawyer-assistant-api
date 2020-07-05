const User = require('../models/users');
const fs = require('fs');
const natural = require('natural');
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

exports.getAllLawyers = async (req, res) => {
  try {
    const lawyers = await User.find({"role": '2'});
    await res.json({success: true, lawyers})
  } catch (e) {
    await res.json({error: e.message})
  }
};

exports.testNlp = async (req, res) => {
  try {
    natural.PorterStemmer.attach();
    const testString = 'Our founding attorney brings a wealth of knowledge and experience to the table. As a former associate at two large Metro Atlanta law firms, Attorney Effiong is both poised and experienced in handling complex civil and business disputes as well as making deals happen through effective contracting and negotiation strategies. Prior to becoming a lawyer, Attorney Effiong was a Georgia public school teacher and later a Program Director coaching and developing novice teachers. She has also served as an advocate for students with special needs and students experiencing academic or behavioral challenges in school. From this experience, she knows what types of services are available and she can analyze education issues holistically.'
    const strDistance = natural.JaroWinklerDistance(testString, req.body.text, undefined, true)
    const result = await User.find(
      { $text: { $search:  req.body.text } },
      { score: { $meta: "textScore" } }
    ).sort( { score: { $meta: "textScore" } } )
    await res.json({strDistance, result})
  } catch (e) {
    await res.json({error: e.message})
  }
};

exports.allowHiring = async (req, res) => {
  try {
    const {lawyerId, clientId} = req.body
    const result = await User.findOneAndUpdate({_id: lawyerId}, {
      $addToSet:{
        "lawyer_details.canHire": clientId
      }
    })
    await res.json({success: true, message: 'Allowed Successfully'})
  } catch (e) {
    await res.json({error: e.message})
  }
}
exports.hireLawyer = async (req, res) => {
  try {
    const {lawyerId, clientId, title, description} = req.body
    const result = await User.findOneAndUpdate({_id: lawyerId}, {
      $addToSet:{
        "lawyer_details.cases": {
          client: clientId,
          title,
          description
        }
      }
    }, {new: true})
    await res.json({success: true, message: 'Hired Successfully', lawyer: result})
  } catch (e) {
    await res.json({error: e.message})
  }
}
exports.removeUser = async (req, res) => {
  try {
    const result = await User.remove({"_id": req.params.userId});
    await res.json(result);
  } catch (e) {
    await res.json({error: e.message})
  }
};
