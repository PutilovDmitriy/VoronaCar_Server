const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const botSchema = new Schema({
  chatId: Number,
  message: String,
});
const Bot = mongoose.model("Bot", botSchema);

module.exports = Bot;
