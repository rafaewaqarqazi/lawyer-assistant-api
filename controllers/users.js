const User = require('../models/users');
const Cases = require('../models/cases');
const fs = require('fs');
const natural = require('natural');
const {sendEmail} = require("../helpers");
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
    const lawyers = await User.find({"role": '2'})
      .populate('lawyer_details.reviews.reviewedBy', 'firstName lastName profileImage address')
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
    const client = await User.findById(clientId).select('email')
    const emailData = {
      to: client.email,
      subject: "Hiring Allowed",
      html: `
        <p>Dear Client,</p>
        <p>You have been You have been allowed to hire <b>${result.firstName} ${result.lastName}</b></p>
      `
    };

    sendEmail(emailData);
    await res.json({success: true, message: 'Allowed Successfully'})
  } catch (e) {
    await res.json({error: e.message})
  }
}
exports.reviewLawyer = async (req, res) => {
  try {
    const {lawyerId, clientId, ratingTxt, newRating} = req.body
    const result = await User.findOneAndUpdate({_id: lawyerId}, {
      $addToSet:{
        "lawyer_details.reviews": {
          reviewedBy: clientId,
          text: ratingTxt,
          rating: newRating
        }
      }
    }, {new: true})
      .populate('lawyer_details.reviews.reviewedBy', 'firstName lastName profileImage')
    const client = await User.findById(clientId).select('email')
    const emailData = {
      to: result.email,
      subject: "User Reviews",
      html: `
        <p>Dear Lawyer,</p>
        <p>You got new Review from <b>${client.firstName} ${client.lastName}</b>:</p>
        <p><b>Rating:</b> ${newRating}</p>
        <p><b>Review:</b> ${ratingTxt}</p>
      `
    };

    sendEmail(emailData);
    await res.json({success: true, message: 'Reviewed Successfully', result})
  } catch (e) {
    await res.json({error: e.message})
  }
}
exports.hireLawyer = async (req, res) => {
  try {
    const {lawyerId, clientId, title, description} = req.body
    const newCase = await Cases.create({
      client: clientId,
      lawyer: lawyerId,
      details: {
        title,
        description,
        status: 'On-Going'
      }
    })
    const result = await Cases.findById(newCase._id)
      .populate('client', 'firstName lastName email profileImage')
      .populate('lawyer', 'firstName lastName email profileImage')
    const clientEmailData = {
      to: result.client.email,
      subject: "Lawyer Hired",
      html: `
        <p>Dear Client,</p>
        <p>You successfully hired <b>${result.lawyer.firstName} ${result.lawyer.lastName}</b> for the case <b>${result.details.title}</b></p>
      `
    };
    const lawyerEmailData = {
      to: result.lawyer.email,
      subject: "You have been Hired",
      html: `
        <p>Dear Lawyer,</p>
        <p>You have been successfully hired by <b>${result.client.firstName} ${result.client.lastName}</b> for the case <b>${result.details.title}</b></p>
      `
    };

    sendEmail(clientEmailData);
    sendEmail(lawyerEmailData);
    await res.json({success: true, message: 'Hired Successfully', result})
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
