const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const config = require("config");
const PORT = config.get("port") || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/auth", require("./app/routes/user.auth"));
app.use("/user", require("./app/routes/user.info"));
app.use("/car", require("./app/routes/cars"));
app.use("/shift", require("./app/routes/shift"));

async function start() {
  try {
    await mongoose.connect(config.get("url"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    app.listen(PORT, () => console.log("We are live on " + PORT));
  } catch (e) {
    console.log("Server error", e.message);
    process.exit(1);
  }
}

start();
