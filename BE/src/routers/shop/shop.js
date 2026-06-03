const express = require("express");
const router = express.Router();
const shopController = require("../../controllers/shop/ShopController");

router.put("/donhang/xacnhan", shopController.xacNhanDonHang);
router.get("/donhang/:id", shopController.layDonHang);

router.get("/vi/:id", shopController.layVi);
router.post("/vi/rutien", shopController.rutTien);

router.post("/themsp", shopController.themSanPham);
router.patch("/suasp", shopController.suaSanPham);
router.patch("/xoasanpham", shopController.xoaSanPham);
router.get("/:id", shopController.laySanPham);

module.exports = router;
