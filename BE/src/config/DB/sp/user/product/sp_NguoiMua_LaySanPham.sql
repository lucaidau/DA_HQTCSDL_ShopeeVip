CREATE PROCEDURE sp_NguoiMua_LaySanPham
AS
    BEGIN
        SET NOCOUNT ON;
        SELECT sp.IDSanPham, sp.TenSanPham, sp.HinhAnh, MIN(bs.GiaBan) AS Gia
        FROM SAN_PHAM sp
        LEFT JOIN BAN_SAO_SAN_PHAM bs ON bs.IDSanPham = sp.IDSanPham
        LEFT JOIN SHOP s ON s.IDShop = sp.IDShop
        LEFT JOIN TAI_KHOAN tk ON tk.IDTaiKhoan = s.IDTaiKhoan
        WHERE sp.TrangThaiSP = 1 AND tk.TrangThaiTaiKhoan = 1
        GROUP BY sp.IDSanPham, sp.TenSanPham, sp.HinhAnh
        ORDER BY sp.IDSanPham ASC
    END