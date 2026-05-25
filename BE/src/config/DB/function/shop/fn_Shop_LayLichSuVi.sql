CREATE FUNCTION fn_Shop_LayLichSuVi(@IDShop INT)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        IDGiaoDich, 
        'MGD-'+RIGHT('00000'+CAST(IDGiaoDich AS NVARCHAR(10)),5) AS IDGiaoDichFormat,
        FORMAT(NgayThucHien, 'dd-MM-yyyy HH:mm')  AS NgayThucHien,
        LoaiGiaoDich,
        NoiDung,
        SoTien,
        SoDu
    FROM VI
    WHERE IDShop = 1
)