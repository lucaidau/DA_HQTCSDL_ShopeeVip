CREATE PROCEDURE sp_NguoiMua_CapNhatGioHang
    @IDNguoiMua INT,
    @IDBanSao INT,
    @SoLuongMoi INT
AS
    BEGIN
        IF @SoLuongMoi <= 0
            BEGIN
                DELETE FROM GIO_HANG
                WHERE IDBanSao = @IDBanSao AND IDNguoiMua = @IDNguoiMua
            END
        ELSE
            BEGIN
                UPDATE GIO_HANG
                SET SoLuongMua = @SoLuongMoi, NgayThem = GETDATE()
                WHERE @IDNguoiMua = IDNguoiMua AND IDBanSao = @IDBanSao
            END
    END