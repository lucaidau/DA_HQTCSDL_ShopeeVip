CREATE PROCEDURE sp_LayThanhToan
    @IDNguoiMua INT,
    @ListID VarChar(MAX),
    @GhiChu NVARCHAR(MAX)
AS
    BEGIN
    SET NOCOUNT ON;

        BEGIN TRANSACTION
            BEGIN TRY
                --1. Kiểm tra tồn kho
                IF EXISTS(
                SELECT 1
                FROM GIO_HANG gh 
                JOIN BAN_SAO_SAN_PHAM bs ON bs.IDBanSao = gh.IDBanSao 
                WHERE gh.IDNguoiMua = @IDNguoiMua AND gh.SoLuongMua > bs.SoLuongTonKho) 

                BEGIN  
                    RAISERROR(N'Số lượng tồn kho không đủ!', 16,1);
                    ROLLBACK TRANSACTION;
                    RETURN;
                END

                ELSE
                    BEGIN
                    --2. Thêm đơn hàng mới vào DON_HANG
                        DECLARE @IDDonHang INT;
                        INSERT INTO DON_HANG(IDNguoiMua) VALUES (@IDNguoiMua);
                        SET @IDDonHang = SCOPE_IDENTITY()

                    --3. Thêm vào CHI_TIET_DON_HANG với các ID được check nằm trong danh sách
                        INSERT INTO CHI_TIET_DON_HANG(IDDonHang, IDBanSao, TongTien, GhiChu, SoLuong, TrangThai)
                        SELECT 
                            @IDDonHang,
                            gh.IDBanSao,
                            (SoLuongMua * bs.GiaBan),
                            @GhiChu,
                            gh.SoLuongMua,
                            1
                        FROM BAN_SAO_SAN_PHAM bs
                        JOIN GIO_HANG gh ON bs.IDBanSao = gh.IDBanSao
                        WHERE @IDNguoiMua = gh.IDNguoiMua AND gh.IDBanSao IN(SELECT value FROM STRING_SPLIT(@ListID, ','));

                    --4. Cập nhật tồn kho
                        UPDATE bs
                        SET bs.SoLuongTonKho = bs.SoLuongTonKho - gh.SoLuongMua
                        FROM BAN_SAO_SAN_PHAM bs
                        JOIN GIO_HANG gh ON gh.IDBanSao = bs.IDBanSao
                        WHERE @IDNguoiMua = gh.IDNguoiMua AND gh.IDBanSao IN (SELECT value FROM STRING_SPLIT(@ListID, ','))

                    --5. Xóa các sản phẩm đã mua ra khỏi GIO_HANG
                        DELETE FROM GIO_HANG
                        WHERE @IDNguoiMua = IDNguoiMua AND IDBanSao IN (SELECT value FROM STRING_SPLIT(@ListID,','))

                        COMMIT TRANSACTION;

                        SELECT @IDDonHang AS IDDonHang;
                        
                        SELECT *
                        FROM CHI_TIET_DON_HANG
                        WHERE @IDDonHang = IDDonHang
                    END
            END TRY

            BEGIN CATCH
                IF @@TRANCOUNT > 0
                    ROLLBACK TRANSACTION;
                THROW;
            END CATCH
        END 
