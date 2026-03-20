const{sql,poolPromise} =require("../config/connect")


class CartController{
    //[GET] /giohang/:id
async layGioHang(req,res){
    try {
        const userID = parseInt(req.params.id)
        const pool = await poolPromise;
        const result = await pool.request()
        .input("IDNguoiDung", userID)
        .execute('sp_LayGioHang')

        return res.status(200).json({message: "Lấy giỏ hàng thành công", cart: result.recordset})
    } catch (error) {
        console.log("Err: ", error);
        return res.status(500).json({message: "Lỗi hệ thống"})
    }
}

    //[POST] /giohang/themsanpham
    async themSanPhamVaoGioHang(req, res)
{
    try {
        const {userID, copyID, quantity} = req.body

        const pool = await poolPromise;
        const result = await pool.request()
        .input("IDNguoiDung", sql.Int, userID)
        .input("IDBanSao", sql.Int, copyID)
        .input("SoLuong", sql.Int, quantity)
        .execute("sp_ThemSanPhamVaoGioHang")

        return res.status(201).json({message: "Thêm thành công", products: result.recordset})
    } catch (error) {
        console.log("Err: ", error);
        return res.status(500).json({message: "Lỗi hệ thống"})
        
    }
}
}

module.exports = new CartController()