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

  //[POST] /shop/themsanpham
  async themSanPham(req, res) {
    try {
    } catch (error) {}
  }

  //[GET] shop/donhang/:id
  async layDonHang(req, res) {
    try {
      const shopID = parseInt(req.params.id);

      const pool = await shopPoolPromise;
      const result = await pool
        .request()
        .input("IDShop", sql.Int, shopID)
        .execute("sp_Shop_LayDonHang");
      return res.status(200).json({
        success: true,
        message: "Lấy đơn hàng thành công!",
        orders: result.recordset,
      });
    } catch (error) {
      console.log("Lỗi lấy đơn hàng: ", error);
      return res.status(500).json({ success: false, message: "Lỗi server!" });
    }
  }

  // [PUT] /shop/xacnhan
  async xacNhanDonHang(req, res) {
    try {
      const { orderID } = req.body;

      const pool = await shopPoolPromise;
      const result = await pool
        .request()
        .input("IDDonHang", sql.Int, orderID)
        .execute("sp_Shop_CapNhatDonHang");

      const procResponse = result.recordset[0];

      if (procResponse && procResponse.Success === 1) {
        return res.status(200).json({
          success: true,
          message: procResponse.Message,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Không thể cập nhật trạng thái đơn hàng!",
        });
      }

      return res
        .status(204)
        .json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
      console.log("Lỗi cập nhật đơn hàng: ", error);
      return res.status(500).json({ success: false, message: "Lỗi Server!" });
    }
  }
}

module.exports = new ShopController();
