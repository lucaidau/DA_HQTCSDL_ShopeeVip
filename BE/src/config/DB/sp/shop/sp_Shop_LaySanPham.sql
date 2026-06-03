
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
        SP.MoTa,
        BS.TrangThaiBS
        FROM SAN_PHAM SP
        LEFT JOIN BAN_SAO_SAN_PHAM BS ON SP.IDSanPham = BS.IDSanPham  AND BS.TrangThaiBS != 2
        WHERE SP.IDShop = @IDShop;
        
    END
