CREATE PROCEDURE sp_ThemSanPhamVaoGioHang
    @IDNguoiDung INT,
    @IDBanSao INT,
    @SoLuong INT
AS
    BEGIN
        SET NOCOUNT ON;

        IF EXISTS (SELECT 1 FROM GIO_HANG WHERE @IDBanSao = IDBanSao AND @IDNguoiDung = IDTaiKhoan)
            BEGIN
                UPDATE GIO_HANG
                SET SoLuongMua = SoLuongMua + @SoLuong,
                    NgayThem = GETDATE()
                WHERE @IDNguoiDung = IDTaiKhoan AND @IDBanSao = IDBanSao
            END

        ELSE
            BEGIN
                INSERT INTO GIO_HANG(IDTaiKhoan, IDBanSao, SoLuongMua, NgayThem)
                VALUES(@IDNguoiDung, @IDBanSao, @SoLuong, GETDATE())
            END
    END
