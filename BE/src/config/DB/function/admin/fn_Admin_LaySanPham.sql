CREATE FUNCTION fn_Admin_LaySanPham()
RETURNS TABLE
RETURN
(
    SELECT
        TK.Ten, 
        SP.TenSanPham + ' : ' + BS.BienThe AS TenSP,
        BS.GiaBan,
        BS.HinhAnh,
        BS.SoLuongTonKho,
        BS.TrangThaiBS
    FROM BAN_SAO_SAN_PHAM BS
    JOIN SAN_PHAM SP ON SP.IDSanPham = BS.IDSanPham
    JOIN SHOP S ON S.IDShop = SP.IDShop
    JOIN TAI_KHOAN TK ON TK.IDTaiKhoan = S.IDTaiKhoan
)