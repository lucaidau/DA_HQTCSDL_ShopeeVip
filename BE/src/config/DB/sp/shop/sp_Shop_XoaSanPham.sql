CREATE PROC sp_Shop_XoaSanPham
    @IDShop INT,        
    @IDSanPham INT
AS
BEGIN
    SET NOCOUNT ON;
     
    BEGIN TRY
        BEGIN TRAN;
        IF NOT EXISTS (
            SELECT * FROM SAN_PHAM 
            WHERE IDSanPham = @IDSanPham AND IDShop = @IDShop
        )
        BEGIN
            RAISERROR(N'Sản phẩm không tồn tại!',16,1);

        END
        
        UPDATE SAN_PHAM 
        SET TrangThaiSP = 0
        WHERE IDSanPham = @IDSanPham;
        
        UPDATE BAN_SAO_SAN_PHAM 
        SET TrangThaiBS = 0
        WHERE IDSanPham = @IDSanPham;
        
        DELETE FROM GIO_HANG 
        WHERE IDBanSao IN (
            SELECT IDBanSao FROM BAN_SAO_SAN_PHAM 
            WHERE IDSanPham = @IDSanPham
        );
        COMMIT TRAN;
            SELECT 1 AS Success, N'Xóa sản phẩm thành công' AS Message

        END TRY

        BEGIN CATCH
               IF @@TRANCOUNT > 0 
               BEGIN
                    SELECT 0 AS Success, ERROR_MESSAGE() AS Message
               END
        BEGIN
            ROLLBACK TRAN;
        END
        END CATCH
END;
GO