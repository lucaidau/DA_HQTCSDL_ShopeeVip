CREATE PROCEDURE sp_DangKi
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
        IF EXISTS (SELECT * FROM TAI_KHOAN WHERE @TenDangNhap = TenDangNhap)
        BEGIN
            RAISERROR(N'Tên đăng nhập đã tồn tại!!',16,1);
            RETURN;
        END
        
        IF EXISTS (SELECT * FROM TAI_KHOAN WHERE @SDT = SDT)
        BEGIN
            RAISERROR(N'Số điện thoại đã được đăng ký',16,1);
            RETURN;
        END

        BEGIN TRANSACTION;
        BEGIN TRY
            DECLARE @IDTemp INT
            INSERT INTO TAI_KHOAN(TenDangNhap, Ten, SDT, Email, GioiTinh, MatKhau)
            VALUES(@TenDangNhap, @Ten, @SDT, @Email, @GioiTinh, @MatKhau);

            SET @IDTemp = SCOPE_IDENTITY()

            IF @Loai = 1
            BEGIN
                INSERT INTO NGUOI_MUA( IDTaiKhoan, TrangThai) VALUES(@IDTemp, 1);
            END

            ELSE IF @Loai = 2
            BEGIN
                INSERT INTO SHOP(IDTaiKhoan, TrangThai) VALUES(@IDTemp,1);
            END
            COMMIT TRANSACTION;
        END TRY

        BEGIN CATCH
            IF @@TRANCOUNT > 0
            BEGIN
                ROLLBACK TRANSACTION;
                DECLARE @ERR NVARCHAR(100) = ERROR_MESSAGE();

                THROW 50000,@ERR,1;
            END  
        END CATCH
    END