CREATE PROC sp_NguoiMua_ThanhToan
@IDNguoiMua INT,
@IDShop INT,
@DanhSachMua dbo.TYPE_DanhSachMuaHang READONLY,
@Ghichu NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @IDBanSao INT, @SoLuongMua INT, @TonKho INT, @TongTien DECIMAL(18,2), @GiaHienTai DECIMAL(18,2);
    DECLARE @NewIDDonHang INT;

    BEGIN TRY
        INSERT INTO DON_HANG(IDNguoiMua, IDShop, NgayTao, TrangThaiDonHang) VALUES
        (@IDNguoiMua, @IDShop, GETDATE(), 0)

        SET @NewIDDonHang = SCOPE_IDENTITY();

        DECLARE CUR_SanPham CURSOR FOR
            SELECT IDBanSao, SoLuongMua, ThanhTien
            FROM @DanhSachMua
        OPEN CUR_SanPham;
        FETCH NEXT FROM CUR_SanPham INTO @IDBanSao, @SoLuongMua, @TongTien;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            SELECT @TonKho = SoLuongTonKho, @GiaHienTai = GiaBan
            FROM BAN_SAO_SAN_PHAM WITH(UPDLOCK)
            WHERE @IDBanSao = IDBanSao;

            IF (@TonKho < @SoLuongMua)
            BEGIN
                DECLARE @ErrMssG NVARCHAR(255) = N'Sản phẩm với ID ' + CAST(@IDBanSao AS VARCHAR(10)) + N'Không đủ hàng';
                RAISERROR(@ErrMssG, 16,1);
            END

            UPDATE BAN_SAO_SAN_PHAM 
            SET SoLuongTonKho = SoLuongTonKho - @SoLuongMua
            WHERE @IDBanSao = IDBanSao;

            UPDATE BAN_SAO_SAN_PHAM
            SET TrangThaiBS = 0
            WHERE IDBanSao = @IDBanSao AND SoLuongTonKho <= 0

            INSERT INTO CHI_TIET_DON_HANG (IDDonHang, IDBanSao, GiaLucMua, GhiChu, SoLuong, GiaTien) VALUES
            (@NewIDDonHang, @IDBanSao, @GiaHienTai, @Ghichu, @SoLuongMua, @TongTien);

            DELETE GIO_HANG
            WHERE @IDNguoiMua = IDNguoiMua AND @IDBanSao = IDBanSao;

            FETCH NEXT FROM CUR_SanPham INTO @IDBanSao, @SoLuongMua, @TongTien;
        END
        CLOSE CUR_SanPham;
        DEALLOCATE CUR_SanPham;

        SELECT 
            @NewIDDonHang AS IDDonHang, 
            GETDATE() AS NgayTao, 
            @IDBanSao AS IDBienThe,
            @GiaHienTai AS GiaTien, 
            @SoLuongMua AS SoLuong,
            @TongTien AS TongTien,
            1 AS Success,
            N'Thanh toán thành công' AS Message
       
    END TRY

    BEGIN CATCH
        IF CURSOR_STATUS('global', 'CUR_SanPham') >= 0
        BEGIN
            CLOSE CUR_SanPham;
            DEALLOCATE CUR_SanPham;
        END;
        SELECT NULL AS IDDonHang, 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH;
END;

