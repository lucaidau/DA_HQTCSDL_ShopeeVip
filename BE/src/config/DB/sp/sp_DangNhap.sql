CREATE PROCEDURE sp_DangNhap
    @TenDangNhap VARCHAR(30),
    @MatKhau VARCHAR(100)

AS
    BEGIN
        SET NOCOUNT ON;

        IF EXISTS (SELECT * FROM TAI_KHOAN WHERE @TenDangNhap = TenDangNhap AND @MatKhau = MatKhau)
        BEGIN
            SELECT *
            FROM TAI_KHOAN
            WHERE TenDangNhap = @TenDangNhap
        END

        ELSE
        BEGIN
            RAISERROR(N'Tên đăng nhập hoặc mật khẩu không đúng', 16, 1)
        END
    END
