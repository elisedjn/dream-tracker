const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  likedDreams: [{
    type: Schema.Types.ObjectId,
    ref: 'dream'
  }]
  },
  {
    timestamps: true
  }
);

 module.exports = model('User', UserSchema);