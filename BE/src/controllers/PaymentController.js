const { sql, poolPromise } = require("../config/connect");

class PaymentController {
  //[POST] /thanhtoan
  async layThanhToan(req, res) {
    try {
      const { userID, listID, note } = req.body;

      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("IDNguoiMua", sql.Int, userID)
        .input("ListID", sql.VarChar(sql.MAX), listID)
        .input("GhiChu", sql.NVarChar(sql.MAX), note)
        .execute("sp_LayThanhToan");

      return res.status(201).json({
        message: "Thanh toán thành công",
        data: result.recordsets,
      });
    } catch (error) {
      console.log("Err: ", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }
}

module.exports = new PaymentController();
