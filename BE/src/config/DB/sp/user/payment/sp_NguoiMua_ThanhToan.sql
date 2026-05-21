CREATE PROC sp_NguoiMua_ThanhToan
@IDNguoiMua INT,
@IDBanSao INT,
@SoLuongMua INT,
@TongTien DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @DiaChi NVARCHAR(255), @IDShop INT,  @GiaBanHienTai DECIMAL(18,2), @TonKho INT;

        SELECT
            @IDShop = SP.IDShop,
            @TonKho = BS.SoLuongTonKho,
            @GiaBanHienTai = BS.GiaBan
        FROM BAN_SAO_SAN_PHAM BS WITH (UPDLOCK)
        JOIN SAN_PHAM SP ON SP.IDSanPham = BS.IDSanPham
        WHERE BS.IDBanSao = @IDBanSao;

        -- Kiểm tra số lượng trong kho nếu số lượng mua > số lượng còn thì hủy
        IF(@TonKho < @SoLuongMua OR @TonKho IS NULL)
        BEGIN
            RAISERROR(N'Sản phẩm hết hàng hoặc không đủ hàng trong kho!',16,1);
        END

        -- Trừ số lượng trong kho
        UPDATE BAN_SAO_SAN_PHAM
        SET SoLuongTonKho = SoLuongTonKho - @SoLuongMua
        WHERE IDBanSao = @IDBanSao;
            
        -- Thêm vào đơn hàng mới
        DECLARE @NewIDDonHang INT;
        INSERT INTO DON_HANG(IDNguoiMua, IDShop, NgayTao, TrangThaiDonHang)VALUES
        (@IDNguoiMua, @IDShop, GETDATE(), 0);
        SET @NewIDDonHang = SCOPE_IDENTITY();

        -- Tạo chi tiết đơn hàng
        INSERT INTO CHI_TIET_DON_HANG (IDDonHang, IDBanSao, GiaLucMua, SoLuonG, GiaTien) VALUES
        (@NewIDDonHang, @IDBanSao, @GiaBanHienTai, @SoLuongMua, @TongTien);

        -- Dọn dẹp giỏ hàng sau khi thanh toán
        DELETE FROM GIO_HANG
        WHERE IDNguoiMua = @IDNguoiMua AND IDBanSao = @IDBanSao;

        COMMIT TRANSACTION;

        SELECT 
            @NewIDDonHang AS IDDonHang,
            @IDNguoiMua AS IDNguoiMua,
            @IDBanSao AS  IDBanSao,
            @SoLuongMua AS SoLuong,
            @TongTien AS TongTien,
            1 AS Success,
            N'Thanh toán thành công!' AS Message
    END TRY 

    BEGIN CATCH
        IF(@@TRANCOUNT > 0)
            ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END;