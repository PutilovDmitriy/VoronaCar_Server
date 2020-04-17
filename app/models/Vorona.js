const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voronaScheme = new Schema({
  valueOil: {
    type: Number,
    required: true,
  },
});
const Vorona = mongoose.model("Vorona", voronaScheme);

module.exports = Vorona;
