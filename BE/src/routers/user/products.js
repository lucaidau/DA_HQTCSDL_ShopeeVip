const express = require("express");
const router = express.Router();

const productsController = require("../../controllers/user/ProductsController");

router.get("/:id", productsController.sanPham);
router.get("/", productsController.trangChu);

module.exports = router;
