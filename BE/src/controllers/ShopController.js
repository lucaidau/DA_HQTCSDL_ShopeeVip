const { sql, shopPoolPromise } = require("../config/connect");

class ShopController {
  // [GET] Shop/:id
  async sanPham(req, res) {
    try {
      const shopID = parseInt(req.params.id);

      const pool = await shopPoolPromise;
      const result = await pool
        .request()
        .input("IDShop", sql.Int, shopID)
        .execute("sp_Shop_LaySanPhamShop");

      return res.status(200).json({
        message: "Lấy sản phẩm shop thành công",
        shopProduct: result.recordset,
      });
    } catch (error) {
      console.log("Err: ", error);
      return res.status(500).json({ message: "Lỗi server!!" });
    }
  }
}

module.exports = new ShopController();
