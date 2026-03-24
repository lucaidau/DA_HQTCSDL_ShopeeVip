const authRouter = require("./auth.js");
const productRouter = require('./products.js')
const cartRouter = require("./cart.js")
const paymentRouter = require('./payment.js')

const route = (app) => {
    
  app.use("/sanpham", productRouter)
  app.use("/giohang",cartRouter)
  app.use("/thanhtoan", paymentRouter)
app.use("/", authRouter);

};

module.exports = route;
