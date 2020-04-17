const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const carScheme = new Schema({
  number: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  lastService: {
    type: Date,
    required: true,
  },
  problems: {
    type: [String],
    required: false,
  },
  isRepairing: {
    type: Boolean,
    required: true,
    default: false,
  },
  comments: {
    type: String,
    required: false,
  },
});
const Car = mongoose.model("Car", carScheme);

module.exports = Car;
