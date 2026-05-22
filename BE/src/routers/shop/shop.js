const express = require("express");
const router = express.Router();
const shopController = require("../../controllers/shop/ShopController");

router.get("/donhang/:id", shopController.layDonHang);
router.get("/:id", shopController.laySanPham);

module.exports = router;
