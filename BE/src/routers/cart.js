const express = require("express");
const router = express.Router();
const cartController = require("../controllers/CartController")

router.post("/themsanpham", cartController.themSanPhamVaoGioHang)
router.post("/capnhatgiohang", cartController.capNhatGioHang)
router.get("/:id", cartController.layGioHang)

module.exports = router;