const ObjectID = require("mongodb").ObjectID;
module.exports = function(app, db) {
  app.get("/users/data/", (req, res) => {
    db.collection("users")
      .find()
      .toArray((err, item) => {
        if (err) {
          res.send({ error: "An error has occurred" });
        } else {
          res.send(item);
        }
      });
  });
  app.get("/users/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("users").findOne(details, (err, item) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(item);
      }
    });
  });
  app.get("/users", (req, res) => {
    const login = req.query.login;
    const password = req.query.password;
    const details = { login: login, password: password };
    db.collection("users").findOne(details, (err, item) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(item);
      }
    });
  });
  app.post("/users", (req, res) => {
    const user = {
      name: req.body.name,
      login: req.body.login,
      password: req.body.password
    };
    db.collection("users").insert(user, (err, result) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(result.ops);
      }
    });
  });
  app.delete("/users/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    db.collection("users").remove(details, (err, item) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send("Note " + id + " deleted!");
      }
    });
  });
  app.put("/users/:id", (req, res) => {
    const id = req.params.id;
    const details = { _id: new ObjectID(id) };
    const user = {
      name: req.body.name,
      login: req.body.login,
      password: req.body.password
    };
    db.collection("users").update(details, user, (err, result) => {
      if (err) {
        res.send({ error: "An error has occurred" });
      } else {
        res.send(user);
      }
    });
  });
};
