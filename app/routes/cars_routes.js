const ObjectID = require("mongodb").ObjectID;
const Car = require("../Shemas/Car");
module.exports = function(app, db) {
  app.get("/cars/", (req, res) => {
    db.collection("cars")
      .find()
      .toArray((err, item) => {
        if (err) {
          res.send({ error: "An error has occurred" });
        } else {
          res.send(item);
        }
      });
  });
  app.get("/cars/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("cars").findOne(details, (err, item) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(item);
      }
    });
  });
  app.post("/cars", (req, res) => {
    const car = new Car({
      number: req.body.number,
      model: req.body.model,
      lastService: req.body.lastService,
      problems: req.body.problems ? req.body.problems.split(",") : [],
      isRepairing: req.body.isRepairing,
      comments: req.body.comments
    });
    db.collection("cars").insertOne(car, (err, result) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(result.ops[0]);
      }
    });
  });
  app.delete("/cars/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("cars").remove(details, (err, item) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send("Note " + id + " deleted!");
      }
    });
  });
  app.put("/cars/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    const car = {
      number: req.body.number,
      model: req.bode.model,
      lastService: req.body.lastService,
      problems: req.body.problems,
      isRepairing: req.body.isRepairing,
      comments: req.body.commentss
    };
    db.collection("cars").update(details, car, (err, result) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(car);
      }
    });
  });
};
