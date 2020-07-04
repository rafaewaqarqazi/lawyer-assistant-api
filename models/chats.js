const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;
const chatsSchema = new mongoose.Schema({
  users: [{type: ObjectId, ref: "Users"}],
  lastUpdated: Date,
  messages: [{
    sender: {type: ObjectId, ref: "Users"},
    receiver: {type: ObjectId, ref: "Users"},
    message: String,
    timestamp: Date,
    seen: Boolean,
  }]
});

module.exports = mongoose.model('chats', chatsSchema);