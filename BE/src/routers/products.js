const express = require("express");
const router = express.Router();

const productsController = require("../controllers/ProductsController");

router.get("/:id", productsController.sanPham)
router.get("/", productsController.trangChu);

module.exports = router;
