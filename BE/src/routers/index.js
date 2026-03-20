const authRouter = require("./auth.js");
const productRouter = require('./products.js')
const cartRouter = require("./cart.js")

const route = (app) => {
  app.use("/", authRouter);
  app.use("/sanpham", productRouter)
  app.use("/giohang",cartRouter)
};

module.exports = route;
