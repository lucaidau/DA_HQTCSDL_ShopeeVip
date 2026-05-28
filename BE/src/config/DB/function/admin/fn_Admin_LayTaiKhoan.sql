GO
CREATE FUNCTION fn_Admin_LayTaiKhoan()
RETURNS TABLE
AS
RETURN
(
    SELECT 
        TK.IDTaiKhoan,
        TK.TenDangNhap,
        TK.Ten,
        TK.Email,
        TK.SDT,
        TK.TrangThaiTaiKhoan,
        CASE
            WHEN S.IDShop IS NOT NULL THEN 'Shop'
            WHEN NM.IDNguoiMua IS NOT NULL THEN 'Khách hàng'
            WHEN S.IDShop IS NULL AND NM.IDNguoiMua IS NULL THEN 'Admin'
        END AS VaiTro
    FROM TAI_KHOAN TK
    LEFT JOIN SHOP S ON S.IDTaiKhoan = TK.IDTaiKhoan
    LEFT JOIN NGUOI_MUA NM ON NM.IDTaiKhoan = TK.IDTaiKhoan

)
