CREATE PROC sp_Shop_XoaSanPham
    @IDShop INT,        
    @IDSanPham INT
AS
BEGIN
    SET NOCOUNT ON;
      BEGIN TRAN;
        IF NOT EXISTS (
            SELECT * FROM SAN_PHAM 
            WHERE IDSanPham = @IDSanPham AND IDShop = @IDShop
        )
        BEGIN
            ROLLBACK TRAN;
            PRINT N'Sản phẩm không thuộc shop này!!';
            RETURN;
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
        PRINT N'Đã xóa sản phẩm thành công!';
END
GO
exec sp_Shop_XoaSanPham 1,1