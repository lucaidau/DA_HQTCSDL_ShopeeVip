CREATE PROCEDURE sp_LayChiTietSanPham
    @IDSanPham INT
AS  
    BEGIN
        SET NOCOUNT ON;
        SELECT TenSanPham, MoTa, sp.HinhAnh, bs.HinhAnh, SoLuongTonKho, GiaBan, BienThe, TrangThai
        FROM SAN_PHAM sp
        LEFT JOIN BAN_SAO_SAN_PHAM bs ON bs.IDSanPham = sp.IDSanPham
        WHERE bs.IDSanPham = @IDSanPham
    END