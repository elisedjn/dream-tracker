const { Schema, model } = require('mongoose');

const DreamSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: String,
  categories: [{
    type: String,
    enum: ["Fantastic", "Super Powers", "Action", "Adventure", "Family", "Childhood", "Friends", "Funny", "Pets", "Food", "Job", "Music", "Drama", "Romance", "Celebrities", "XXX", "The Unknown", "Strangers", "Nightmare"]
  }],
  status: {
    type: String,
    enum: ["public", "private"],
    default: "private"
  },
  audioUrl: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  languages: [{
    type: String,
    enum: ["EN", "FR", "ES", "DE", "PL", "IT", "NL", "CA", "PT", "SV", "RU", "HI"]
  }],
  likes: {
    type: Number,
    default: 0
  }
});


 module.exports = model('Dream', DreamSchema);