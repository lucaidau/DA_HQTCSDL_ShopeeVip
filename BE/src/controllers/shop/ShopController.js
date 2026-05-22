const { sql, shopPoolPromise } = require("../../config/connect.js");

class ShopController {
  // [GET] shop/:id
  async laySanPham(req, res) {
    try {
      const shopID = parseInt(req.params.id);

      const pool = await shopPoolPromise;
      const result = await pool
        .request()
        .input("IDShop", sql.Int, shopID)
        .execute("sp_Shop_LaySanPham");

      return res.status(200).json({
        success: true,
        message: "Lấy sản phẩm shop thành công",
        shopProduct: result.recordset,
      });
    } catch (error) {
      console.log("Err: ", error);
      return res.status(500).json({ success: false, message: "Lỗi server!!" });
    }
  }
}

module.exports = new ShopController();
