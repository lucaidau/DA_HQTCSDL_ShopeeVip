const express = require("express");
const router = express.Router();

const adminController = require("../../controllers/admin/AdminController");

router.get("/", adminController.layTaiKhoan);
router.patch("/suataikhoan", adminController.suaTaiKhoan);
router.patch("/khoataikhoan/:id", adminController.khoaTaiKhoan);
router.patch("/khoasanpham/:id", adminController.khoaSanPham);
router.get("/sanpham", adminController.laySanPham);
router.get("/thongke", adminController.layThongKe);

module.exports = router;
