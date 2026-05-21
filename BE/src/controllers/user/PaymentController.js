const { sql, poolPromise } = require("../../config/connect");

class PaymentController {
  //[POST] /thanhtoan
  async thanhToan(req, res) {
    try {
      const { userID, buyList } = req.body;

      const pool = await poolPromise;
      const transactionHistory = [];

      for (const item of buyList) {
        const result = await pool
          .request()
          .input("IDNguoiMua", sql.Int, userID)
          .input("IDBanSao", sql.VarChar(sql.MAX), item.copyID)
          .input("SoLuongMua", sql.Int, item.quantity)
          .input("TongTien", sql.Decimal(18, 2), item.total)
          .execute("sp_NguoiMua_ThanhToan");

        const procResponse = result.recordset[0];
        if (!procResponse || procResponse.Success === 0) {
          return res.status(400).json({
            success: false,
            message: `Thanh toán thất bại cho đơn hàng ${item.TenSP}. Lý do: ${procResponse ? procResponse.Message : "Lỗi không xác định"}`,
          });
        }
        transactionHistory.push(procResponse);
      }

      return res.status(201).json({
        success: true,
        message: "Thanh toán thành công",
        orders: transactionHistory,
      });
    } catch (error) {
      console.log("Err: ", error);
      return res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }
}

module.exports = new PaymentController();
