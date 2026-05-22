const { MAX } = require("mssql");
const { sql, customerPoolPromise } = require("../../config/connect");

class PaymentController {
  //[POST] /thanhtoan
  async thanhToan(req, res) {
    const { userID, buyList, note } = req.body;
    const pool = await customerPoolPromise;
    const transaction = new sql.Transaction(pool);
    try {
      if (!buyList || buyList.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Danh sách mua trống!" });
      }

      const productsByShop = buyList.reduce((acc, item) => {
        const ShopID = item.IDShop;
        if (!acc[ShopID]) acc[ShopID] = [];
        acc[ShopID].push(item);
        return acc;
      }, {});

      await transaction.begin();
      const createOrderIDs = [];

      for (const shopID in productsByShop) {
        const currShopItems = productsByShop[shopID];

        // 1. Tạo bảng dữ liệu tạm TVP khớp cấu trúc SQL Server
        const tableDT = new sql.Table("TYPE_DanhSachMuaHang");
        tableDT.columns.add("IDBanSao", sql.Int);
        tableDT.columns.add("SoLuongMua", sql.Int);
        tableDT.columns.add("ThanhTien", sql.Decimal(18, 2));

        currShopItems.forEach((item) => {
          tableDT.rows.add(
            parseInt(item.IDBanSao),
            parseInt(item.SoLuongMua),
            parseFloat(item.ThanhTien || item.GiaBan * item.SoLuongMua),
          );
        });

        const request = new sql.Request(transaction);
        const result = await request
          .input("IDNguoiMua", sql.Int, parseInt(userID))
          .input("IDShop", sql.Int, parseInt(shopID))
          .input("DanhSachMua", tableDT)
          .input("GhiChu", sql.NVarChar(MAX), note)
          .execute("sp_NguoiMua_ThanhToan");

        const procResponse = result.recordset[0];
        if (!procResponse || procResponse.Success === 0) {
          if (transaction.isOpen) await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: procResponse
              ? procResponse.Message
              : "Lỗi xử lí đơn hàng!",
          });
        }
        createOrderIDs.push(procResponse);
      }

      await transaction.commit();
      return res.status(201).json({
        success: true,
        message: "Thanh toán thành công!",
        idDonHang: createOrderIDs,
      });
    } catch (error) {
      if (transaction.isOpen) {
        await transaction.rollback();
      }
      console.log("Err tại PaymentController:", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi hệ thống backend!" });
    }
  }
}

module.exports = new PaymentController();
