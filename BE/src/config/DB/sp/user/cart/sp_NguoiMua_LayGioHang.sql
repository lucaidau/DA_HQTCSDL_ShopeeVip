CREATE PROCEDURE sp_NguoiMua_LayGioHang
    @IDNguoiDung INT
AS
    BEGIN
        SET NOCOUNT ON;

        SELECT 
            bs.IDSanPham,
            bs.IDBanSao,
            sp.TenSanPham,
            bs.BienThe,
            bs.GiaBan,
            bs.HinhAnh,
            gh.SoLuongMua,
            (gh.SoLuongMua * bs.GiaBan) AS ThanhTien

        FROM GIO_HANG gh
        JOIN BAN_SAO_SAN_PHAM bs ON gh.IDBanSao = bs.IDBanSao
        JOIN SAN_PHAM sp ON sp.IDSanPham = bs.IDSanPham
        WHERE gh.IDNguoiMua = @IDNguoiDung;
    END

DROP PROC IF EXISTS sp_LayGioHang