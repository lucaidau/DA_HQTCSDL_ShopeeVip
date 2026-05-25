CREATE PROC sp_Shop_RutTien
@IDShop INT,
@SoTien DECIMAL(18,2),
@NoiDung NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            DECLARE @SoDuHienTai DECIMAL(18,2);

            SELECT TOP 1 @SoDuHienTai = SoDu
            FROM VI
            WHERE @IDShop = IDShop
            ORDER BY NgayThucHien DESC;

            IF @SoDuHienTai <= @SoTien OR @SoDuHienTai IS NULL
            BEGIN
                ROLLBACK TRANSACTION;
                SELECT 0 AS Success, (N'Số dư trong ví không đủ để thực hiện rút tiền') AS Message;
                RETURN;
            END

            DECLARE @SoDuMoi DECIMAL(18,2) = @SoDuHienTai - @SoTien;
            INSERT INTO VI(IDShop, NoiDung, SoTien, SoDu, NgayThucHien, LoaiGiaoDich) VALUES
            (@IDShop, @NoiDung, @SoTien,@SoDuMoi, GETDATE(), 0)

            COMMIT TRANSACTION;
            SELECT 1 AS Success, N'Yêu cầu rút tiền thành công' AS Message;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END;