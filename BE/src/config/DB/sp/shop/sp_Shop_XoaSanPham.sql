CREATE PROC sp_Shop_XoaSanPham
@IDBanSao INT
AS
BEGIN
    IF EXISTS(SELECT 1 FROM BAN_SAO_SAN_PHAM WHERE IDBanSao = @IDBanSao)
    BEGIN   
        DECLARE @IDSanPham INT;

        SELECT @IDSanPham = IDSanPham
        FROM BAN_SAO_SAN_PHAM 
        WHERE IDBanSao = @IDBanSao;

        UPDATE BAN_SAO_SAN_PHAM
        SET TrangThaiBS = 2
        WHERE IDBanSao = @IDBanSao;

        IF NOT EXISTS(SELECT 1 FROM BAN_SAO_SAN_PHAM WHERE IDSanPham = @IDSanPham AND TrangThaiBS != 2)
        BEGIN
            UPDATE SAN_PHAM
            SET TrangThaiSP = 0
            WHERE IDSanPham = @IDSanPham;
        END

        SELECT 1 AS Success, N'Xóa sản phẩm thành công' AS Message;
    END
    ELSE
    BEGIN
        SELECT 0 AS Success, N'Không tìm thấy sản phẩm' AS Message;
    END
END