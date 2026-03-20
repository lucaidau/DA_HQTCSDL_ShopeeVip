CREATE PROCEDURE sp_LaySanPham
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
    BEGIN
        SET NOCOUNT ON;
        DECLARE @OffsetRows INT;
        SET @OffsetRows = (@PageNumber -1 ) * @PageSize;

        SELECT sp.IDSanPham, sp.TenSanPham, sp.HinhAnh, MIN(bs.GiaBan) AS Gia
        FROM SAN_PHAM sp
        LEFT JOIN BAN_SAO_SAN_PHAM bs ON bs.IDSanPham = sp.IDSanPham
        GROUP BY sp.IDSanPham, sp.TenSanPham, sp.HinhAnh
        ORDER BY sp.IDSanPham DESC

        OFFSET @OffsetRows ROWS 
        FETCH NEXT @PageSize ROWS ONLY
    END