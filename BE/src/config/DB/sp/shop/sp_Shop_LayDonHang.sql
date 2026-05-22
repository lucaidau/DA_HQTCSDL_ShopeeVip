CREATE PROC sp_Shop_LayDonHang
    @IDShop INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        'SP-ORD' + RIGHT('00000' + CAST(DH.IDDonHang AS VARCHAR(10)),5) AS IDDonHangFormat,
        DH.IDDonHang,
        NM.IDNguoiMua,
        TK.Ten AS TenNguoiMua,
        SP.TenSanPham,
        BS.BienThe AS TenBienThe,
        CT.SoLuong AS SoLuongMua,
        CT.GiaTien AS TongTien,
        DH.TrangThaiDonHang AS TrangThai,
        DH.NgayTao

    FROM DON_HANG DH
    JOIN NGUOI_MUA NM ON DH.IDNguoiMua = NM.IDNguoiMua
    JOIN TAI_KHOAN TK ON TK.IDTaiKhoan = NM.IDTaiKhoan

    JOIN CHI_TIET_DON_HANG CT ON CT.IDDonHang = DH.IDDonHang

    JOIN BAN_SAO_SAN_PHAM BS ON BS.IDBanSao = CT.IDBanSao
    JOIN SAN_PHAM SP ON BS.IDSanPham = SP.IDSanPham
    WHERE DH.IDShop = @IDShop
    ORDER BY DH.NgayTao DESC;
END

drop proc sp_Shop_LayDonHang
EXEC sp_Shop_LayDonHang 1