const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;
const casesSchema = new mongoose.Schema({
  client: {type: ObjectId, ref: "Users"},
  lawyer: {type: ObjectId, ref: "Users"},
  lastUpdated: Date,
  details: {
    title: String,
    description: String,
    hearings: [{
      title: String,
      description: String,
      date: Date,
      status: String
    }]
  }
});

module.exports = mongoose.model('cases', casesSchema);