CREATE PROCEDURE sp_Admin_SuaTaiKhoan
@IDTaiKhoan INT,
@userName VARCHAR(50),
@name NVARCHAR(50),
@email VARCHAR(255),
@phone VARCHAR(10)
AS
BEGIN
    UPDATE TAI_KHOAN
    SET TenDangNhap = @userName, Ten = @name, Email = @email, SDT = @phone
    WHERE IDTaiKhoan = @IDTaiKhoan

    SELECT 1 AS Success, N'Cập nhật thành công' AS Message
END
