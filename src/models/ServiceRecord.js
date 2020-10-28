const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceRecordScheme = new Schema({
    date: Date,
    number: String,
    valueOil: Number,
    fromGS: Boolean,
    wash: Number,
});

const ServiceRecord = mongoose.model("ServiceRecord", serviceRecordScheme);

module.exports = ServiceRecord;
