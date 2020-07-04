const Chats = require('../models/chats')
const mongoose = require('mongoose');
exports.handleSocket = (socket) => {
  console.log('socket-rooms', socket.rooms);

  socket.on('get-room', (data, callback) => {
    Chats
      .findOne({ "users": { "$size" : 2, "$all": [ data.senderId, data.receiverId ] } })
      .populate('users', 'firstName lastName email profileImage')
      .then(result => {
        if (!result) {
          console.log('Creating Room')
          Chats.create({
            users: [ data.senderId, data.receiverId ],
            lastUpdated: Date.now()
          }).then(chat => {
            console.log('Room Created!')
            Chats.findOne({_id: chat._id})
              .populate('users', 'firstName lastName email profileImage')
              .then(room => {
                socket.broadcast.emit('room-created', room)
                callback({roomId: room._id})
              })
          })

        } else {
          callback({roomId: result._id})
          console.log('Room Found!')
        }

      })
  })

  socket.on('join-room', ({roomId}) => {
    console.log('join-room', roomId)
    console.log('condd', !socket.rooms)
    if (!Array.isArray(socket.rooms)) {
      if (!Array.isArray(roomId)) {
        socket.join([roomId])
      } else {
        socket.join(roomId)
      }
    } else {
      if (!Array.isArray(roomId)) {
        socket.join([...socket.rooms, roomId])
      } else {
        socket.join([...socket.rooms, ...roomId])
      }
    }
  })
  socket.on('get-chats', ({userId}, callback) => {
    Chats.find({'users': userId})
      .sort({lastUpdated: -1})
      .populate('users', 'firstName lastName email profileImage')
      .populate('messages.sender', 'firstName lastName email profileImage')
      .populate('messages.receiver', 'firstName lastName email profileImage')
      .then(result => {
        callback(result)
      })
      .catch(error => {
        console.log('error', error.message)
      })
  })
  socket.on('send-message', ({message, senderId, receiverId, roomId}, callback) => {
    const timestamp = Date.now()
    Chats.findOneAndUpdate({_id: roomId}, {
      lastUpdated: timestamp,
      $push: {
        messages: {
          sender: senderId,
          receiver: receiverId,
          message,
          timestamp,
          seen: false
        }
      }
    }, {new: true})
      .populate('users', 'firstName lastName email profileImage')
      .populate('messages.sender', 'firstName lastName email profileImage')
      .populate('messages.receiver', 'firstName lastName email profileImage')
      .then(chat => {
        socket.broadcast.to(roomId).emit('receive-message', chat)
        callback(chat)
      })
  })

  socket.on('msg-seen', ({userId, room}, callback) => {
    Chats.findOneAndUpdate({_id: mongoose.Types.ObjectId(room) }, {
      $set: {
        "messages.$[elem].seen": true
      }
    }, {
      new: true,
      multi: true,
      arrayFilters: [{"elem.receiver": mongoose.Types.ObjectId(userId)}]
    })
      .populate('users', 'firstName lastName email profileImage')
      .populate('messages.sender', 'firstName lastName email profileImage')
      .populate('messages.receiver', 'firstName lastName email profileImage')
      .then(chat => {
        callback(chat)
      })
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
}