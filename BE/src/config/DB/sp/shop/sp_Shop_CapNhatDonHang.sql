CREATE PROC sp_Shop_CapNhatDonHang
@IDDonHang INT
AS
BEGIN
    UPDATE DON_HANG
    SET TrangThaiDonHang = 1
    FROM DON_HANG 
    WHERE IDDonHang = @IDDonHang;

    SELECT 1 AS Success, N'Xác nhận giao hàng thành công' AS Message;
END