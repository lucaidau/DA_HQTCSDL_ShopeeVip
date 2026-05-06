const { sql, poolPromise } = require("../config/connect");

class ProductsController {
  //[GET] /sanpham
  async trangChu(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pool = await poolPromise;
      const result = await pool.request().execute("sp_LaySanPham");

      return res.status(200).json({
        message: "Lấy sản phẩm thành công",
        trangHienTai: page,
        danhSachSanPham: result.recordsets,
      });
    } catch (err) {
      console.log("Err: ", err);
      return res
        .status(500)
        .json({ message: "Lỗi server: Lấy sản phẩm thất bại" });
    }
  }

  //[GET] /sanpham/:id
  async sanPham(req, res) {
    try {
      const id = parseInt(req.params.id);

      const pool = await poolPromise;

      const result = await pool
        .request()
        .input("IDSanPham", sql.Int, id)
        .execute("sp_LayChiTietSanPham");

      return res.status(200).json({ san_pham: result.recordsets });
    } catch (error) {
      console.log("Err: ", error);
      return res.status(500).json({ message: "Lỗi Server!" });
    }
  }
}

module.exports = new ProductsController();
