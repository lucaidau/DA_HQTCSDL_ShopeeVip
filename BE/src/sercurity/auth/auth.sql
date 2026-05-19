-- Tạo tài khoản đăng nhập
CREATE LOGIN Login_Admin WITH PASSWORD = 'admin123';
CREATE LOGIN Login_Shop WITH PASSWORD='shop123';
CREATE LOGIN Login_Customer WITH PASSWORD='customer123';

USE ShopeeVipDB;
GO

-- Tạo user
CREATE USER Admin_User FOR LOGIN Login_Admin;
CREATE USER Shop_User FOR LOGIN Login_Shop;
CREATE USER Customer_User FOR LOGIN Login_Customer;

-- Tạo Admin Role
CREATE ROLE Role_Admin;
ALTER ROLE db_owner ADD MEMBER Admin_User;
GO

-- Tạo Shop Role
CREATE ROLE Role_Shop;
GRANT 