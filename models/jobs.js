const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;
const jobsSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true
  },
  department: {
    type: String,
    trim: true,
    required: true
  },
  category: {
    type: String,
    trim: true,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  positions: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  postedOn: {
    type: Date,
    default: Date.now()
  },
  dueDate: Date,
  experience: {
    type: String,
    required: true
  },
  qualifications: [],
  applications: [{
    user: {type: ObjectId, ref: "Users"},
    status: String,
    test: {
      date: Date,
      status: String
    },
    interview: {
      date: Date,
      status: String
    }
  }]
});

module.exports = mongoose.model('Jobs', jobsSchema);