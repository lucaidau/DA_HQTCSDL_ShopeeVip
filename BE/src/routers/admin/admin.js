const express = require("express");
const router = express.Router();

const adminController = require("../../controllers/admin/AdminController");

router.get("/", adminController.layTaiKhoan);
router.patch("/suataikhoan", adminController.suaTaiKhoan);
router.patch("/khoataikhoan/:id", adminController.khoaTaiKhoan);

router.get("/sanpham", adminController.laySanPham);
router.patch("/khoasanpham/:id", adminController.khoaSanPham);

router.post("/saoluu/cauhinhtudong", adminController.cauHinhTuDong);
router.post("/saoluu/backup-full", adminController.fullBackup);
router.post("saoluu/backup-diff", adminController.diffBackup);
router.post("/saoluu/backup-log", adminController.logBackup);

router.post("/saoluu/phuchoi", adminController.phucHoi);
router.get("/thongke", adminController.layThongKe);

module.exports = router;
