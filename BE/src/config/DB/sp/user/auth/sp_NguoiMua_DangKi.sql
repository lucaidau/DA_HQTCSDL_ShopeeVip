CREATE PROCEDURE sp_NguoiMua_DangKi
    @Ten NVARCHAR(50),
    @TenDangNhap VARCHAR(30),
    @Email VARCHAR(255),
    @SDT VARCHAR(10),
    @GioiTinh INT,
    @MatKhau VARCHAR(100),
    @Loai INT
AS
    BEGIN
        SET NOCOUNT ON;
        IF EXISTS (SELECT 1 FROM TAI_KHOAN WHERE @TenDangNhap = TenDangNhap)
        BEGIN
            RAISERROR(N'Tên đăng nhập hoặc email đã tồn tại!!',16,1);
            RETURN;
        END
        
        IF EXISTS (SELECT 1 FROM TAI_KHOAN WHERE @SDT = SDT)
        BEGIN
            RAISERROR(N'Số điện thoại đã được đăng ký',16,1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM TAI_KHOAN WHERE @Email = Email)
        BEGIN
            RAISERROR(N'Email đã được đăng kí', 16,1);
            RETURN;
        END

        BEGIN TRANSACTION;
        BEGIN TRY
            DECLARE @IDTemp INT;
            INSERT INTO TAI_KHOAN(TenDangNhap, Ten, SDT, Email, GioiTinh, MatKhau,TrangThaiTaiKhoan)
            VALUES(@TenDangNhap, @Ten, @SDT, @Email, @GioiTinh, @MatKhau,1);

            SET @IDTemp = SCOPE_IDENTITY();

            IF @Loai = 1
            BEGIN
                INSERT INTO NGUOI_MUA( IDTaiKhoan) VALUES(@IDTemp);
            END

            ELSE IF @Loai = 2
            BEGIN
                INSERT INTO SHOP(IDTaiKhoan) VALUES(@IDTemp);
            END
            COMMIT TRANSACTION;
        END TRY

        BEGIN CATCH
            IF @@TRANCOUNT > 0
            BEGIN
                ROLLBACK TRANSACTION;
                RAISERROR(N'Đăng kí không hợp lệ!', 16,1);
            END  
        END CATCH
    END

