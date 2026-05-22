CREATE PROC sp_Shop_XoaSanPham
    @IDBanSao INT
AS
BEGIN
    SET NOCOUNT ON;
        UPDATE SAN_PHAM 
        SET TrangThaiSP = 0
        WHERE IDSanPham = @IDBanSao;
        
        DELETE FROM GIO_HANG 
        WHERE IDBanSao IN (
            SELECT IDBanSao FROM BAN_SAO_SAN_PHAM 
            WHERE IDSanPham = @IDBanSao
        );

            SELECT 1 AS Success, N'Xóa sản phẩm thành công' AS Message

END;
GO