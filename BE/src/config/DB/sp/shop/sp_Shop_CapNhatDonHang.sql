CREATE PROC sp_Shop_CapNhatDonHang
@IDDonHang INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @IDShop INT, @TongTien DECIMAL(18,2);

    BEGIN TRY   
        BEGIN TRANSACTION
        IF EXISTS (SELECT 1 FROM DON_HANG WHERE TrangThaiDonHang = 1 AND IDDonHang = @IDDonHang)
        BEGIN
            RAISERROR(N'Đơn hàng đã được xác nhận', 16,1);
        END

        SELECT @IDShop = DH.IDShop, @TongTien = SUM(CT.GiaTien)
        FROM DON_HANG DH
        JOIN CHI_TIET_DON_HANG CT ON CT.IDDonHang = DH.IDDonHang
        WHERE CT.IDDonHang = @IDDonHang
        GROUP BY DH.IDShop;


        UPDATE DON_HANG
        SET TrangThaiDonHang = 1
        WHERE IDDonHang = @IDDonHang;

        DECLARE @SoDuCu DECIMAL(18,2), @NoiDung NVARCHAR(MAX);

        SELECT TOP 1 @SoDuCu = SoDu
        FROM VI
        WHERE @IDShop = IDShop
        ORDER BY IDGiaoDich DESC;

        SET @SoDuCu = ISNULL(@SoDuCu, 0);
        SET @NoiDung = N'Doanh thu từ đơn hàng #SP-ORD' + RIGHT('00000' + CAST(@IDDonHang AS VARCHAR(10)),5)

        INSERT INTO VI (IDShop, NoiDung, SoTien, SoDu, NgayThucHien) VALUES
        (@IDShop, @NoiDung, @TongTien, @SoDuCu + @TongTien, GETDATE());

        COMMIT TRANSACTION;

        SELECT 
            1 AS Success, 
            N'Xác nhận giao hàng thành công! Ví Shop đã ghi nhận dòng tiền mới thêm: ' + CAST(FORMAT(@TongTien,'N0') AS NVARCHAR(255)) + 'đ' AS Message;

    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

        DECLARE @ErrorMssg VARCHAR(MAX) = ERROR_MESSAGE();
        SELECT 0 AS Success, @ErrorMssg AS Message;
    END CATCH   
END

