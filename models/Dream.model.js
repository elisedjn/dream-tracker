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
    enum: ["Fantasctic", "Super Powers", "Action", "Adventure", "Family", "Childhood", "Friends", "Funny", "Pets", "Food", "Job", "Drama", "Romance", "Celebrities", "XXX", "The Unknown", "Strangers", "Nightmare",]
  }],
  status: {
    type: String,
    enum: ["public", "private"]
  }
});


 module.exports = model('Dream', DreamSchema);