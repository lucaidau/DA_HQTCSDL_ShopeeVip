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
      const result = await pool
        .request()
        .input("IDTaiKhoan", sql.Int, idAccount)
        .input("userName", sql.VarChar(50), userName)
        .input("name", sql.NVarChar(50), name)
        .input("email", sql.VarChar(255), email)
        .input("phone", sql.VarChar(10), phone)
        .execute("sp_Admin_SuaTaiKhoan");

      return res.status(200).json({ success: true, message: result.recordset });
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  //[PATCH] /admin/khoataikhoan/:id
  async khoaTaiKhoan(req, res) {
    try {
      const { id } = req.params;

      const pool = await adminPoolPromise;
      const result = await pool
        .request()
        .input("IDTaiKhoan", sql.Int, id)
        .execute("sp_Admin_KhoaTaiKhoan");

      const status = result.recordset[0];
      if (status.Success === 1) {
        return res.status(200).json({ success: true, message: status.Message });
      } else {
        return res
          .status(400)
          .json({ success: false, message: status.Message });
      }
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
      const result = await pool
        .request()
        .query("SELECT * FROM dbo.fn_Admin_LaySanPham()");

      return res.status(200).json({
        success: true,
        message: "Lấy sản phẩm thành công",
        danhSachSP: result.recordset,
      });
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  //[PATCH] /admin/khoasanpham/:id
  async khoaSanPham(req, res) {
    try {
      const { id } = req.params;
      const pool = await adminPoolPromise;
      const result = await pool
        .request()
        .input("IDBanSao", sql.Int, id)
        .execute("sp_Admin_KhoaSanPham");

      const status = result.recordset[0];
      if (status.Success) {
        return res.status(200).json({ success: true, message: status.Message });
      } else {
        return res
          .status(400)
          .json({ success: false, message: status.Message });
      }
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
