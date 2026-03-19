const authRouter = require("./auth.js");
const productRouter = require('./products.js')

const route = (app) => {
  app.use("/", authRouter);
  app.use("/sanpham", productRouter)
};

module.exports = route;
