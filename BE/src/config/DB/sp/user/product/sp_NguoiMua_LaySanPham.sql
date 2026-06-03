CREATE PROCEDURE sp_NguoiMua_LaySanPham
AS
    BEGIN
        SET NOCOUNT ON;
        SELECT 
        sp.IDSanPham, 
        sp.TenSanPham, 
        sp.HinhAnh,
        sp.GiaThapNhat
    FROM SAN_PHAM sp
    INNER JOIN BAN_SAO_SAN_PHAM bs ON bs.IDSanPham = sp.IDSanPham
    INNER JOIN SHOP s ON s.IDShop = sp.IDShop
    INNER JOIN TAI_KHOAN tk ON tk.IDTaiKhoan = s.IDTaiKhoan
    WHERE sp.TrangThaiSP = 1 
      AND tk.TrangThaiTaiKhoan = 1
      AND bs.TrangThaiBS = 1
    GROUP BY
        sp.IDSanPham, 
        sp.TenSanPham, 
        sp.HinhAnh,
        sp.GiaThapNhat
    END