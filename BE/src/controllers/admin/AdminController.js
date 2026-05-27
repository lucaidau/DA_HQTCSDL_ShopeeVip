const { sql, adminPoolPromise } = require("../../config/connect");

class AdminController {
  // [GET] /admin
  async layTaiKhoan(req, res) {
    try {
      const pool = await adminPoolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM dbo.fn_Admin_LayTaiKhoan()");

      return res
        .status(200)
        .json({ success: true, danhsachTK: result.recordset });
    } catch (error) {
      console.log("Lỗi: ", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  //[PATCH] /admin/suataikhoan
  async suaTaiKhoan(req, res) {
    try {
      const { idAccount, userName, name, email, phone } = req.body;
      const pool = await adminPoolPromise;
      const result = await pool.request();
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  //[PATCH] /admin/khoataikhoan
  async khoaTaiKhoan(req, res) {
    try {
      const pool = await adminPoolPromise;
      const result = await pool.request();
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  //[GET] /admin/sanpham
  async laySanPham(req, res) {
    try {
      const pool = await adminPoolPromise;
      const result = await pool.request();
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  // [GET] /admin/thongke
  async layThongKe(req, res) {
    try {
      const pool = await adminPoolPromise;
      const result = await pool.request();
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }
}

module.exports = new AdminController();
