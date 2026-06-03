CREATE  PROC sp_Shop_SuaSanPham
@IDBanSao INT,
@TenBienThe NVARCHAR(50),
@GiaBan DECIMAL(18,2),
@TonKho INT,
@MoTa NVARCHAR(MAX),
@LinkHinhAnh VARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION
    BEGIN TRY
        IF EXISTS(SELECT 1 FROM BAN_SAO_SAN_PHAM WHERE IDBanSao = @IDBanSao)
        BEGIN
            UPDATE BAN_SAO_SAN_PHAM
            SET 
                SoLuongTonKho = @TonKho,
                GiaBan = @GiaBan,
                BienThe=@TenBienThe,
                HinhAnh = @LinkHinhAnh,
                TrangThaiBS = CASE WHEN @TonKho = 0 THEN 0 ELSE 1 END
            FROM BAN_SAO_SAN_PHAM 
            WHERE IDBanSao = @IDBanSao;

            UPDATE SP
            SET SP.MoTa = @MoTa
            FROM SAN_PHAM SP
            JOIN BAN_SAO_SAN_PHAM BS ON BS.IDSanPham = SP.IDSanPham

            COMMIT TRANSACTION;
            
            SELECT 1 AS Success, N'Cập nhật sản phẩm thành công' AS Message;
        END
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH;
END