const { sql, poolPromise } = require("../config/connect");

class ProductsController {
  //[GET] /sanpham
  async trangChu(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("PageNumber", sql.Int, page)
        .input("PageSize", sql.Int, 20)
        .execute("sp_LaySanPham");

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

      // if (result.recordset.length === 0) {
      //   return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
      // }

      return res.status(200).json({ san_pham: result.recordset[0] });
    } catch (error) {
      console.log("Err: ", error);
      return res.status(500).json({ message: "Lỗi Server!" });
    }
  }
}

module.exports = new ProductsController();
