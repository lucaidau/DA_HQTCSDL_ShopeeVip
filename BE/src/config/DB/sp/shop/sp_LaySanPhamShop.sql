CREATE PROCEDURE sp_LaySanPhamShop
    @IDShop INT
AS
    BEGIN
        SET NOCOUNT ON;

        SELECT
        FROM SAN_PHAM sp
        JOIN BAN_SAO_SAN_PHAM bs ON sp.IDSanPham = bs.IDSanPham
    END