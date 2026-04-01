const express = require("express");
const router = express.Router();
const shopController = require("../controllers/ShopController");

router.get("", shopController.sanPham);

module.exports = router;
