const authRouter = require("./user/auth.js");
const productRouter = require("./user/products.js");
const cartRouter = require("./user/cart.js");
const paymentRouter = require("./user/payment.js");

const route = (app) => {
  app.use("/sanpham", productRouter);
  app.use("/giohang", cartRouter);
  app.use("/thanhtoan", paymentRouter);
  app.use("/", authRouter);
};

module.exports = route;
