SET NOCOUNT ON;

DECLARE @SPName NVARCHAR(255);
DECLARE @Quyen VARCHAR(50);
DECLARE @SQLPhanQuyen NVARCHAR(MAX);

DECLARE Cur_PhanQuyen_Shop CURSOR FOR
    SELECT CAST(name AS NVARCHAR(255)), CAST('EXEC' AS VARCHAR(50))
    FROM sys.procedures 
    WHERE name LIKE 'sp_Shop_%'
    
    UNION ALL 
    
    SELECT CAST(name AS NVARCHAR(255)), CAST('SELECT' AS VARCHAR(50))
    FROM sys.objects 
    WHERE type = 'IF' AND name LIKE 'fn_Shop_%';

OPEN Cur_PhanQuyen_Shop;
FETCH NEXT FROM Cur_PhanQuyen_Shop INTO @SPName, @Quyen;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @SQLPhanQuyen = 'GRANT ' + @Quyen + ' ON ' + QUOTENAME(@SPName) + ' TO Role_Shop'
    EXEC sp_executesql @SQLPhanQuyen;

    FETCH NEXT FROM Cur_PhanQuyen_Shop INTO @SPName, @Quyen;
END;
CLOSE Cur_PhanQuyen_Shop;
DEALLOCATE Cur_PhanQuyen_Shop;

PRINT N'Đã cấp quyền chạy sp thành công cho nhóm Role_Shop!';
GO