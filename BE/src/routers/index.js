const authRouter = require("./auth.js");

const route = (app) => {
  app.use("/", authRouter);
};

module.exports = route;
