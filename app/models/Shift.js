const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const shiftScheme = new Schema({
  userId: {
    type: String,
    required: true,
  },
  shiftStart: {
    type: Date,
    required: true,
  },
  shiftTime: {
    type: Number,
    required: true,
  },
  valueOil: {
    type: Number,
    required: true,
  },
  wash: {
    type: Number,
    required: true,
  },
  carsList: {
    type: [String],
    required: false,
  },
  isFinished: {
    type: Boolean,
    required: true,
  },
});

const Shift = mongoose.model("Shift", shiftScheme);

module.exports = Shift;
