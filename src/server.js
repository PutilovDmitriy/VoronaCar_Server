const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/auth", require("./routes/user.auth"));
app.use("/user", require("./routes/user.info"));
app.use("/car", require("./routes/cars"));
app.use("/shift", require("./routes/shift"));

async function start() {
  try {
    await mongoose.connect('mongodb+srv://vorona-master:tyOBjpQbo81ETkdI@voronacar-shmzb.mongodb.net/ServiceApp', {
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
