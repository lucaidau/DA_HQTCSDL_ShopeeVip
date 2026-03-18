const { VarChar, pool } = require("mssql");
const { sql, poolPromise } = require("../config/connect");

class AuthController {
  //[POST] /
  async dangNhap(req, res) {
    try {
      const { username, password } = req.body;

      const pool = await poolPromise;

      const result = await pool
        .request()
        .input("TenDangNhap", sql.VarChar, username)
        .input("MatKhau", sql.VarChar, password)
        .execute("sp_DangNhap");

      const user = result.recordset[0];

      return res
        .status(201)
        .json({ message: "Đăng nhập thành công!", user: user });
    } catch (err) {
      console.log("Error: ", err.message);
      return res.status(401).json({ susscess: false, message: err.message });
    }
  }
  //[POST] /dangKi
  async dangKi(req, res) {
    try {
      const { name, username, password, phone, email, gender, role } = req.body;

      const userRole = parseInt(role);
      const userGender = parseInt(gender);

      const pool = await poolPromise;

      await pool
        .request()
        .input("Ten", sql.NVarChar, name)
        .input("TenDangNhap", sql.VarChar, username)
        .input("Email", sql.VarChar, email)
        .input("SDT", sql.VarChar, phone)
        .input("GioiTinh", sql.Int, userGender)
        .input("MatKhau", sql.VarChar, password)
        .input("Loai", sql.Int, userRole)
        .execute("sp_DangKi");

      return res.status(201).json({ message: "Đăng kí thành công" });
    } catch (err) {
      console.error("Error: ", err.message);

      return res.status(400).json({
        susscess: false,
        message: err.message,
      });
    }
  }
}

module.exports = new AuthController();
