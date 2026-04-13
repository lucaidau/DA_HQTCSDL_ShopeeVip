CREATE PROCEDURE sp_CapNhatGioHang
    @IDNguoiMua INT,
    @IDBanSao INT,
    @SoLuongMoi INT
AS
    BEGIN
        IF @SoLuongMoi <= 0
            BEGIN
                DELETE FROM GIO_HANG
                WHERE IDBanSao = @IDBanSao AND IDTaiKhoan = @IDNguoiMua
            END
        ELSE
            BEGIN
                UPDATE GIO_HANG
                SET SoLuongMua = @SoLuongMoi, NgayThem = GETDATE()
                WHERE @IDNguoiMua = IDTaiKhoan AND IDBanSao = @IDBanSao
            END
    END