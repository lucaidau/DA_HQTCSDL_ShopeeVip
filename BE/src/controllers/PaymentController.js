const {sql,poolPromise} = require('../config/connect')

class PaymentController{
    //[GET] /thanhtoan
    async layThanhToan(req,res)
    {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
            .execute("sp_LayThanhToan")
        } catch (error) {
           console.log("Err: ", error);
           return res.status(500).json({message: "Lỗi server"})
        }
    }
}

module.exports = new PaymentController()