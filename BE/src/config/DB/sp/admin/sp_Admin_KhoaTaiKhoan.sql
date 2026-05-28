CREATE PROC sp_Admin_KhoaTaiKhoan
@IDTaiKhoan INT
AS 
BEGIN
    BEGIN TRY
    BEGIN TRANSACTION
        UPDATE TAI_KHOAN
        SET TrangThaiTaiKhoan = 1 - TrangThaiTaiKhoan
        WHERE @IDTaiKhoan = IDTaiKhoan;    

        DECLARE @TrangThaiMoi BIT;
        SELECT @TrangThaiMoi = TrangThaiTaiKhoan
        FROM TAI_KHOAN
        WHERE IDTaiKhoan = @IDTaiKhoan;

        COMMIT TRANSACTION;
        IF (@TrangThaiMoi = 0)
            SELECT 1 AS Success, N'Đã khóa tài khoản' AS Message; 
        ELSE
            SELECT 1 AS Success, N'Đã mở khóa tài khoản' AS Message; 

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END