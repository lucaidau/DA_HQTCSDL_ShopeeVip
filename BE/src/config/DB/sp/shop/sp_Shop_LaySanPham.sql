CREATE PROCEDURE sp_LaySanPhamShop
    @IDShop INT
AS
    BEGIN
        SET NOCOUNT ON;
        SELECT   
        SP.IDSanPham, 
        BS.IDBanSao,
        BS.HinhAnh, 
        SP.TenSanPham, BS.BienThe,
        MIN(BS.GiaBan) AS GiaBan, 
        BS.SoLuongTonKho, 
        SP.TrangThaiSP
        FROM SAN_PHAM SP
        LEFT JOIN BAN_SAO_SAN_PHAM BS ON SP.IDSanPham = BS.IDSanPham
        WHERE SP.IDShop = @IDShop
         GROUP BY 
        SP.IDSanPham,
        BS.HinhAnh,
        SP.TenSanPham,
        BS.SoLuongTonKho, 
        SP.TrangThaiSP,
        BS.BienThe,
        BS.IDBanSao
    ORDER BY SP.IDSanPham ASC;
    END

EXEC sp_LaySanPhamShop 1