USE ShopeeVipDB;
GO

SET NOCOUNT ON;

DECLARE @SPName NVARCHAR(255);
DECLARE @SQLPhanQuyen NVARCHAR(MAX);

DECLARE Cur_PhanQuyen_NguoiMua CURSOR FOR
    SELECT name  FROM  sys.procedures WHERE name LIKE 'sp_NguoiMua_%';

OPEN Cur_PhanQuyen_NguoiMua;
FETCH NEXT FROM Cur_PhanQuyen_NguoiMua INTO @SPName;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQLPhanQuyen = 'GRANT EXEC ON ' + QUOTENAME(@SPName) + ' TO Role_Customer'
    EXEC sp_executesql @SQLPhanQuyen;

    FETCH NEXT FROM Cur_PhanQuyen_NguoiMua INTO @SPName;
END
CLOSE Cur_PhanQuyen_NguoiMua;
DEALLOCATE Cur_PhanQuyen_NguoiMua;

PRINT N'Đã cấp quyền chạy sp thành công cho nhóm Role_Customer!';
GO