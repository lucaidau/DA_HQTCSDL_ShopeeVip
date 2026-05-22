USE ShopeeVipDB; -- Thay bằng tên DB của bạn
GO
-- =============================================
-- 1. XÓA DỮ LIỆU CŨ (Để tránh lỗi trùng khóa)
-- =============================================
DELETE FROM GIO_HANG;
DELETE FROM CHI_TIET_DON_HANG;
DELETE FROM DON_HANG;
DELETE FROM BAN_SAO_SAN_PHAM;
DELETE FROM SAN_PHAM;
DELETE FROM VI
DELETE FROM SHOP;
DELETE FROM NGUOI_MUA;
DELETE FROM TAI_KHOAN;

SELECT * FROM TAI_KHOAN
SELECT * FROM NGUOI_MUA
SELECT * FROM SHOP
SELECT * FROM VI
SELECT * FROM SAN_PHAM
SELECT * FROM BAN_SAO_SAN_PHAM
SELECT * FROM GIO_HANG
SELECT * FROM DON_HANG
SELECT * FROM CHI_TIET_DON_HANG

-- Reset lại các cột ID tự tăng về 1
DBCC CHECKIDENT ('TAI_KHOAN', RESEED, 0);
DBCC CHECKIDENT ('NGUOI_MUA', RESEED, 0);
DBCC CHECKIDENT ('SHOP', RESEED, 0);
DBCC CHECKIDENT ('SAN_PHAM', RESEED, 0);
DBCC CHECKIDENT ('BAN_SAO_SAN_PHAM', RESEED, 0);
DBCC CHECKIDENT ('DON_HANG', RESEED, 0);
DBCC CHECKIDENT ('CHI_TIET_DON_HANG', RESEED, 0);
GO
-- Tài khoản
INSERT INTO TAI_KHOAN VALUES ('user1', N'Nguyễn Văn A', '09123', N'123 Đường Số 1, Quận 1, TP Hồ Chí Minh', 'user1@gmail.com', 1, '123');
INSERT INTO TAI_KHOAN VALUES ('shop1', N'Cửa Hàng Thời Trang', '09888', N'123 Đường Số 2, Quận 2, Hà Nội', 'shop1@gmail.com', 1, '123');

-- Vai trò
INSERT INTO NGUOI_MUA (IDTaiKhoan, TrangThaiUser) VALUES (1, 1);
INSERT INTO SHOP (IDTaiKhoan, TrangThaiShop) VALUES (2, 1);

-- Ngân hàng
INSERT INTO VI (IDShop, NoiDung, SoTien,SoDu, NgayThucHien) VALUES
(1, N'Nạp Tiền', 200000, 900000,GETDATE());

-- Sản phẩm 
INSERT INTO SAN_PHAM VALUES (1, N'iPhone 15', N'Siêu phẩm 2024', 'ip15.jpg', 1);
INSERT INTO BAN_SAO_SAN_PHAM VALUES
(1, 20, 27000000, N'Đen - 128GB', 'ip15.jpg', 1),
(1, 10, 25000000, N'Hồng - 128GB', 'ip15_pink.jpg', 1),
(1, 15, 30000000, N'Xanh - 128GB', 'ip15_blue.jpg', 1);

-- Giỏ hàng
INSERT INTO GIO_HANG VALUES (1, 1, 1, GETDATE());

-- Bước 1: Tạo Đơn hàng tổng (Của người mua ID = 1)
INSERT INTO DON_HANG (IDNguoiMua, IDShop, NgayTao, TrangThaiDonHang) VALUES (1, 1, GETDATE(), 0); 

-- Bước 2: Tạo Chi tiết đơn hàng (Giả sử đơn hàng trên có ID = 1)
-- Khách mua 1 chiếc Titan 128GB (IDBanSao = 1) và 1 chiếc Màu Xanh (IDBanSao = 2)
INSERT INTO CHI_TIET_DON_HANG (IDDonHang, IDBanSao, GiaLucMua, GhiChu, SoLuong, GiaTien)
VALUES 
(1, 1, 25000000, N'Giao hàng nhanh nhé', 1,25000000)