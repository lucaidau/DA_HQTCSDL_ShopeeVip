CREATE PROCEDURE sp_Admin_KhoaSanPham
@IDBanSao INT
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION
            UPDATE BAN_SAO_SAN_PHAM
            SET TrangThaiBS = 1 - TrangThaiBS
            WHERE IDBanSao = @IDBanSao;

            DECLARE @TrangThaiMoi INT;
            SELECT @TrangThaiMoi = TrangThaiBS
            FROM BAN_SAO_SAN_PHAM
            WHERE IDBanSao = @IDBanSao;

            COMMIT TRANSACTION;

            IF(@TrangThaiMoi = 0)
                SELECT 1 AS Success, N'Đã khóa sản phẩm' AS Message;
            ELSE
                SELECT 1 AS Success, N'Đã mở khóa sản phẩm' AS Message;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END