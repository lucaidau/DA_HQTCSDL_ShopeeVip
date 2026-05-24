CREATE PROC sp_Shop_ThemSanPham
@IDShop INT,
@TenSP NVARCHAR(255),
@HinhAnhSP VARCHAR(MAX),
@MoTa NVARCHAR(MAX),
@ListBienThe TYPE_BienTheSP READONLY

AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            INSERT INTO SAN_PHAM(IDShop,TenSanPham,MoTa,HinhAnh,TrangThaiSP) VALUES
            (@IDShop, @TenSP,@MoTa,@HinhAnhSP,1);

            DECLARE @IDShopTemp INT = SCOPE_IDENTITY();

            INSERT INTO BAN_SAO_SAN_PHAM(IDSanPham,SoLuongTonKho,GiaBan,BienThe,HinhAnh, TrangThaiBS)
            SELECT @IDShopTemp, SoLuongTonKho,GiaBan,BienThe,HinhAnh,TrangThaiBS
            FROM @ListBienThe;

            COMMIT TRANSACTION;

            SELECT @IDShopTemp AS IDSanPhamMoi;
    END TRY

    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMssg NVARCHAR(MAX) = ERROR_MESSAGE();
        RAISERROR(@ErrorMssg, 16,1);
    END CATCH
END;