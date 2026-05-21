CREATE PROCEDURE sp_NguoiMua_LayGioHang
    @IDNguoiDung INT
AS
    BEGIN
        SET NOCOUNT ON;

        SELECT 
            sp.IDShop,
            bs.IDSanPham,
            bs.IDBanSao,
            sp.TenSanPham,
            bs.HinhAnh,
            bs.BienThe,
            bs.GiaBan,
            gh.SoLuongMua,
            (gh.SoLuongMua * bs.GiaBan) AS ThanhTien,
            Ten,
            SDT,
            DiaChi
        FROM GIO_HANG gh
        JOIN BAN_SAO_SAN_PHAM bs ON gh.IDBanSao = bs.IDBanSao
        JOIN SAN_PHAM sp ON sp.IDSanPham = bs.IDSanPham
        JOIN NGUOI_MUA NM ON NM.IDNguoiMua = @IDNguoiDung
        JOIN TAI_KHOAN TK ON TK.IDTaiKhoan = NM.IDTaiKhoan
        WHERE gh.IDNguoiMua = @IDNguoiDung;
    END;