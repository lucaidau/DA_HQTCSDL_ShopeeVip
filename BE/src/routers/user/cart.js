const express = require("express");
const router = express.Router();
const cartController = require("../../controllers/user/CartController");

router.post("/themsanpham", cartController.themSanPhamVaoGioHang);
router.delete("/xoasp", cartController.xoaSPTrongGioHang);
router.patch("/capnhatgiohang", cartController.capNhatGioHang);
router.get("/:id", cartController.layGioHang);

module.exports = router;
