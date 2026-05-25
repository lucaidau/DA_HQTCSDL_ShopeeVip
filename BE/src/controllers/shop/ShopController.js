const { MAX } = require("mssql");
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
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server!!" + error });
    }
  }

  //[POST] /shop/themsanpham
  async themSanPham(req, res) {
    try {
      const { shopID, productName, imgLink, desc, copyList } = req.body;

      const typeTable = new sql.Table();
      typeTable.columns.add("SoLuongTonKho", sql.Int);
      typeTable.columns.add("GiaBan", sql.Decimal(18, 2));
      typeTable.columns.add("BienThe", sql.NVarChar(50));
      typeTable.columns.add("HinhAnh", sql.VarChar(MAX));
      typeTable.columns.add("TrangThaiBS", sql.Int);

      if (copyList && copyList.length > 0) {
        copyList.forEach((item) => {
          typeTable.rows.add(
            item.SoLuongTonKho,
            item.GiaBan,
            item.BienThe,
            item.HinhAnh,
            item.TrangThaiBS,
          );
        });
      }

      const pool = await shopPoolPromise;
      const result = await pool
        .request()
        .input("IDShop", sql.Int, shopID)
        .input("TenSP", sql.NVarChar(255), productName)
        .input("HinhAnhSP", sql.VarChar(MAX), imgLink)
        .input("MoTa", sql.NVarChar(MAX), desc)
        .input("ListBienThe", typeTable)
        .execute("sp_Shop_ThemSanPham");

      const newProduct = result.recordset[0].IDSanPhamMoi;

      return res.status(201).json({
        success: true,
        message: "Thêm sản phẩm thành công",
        idSanPhamMoi: newProduct,
      });
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error });
    }
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

  // [PUT] /shop/donhang/xacnhan
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

  //[GET] //shop/vi/:id
  async layVi(req, res) {
    try {
      const IDShop = parseInt(req.params.id);

      const pool = await shopPoolPromise;
      const resultSoDu = await pool
        .request()
        .input("IDShop", sql.Int, IDShop)
        .query(
          "SELECT TOP 1 SoDu FROM VI WHERE IDShop = @IDShop ORDER BY NgayThucHien DESC",
        );

      const resultLichSu = await pool
        .request()
        .input("IDShop", sql.Int, IDShop)
        .query("SELECT * FROM dbo.fn_Shop_LayLichSuVi(@IDShop)");

      return res.status(200).json({
        success: true,
        message: "Lấy thông tin và lịch sử thành công",
        balance: resultSoDu.recordset[0].SoDu,
        transactions: resultLichSu.recordset,
      });
    } catch (error) {
      console.log("Lỗi lấy thông tin shop: ", error.message);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  async rutTien(req, res) {
    try {
      const { shopID, amount, desc } = req.body;

      const pool = await shopPoolPromise;
      const result = await pool
        .request()
        .input("IDShop", sql.Int, shopID)
        .input("SoTien", sql.Decimal(18, 2), amount)
        .input("NoiDung", sql.NVarChar(255), desc)
        .execute("sp_Shop_RutTien");

      const procResponse = result.recordset[0];
      if (procResponse.Success && procResponse) {
        return res.status(201).json({
          success: true,
          message: procResponse.Message,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: procResponse ? procResponse.Message : "Rút tiền thất bại",
        });
      }
    } catch (error) {
      console.log("Lỗi Server: ", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ShopController();
