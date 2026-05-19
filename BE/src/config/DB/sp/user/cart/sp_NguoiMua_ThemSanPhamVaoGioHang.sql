CREATE PROCEDURE sp_NguoiMua_ThemSanPhamVaoGioHang
    @IDNguoiDung INT,
    @IDBanSao INT,
    @SoLuong INT
AS
    BEGIN
        SET NOCOUNT ON;

        IF EXISTS (SELECT 1 FROM GIO_HANG WHERE @IDBanSao = IDBanSao AND @IDNguoiDung = IDNguoiMua)
            BEGIN
                UPDATE GIO_HANG
                SET SoLuongMua = SoLuongMua + @SoLuong,
                    NgayThem = GETDATE()
                WHERE @IDNguoiDung = IDNguoiMua AND @IDBanSao = IDBanSao
            END

        ELSE
            BEGIN
                INSERT INTO GIO_HANG(IDNguoiMua, IDBanSao, SoLuongMua, NgayThem)
                VALUES(@IDNguoiDung, @IDBanSao, @SoLuong, GETDATE())
            END
    END
