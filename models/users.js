const mongoose = require('mongoose');
const uuidv1 = require('uuid/v1');
const crypto = require('crypto');
const {ObjectId} = mongoose.Schema;
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true
  },
  lastName: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  hashed_password: {
    type: String,
    required: true
  },
  salt: String,
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: Date,
  role: String,
  address: String,
  country: String,
  resetPasswordLink: String,
  mobileNo: String,
  admin_details: {},
  profileImage: {
    filename: String
  },
  client_details: {},
  lawyer_details: {
    lawSchool: String,
    practiceAreas: [],
    bio: String,
    ratings: {
      type: String,
      default: '0'
    },
    reviews: [],
    canHire: [],
  }
});


userSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    //generate a timestamp
    this.salt = uuidv1();

    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this.password;
  });


//methods

userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password)
      return "";
    try {
      return crypto.createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return "";
    }
  }
};
userSchema.index({"lawyer_details.bio": "text"})
module.exports = mongoose.model('Users', userSchema);