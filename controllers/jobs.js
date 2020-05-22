const Jobs = require('../models/jobs');
const Users = require('../models/users');
require('dotenv').config()
const mongoose = require('mongoose');
const {sendEmail} = require("../helpers");
const moment = require('moment')
exports.newJob = async (req, res) => {
  const body = req.body
  const job = await new Jobs( {
    ...body,
    postedOn: Date.now()
  });
  const newJob = await job.save();
  if (newJob) {
    await res.json({
      success: true,
      job: newJob
    });
  }
}
exports.editJob = async (req, res) => {
  const body = req.body
  const editData = {...body}
  delete editData._id
  const job = await Jobs.findByIdAndUpdate(body._id, {
    ...editData
  }, {new: true})
    .populate('applications.user', 'firstName lastName email user_details')
  if (job) {
    await res.json({
      success: true,
      job
    });
  }
}
exports.deleteJob = async (req, res) => {
  const body = req.body
  try {
    const response = await Jobs.findByIdAndDelete(body.id)
      .populate('applications.user', 'firstName lastName email user_details')
    if (response) {
      await res.json({
        success: true,
        message: 'Job Post Deleted Successfully!'
      });
    } else {
      await res.json({success: false, message: 'could not delete job post'})
    }
  } catch (e) {
    await res.json({success: false, message: 'could not delete job post'})
  }
}
exports.applyForJob = async (req, res) => {
  const body = req.body
  try {
    const response = await Jobs.findByIdAndUpdate(body.jobId, {
      $addToSet: {
        applications: {
          user: body.userId,
          status: '1'
        }
      }
    }, {new: true})
      .populate('applications.user', 'firstName lastName email user_details')
    if (response) {
      const {email} = await Users.findById(body.userId).select('email')
      const emailData = {
        to: email,
        subject: "Applied for Job | Recruitment-Agency",
        html: `
          <p>Dear User,</p>
          <p>Your have successfully applied for the job ${response.title}.</p>
        `
      };

      sendEmail(emailData);
      await res.json({
        success: true,
        message: 'Applied Successfully!',
        job: response
      });
    } else {
      await res.json({success: false, message: 'could not apply'})
    }
  } catch (e) {
    await res.json({success: false, message: 'could not apply'})
  }
}
exports.scheduleTestInterview = async (req, res) => {
  const {jobId, applicationsIds, status, type, date, emails} = req.body
  try {
    const response = await Jobs.findOneAndUpdate({_id: jobId}, {
      $set:{
        "applications.$[elem].status": status,
        ["applications.$[elem]." + type]: {
          date,
          status: '1'
        },
      }
    }, {
      new: true,
      multi: true,
      arrayFilters: [{"elem._id" : {$in: applicationsIds.map(id => mongoose.Types.ObjectId(id))}}]
    })
      .populate('applications.user', 'firstName lastName email user_details')
    if (response) {
      const emailData = {
        to: emails,
        subject: `${type.toUpperCase()} Scheduled | Recruitment-Agency`,
        html: `
          <p>Dear Applicant,</p>
          <p>We are pleased to inform you that you are shortlisted for <b>${type.toUpperCase()}</b> for the Job "<b>${response.title}</b>"</p>
          <p>Your ${type} has been scheduled on:</p>
          <p><b>${type.toUpperCase()} Date: </b>${moment(date).format('DD/MM/YYYY h:mm a')}</p>
          <p>Regards!</p>
          <br/>
          <p>Recruitment Agency Limited!</p>
        `
      };
      sendEmail(emailData);
      await res.json({
        success: true,
        message: 'Scheduled Successfully!',
        job: response
      });
    } else {
      await res.json({success: false, message: 'could not schedule'})
    }
  } catch (e) {
    console.log(e.message)
    await res.json({success: false, message: 'could not schedule'})
  }
}
exports.changeStatusTestInterview = async (req, res) => {
  const {jobId, applicationId, status, type, email} = req.body
  try {
    const response = await Jobs.findOneAndUpdate({_id: jobId, "applications._id": applicationId}, {
      $set:{
        ["applications.$."+ type +".status"]: status
      }
    }, {new: true})
      .populate('applications.user', 'firstName lastName email user_details')
    if (response) {
      const emotion = status === '2' ? 'are pleased' : 'regret'
      const statusType = status === '2' ? 'Passed' : 'Failed'
      const emailData = {
        to: email,
        subject: "Job Application Status | Recruitment-Agency",
        html: `
          <p>Dear Applicant,</p>
          <p>We ${emotion} to inform you that you have <b>${statusType}</b> the <b>${type}</b> for the Job "<b>${response.title}</b>"</p>
          <p>Regards!</p>
          <br/>
          <p>Recruitment Agency Limited!</p>
        `
      };
      sendEmail(emailData);
      await res.json({
        success: true,
        message: 'Done Successfully!',
        job: response
      });
    } else {
      await res.json({success: false, message: 'could not perform this action'})
    }
  } catch (e) {
    console.log(e.message)
    await res.json({success: false, message: 'could not perform this action'})
  }
}
exports.changeStatusApplication = async (req, res) => {
  const {jobId, applicationsIds, status, emails} = req.body
  try {
    const response = await Jobs.findOneAndUpdate({_id: jobId}, {
      $set:{
        "applications.$[elem].status": status
      }
    }, {
      new: true,
      multi: true,
      arrayFilters: [{"elem._id" : {$in: applicationsIds.map(id => mongoose.Types.ObjectId(id))}}]
    })
      .populate('applications.user', 'firstName lastName email user_details')
    if (response) {
      if (status === '4' || status === '6'){
        const emotion = status === '4' ? 'are pleased' : 'regret'
        const statusType = status === '4' ? 'Selected' : 'Rejected'
        const emailData = {
          to: emails,
          subject: "Job Application | Recruitment-Agency",
          html: `
          <p>Dear Applicant,</p>
          <p>We ${emotion} to inform you that you have been <b>${statusType}</b> for the Job "<b>${response.title}</b>"</p>
          <p>Regards!</p>
          <br/>
          <p>Recruitment Agency Limited!</p>
        `
        };
        sendEmail(emailData);
      }
      await res.json({
        success: true,
        message: 'Done Successfully!',
        job: response
      });
    } else {
      await res.json({success: false, message: 'could not perform this action'})
    }
  } catch (e) {
    console.log(e.message)
    await res.json({success: false, message: 'could not perform this action'})
  }
}
exports.allJobs = async (req, res) => {
  const jobs = await Jobs.find()
    .populate('applications.user', 'firstName lastName email user_details')
  await res.json({
    success: true,
    jobs
  });
}

