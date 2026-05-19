-- Tạo tài khoản đăng nhập
CREATE LOGIN Login_Admin WITH PASSWORD = 'admin123';
CREATE LOGIN Login_Shop WITH PASSWORD='shop123';
CREATE LOGIN Login_Customer WITH PASSWORD='customer123';
GO
USE ShopeeVipDB;
GO

SET NOCOUNT ON;

-- Tạo user
CREATE USER User_Admin FOR LOGIN Login_Admin;
CREATE USER User_Shop FOR LOGIN Login_Shop;
CREATE USER User_Customer FOR LOGIN Login_Customer;
GO

-- Cấp quyền tối cao cho admin
ALTER ROLE db_owner ADD MEMBER User_Admin;
GO

-- Tạo Người Mua Role
CREATE ROLE Role_Customer;
GO
ALTER ROLE Role_Customer ADD MEMBER User_Customer;
GO
-- Quyền với tài khoản
GRANT SELECT, UPDATE ON TAI_KHOAN TO Role_Customer;
GRANT SELECT, UPDATE ON NGUOI_MUA TO Role_Customer;
--Quyền xem sản phẩm
GRANT SELECT ON SAN_PHAM TO Role_Customer;
GRANT SELECT ON BAN_SAO_SAN_PHAM TO Role_Customer;
-- Quyền với giỏ hàng và đơn hàng
GRANT SELECT, INSERT, UPDATE, DELETE ON GIO_HANG TO Role_Customer;
GRANT SELECT, INSERT, UPDATE ON DON_HANG TO Role_Customer;
GRANT SELECT, INSERT, UPDATE ON CHI_TIET_DON_HANG TO Role_Customer;

-- Tạo Shop Role
CREATE ROLE Role_Shop;
GO
ALTER ROLE Role_Shop ADD MEMBER User_Shop;
GO
-- Quyền xem thông tin cá nhân và sản phẩm
GRANT SELECT, UPDATE ON SHOP TO Role_Shop;
GRANT SELECT, INSERT, UPDATE, DELETE ON SAN_PHAM TO Role_Shop;
GRANT SELECT, INSERT, UPDATE, DELETE ON BAN_SAO_SAN_PHAM TO Role_Shop;
-- Quyền xử lí đơn hàng của khách hàng 
GRANT SELECT, UPDATE ON DON_HANG TO Role_Shop;
GRANT SELECT ON VI TO Role_Shop;

PRINT N'Phân quyền trên các bảng thành công.';
GO