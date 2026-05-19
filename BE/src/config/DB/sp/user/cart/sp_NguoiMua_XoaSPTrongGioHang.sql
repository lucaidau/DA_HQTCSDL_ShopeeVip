CREATE PROC sp_NguoiMua_XoaSPTrongGioHang
@IDTaiKhoan INT,
@IDBanSao INT
AS
BEGIN
    DELETE FROM GIO_HANG 
    WHERE IDBanSao = @IDBanSao AND IDNguoiMua = @IDTaiKhoan;
END;