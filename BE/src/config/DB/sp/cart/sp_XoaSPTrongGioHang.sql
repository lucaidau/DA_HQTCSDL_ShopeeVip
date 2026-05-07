CREATE PROC sp_XoaSPTrongGioHang
@IDTaiKhoan INT,
@IDBanSao INT
AS
BEGIN
    DELETE FROM GIO_HANG 
    WHERE IDBanSao = @IDBanSao AND IDTaiKhoan = @IDTaiKhoan;
END;