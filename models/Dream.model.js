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
    enum: ["Fantastic", "Super Powers", "Action", "Adventure", "Family", "Childhood", "Friends", "Funny", "Pets", "Food", "Job", "Drama", "Romance", "Celebrities", "XXX", "The Unknown", "Strangers", "Nightmare"]
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
  lenguages: [{
    type: String,
    enum: ["EN", "FR", "ES", "DE", "PL", "IT", "NL", "CA", "PT", "SV", "RU", "HI"]
  }]
});


 module.exports = model('Dream', DreamSchema);