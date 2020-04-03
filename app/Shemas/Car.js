const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userScheme = new Schema({
  number: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  lastService: {
    type: String,
    required: true
  },
  problems: {
    type: [Number],
    required: false
  },
  isRepairing: {
    type: Boolean,
    required: true,
    default: false
  },
  comments: {
    type: String,
    required: false
  }
});
const Car = mongoose.model("Car", userScheme);

module.exports = Car;
