CREATE PROCEDURE sp_LayGioHang
    @IDNguoiDung INT
AS
    BEGIN
        SET NOCOUNT ON;

        SELECT 
            bs.IDSanPham,
            sp.TenSanPham,
            bs.BienThe,
            bs.GiaBan,
            bs.HinhAnh,
            (gh.SoLuongMua * bs.GiaBan) AS ThanhTien

        FROM GIO_HANG gh
        JOIN BAN_SAO_SAN_PHAM bs ON gh.IDBanSao = bs.IDBanSao
        JOIN SAN_PHAM sp ON sp.IDSanPham = bs.IDSanPham
        WHERE gh.IDNguoiMua = @IDNguoiDung
    END