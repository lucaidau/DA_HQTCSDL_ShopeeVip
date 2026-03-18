const express = require("express");
const router = express.Router();

const productsController = require("../controllers/ProductsController");

router.use("/", productsController.trangChu);

module.exports = router;
