const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const config = require("config");
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/auth", require("./app/routes/user.auth"));
app.use("/user", require("./app/routes/user.info"));
app.use("/car", require("./app/routes/cars"));
app.use("/shift", require("./app/routes/shift"));

async function start() {
  try {
    await mongoose.connect(
      // "mongodb+srv://voronacaradmin:admin@cluster0-hl03q.mongodb.net/VoronaCar",
      process.env.URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      }
    );
    app.listen(PORT, () => console.log("We are live on " + PORT));
  } catch (e) {
    console.log("Server error", e.message);
    process.exit(1);
  }
}

start();
