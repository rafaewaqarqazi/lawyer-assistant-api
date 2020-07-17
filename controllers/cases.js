const Cases = require('../models/cases')
const mongoose = require('mongoose')
exports.getAllCases = async (req, res) => {
  try {
    const {userId, userType} = req.query
    const cases = await Cases.find({[userType]: mongoose.Types.ObjectId(userId)})
      .populate('lawyer', 'firstName lastName profileImage email lawyer_details')
      .populate('client', 'firstName lastName profileImage email')
    await res.json({success: true, cases})
  } catch (e) {
    await res.json({error: 'something went wrong!'})
  }
}

exports.addNewHearing = async (req, res) => {
  try {
    const {caseId, title, description, date} = req.body
    const cases = await Cases.findOneAndUpdate({_id: mongoose.Types.ObjectId(caseId)}, {
      $addToSet: {
        "details.hearings": {
          title,
          description,
          date,
          status: 'Pending'
        }
      }
    }, {new: true})
      .populate('lawyer', 'firstName lastName profileImage email lawyer_details')
      .populate('client', 'firstName lastName profileImage email')
    await res.json({success: true, message: 'Hearing Added Successfully!', cases})
  } catch (e) {
    await res.json({error: 'something went wrong!'})
  }
}
exports.changeHearingStatus = async (req, res) => {
  try {
    const {caseId, status, id} = req.body
    const cases = await Cases.findOneAndUpdate({_id: mongoose.Types.ObjectId(caseId), "details.hearings._id": mongoose.Types.ObjectId(id)}, {
      "details.hearings.$.status": status
    }, {new: true})
      .populate('lawyer', 'firstName lastName profileImage email lawyer_details')
      .populate('client', 'firstName lastName profileImage email')
    await res.json({success: true, message: 'Status Changed Successfully!', cases})
  } catch (e) {
    await res.json({error: 'something went wrong!'})
  }
}