const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const infoSchema = new Schema({
  VIN: String,
  STS: String,
  OSAGO: String,
  dateOSAGO: Date,
  code: String,
  tel: String,
  IMEI: String,
});

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
  photos: {
    type: [String],
    required: false,
  },
  info: infoSchema,
});
const Car = mongoose.model("Car", carScheme);

module.exports = Car;
