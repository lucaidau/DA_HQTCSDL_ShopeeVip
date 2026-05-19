USE ShopeeVipDB;
GO

SET NOCOUNT ON;

DECLARE @SPName NVARCHAR(255);
DECLARE @SQLPhanQuyen NVARCHAR(MAX);

DECLARE Cur_PhanQuyen_Shop CURSOR FOR
    SELECT name  FROM  sys.procedures WHERE name LIKE 'sp_Shop_%';

OPEN Cur_PhanQuyen_Shop;
FETCH NEXT FROM Cur_PhanQuyen_Shop INTO @SPName;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQLPhanQuyen = 'GRANT EXEC ON ' + QUOTENAME(@SPName) + ' TO Role_Shop'
    EXEC sp_executesql @SQLPhanQuyen;

    FETCH NEXT FROM Cur_PhanQuyen_Shop INTO @SPName;
END
CLOSE Cur_PhanQuyen_Shop;
DEALLOCATE Cur_PhanQuyen_Shop;

PRINT N'Đã cấp quyền chạy sp thành công cho nhóm Role_Shop!';
GO