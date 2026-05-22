
CREATE PROCEDURE sp_Shop_LaySanPham
    @IDShop INT
AS
    BEGIN
        SET NOCOUNT ON;
        SELECT   
        SP.IDSanPham,
        BS.IDBanSao,
        BS.HinhAnh, 
        SP.TenSanPham ,
        BS.BienThe ,
        BS.GiaBan, 
        BS.SoLuongTonKho, 
        BS.TrangThaiBS
        FROM SAN_PHAM SP
        LEFT JOIN BAN_SAO_SAN_PHAM BS ON SP.IDSanPham = BS.IDSanPham
        WHERE SP.IDShop = @IDShop AND TrangThaiSP = 1;
        
    END
DROP PROC sp_Shop_LaySanPham
EXEC sp_Shop_LaySanPham 1