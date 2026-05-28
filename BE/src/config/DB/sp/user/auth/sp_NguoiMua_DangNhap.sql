CREATE PROCEDURE sp_NguoiMua_DangNhap
    @TenDangNhap VARCHAR(30),
    @MatKhau VARCHAR(100)

AS
    BEGIN
        SET NOCOUNT ON;

        IF EXISTS(SELECT 1 FROM TAI_KHOAN WHERE TrangThaiTaiKhoan = 0 AND @TenDangNhap = TenDangNhap AND @MatKhau = MatKhau)
        BEGIN
            RAISERROR(N'Tài khoản đã bị khóa, liên hệ Admin để mở khóa tài khoản', 16,1)
        END

        IF EXISTS (SELECT 1 FROM TAI_KHOAN WHERE @TenDangNhap = TenDangNhap AND @MatKhau = MatKhau AND TrangThaiTaiKhoan = 1)
        BEGIN
            SELECT 
            tk.IDTaiKhoan,
            tk.Ten,
            nm.IDNguoiMua,
            s.IDShop,
			CASE
                WHEN s.IDShop IS NOT NULL THEN 'SHOP'
                WHEN nm.IDNguoiMua IS NOT NULL THEN 'BUYER'
            END AS 'VaiTro'
             FROM TAI_KHOAN tk
			 LEFT JOIN NGUOI_MUA nm ON tk.IDTaiKhoan = nm.IDTaiKhoan
			 LEFT JOIN SHOP s ON s.IDTaiKhoan = tk.IDTaiKhoan
            WHERE tk.TenDangNhap = @TenDangNhap AND MatKhau = @MatKhau
        END

        ELSE
        BEGIN
            RAISERROR(N'Tên đăng nhập hoặc mật khẩu không đúng', 16, 1)
        END

        
    END
