const { sql, poolPromise } = require("../config/connect");

class ProductsController {
  async trangChu(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("PageNumber", sql.Int, page)
        .input("PageSize", sql.Int, 20)
        .execute("sp_LaySanPham");

      return res
        .status(200)
        .json({
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

  async sanPham(req, res) {
    try {
      const id = parent(req.params.id);

      const pool = await poolPromise;
      const result = await pool.request().input('IDSanPham', sql.Int, id);
    } catch (error) {}
  }
}

module.exports = new ProductsController();
