CREATE PROC sp_NguoiMua_ThanhToan
@IDNguoiMua INT,
@IDBanSao INT,
@SoLuongMua INT,
@DiaChi NVARCHAR(255),
@TongTien DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @TonKho INT;
        SELECT @TonKho = SoLuongTonKho
        FROM BAN_SAO_SAN_PHAM WITH (UPDLOCK)
        WHERE @IDBanSao = IDBanSao;

        IF(@TonKho < @SoLuongMua)
        BEGIN
            RAISERROR(N'',16,1);
        END

        UPDATE BAN_SAO_SAN_PHAM
        SET SoLuongTonKho = SoLuongTonKho - @SoLuongMua
        WHERE IDBanSao = @IDBanSao;
            
        DECLARE @NewIDDonHang INT;

    END TRY

    BEGIN CATCH
        IF(@@TRANCOUNT > 0)
            ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END;