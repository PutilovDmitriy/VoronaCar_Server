const usersRoutes = require("./users_routes");
const carsRoutes = require("./cars_routes");
module.exports = function(app, db) {
  usersRoutes(app, db);
  carsRoutes(app, db);
};
