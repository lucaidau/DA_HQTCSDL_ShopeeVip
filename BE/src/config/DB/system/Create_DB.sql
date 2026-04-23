CREATE DATABASE ShopeeVipDB
ON PRIMARY (
    NAME = ECommerce_Data,
    FILENAME = 'D:\DoAnHQTCSDL\DB\ShopeeVipDB.mdf',
    SIZE = 10MB,
    MAXSIZE = UNLIMITED,
    FILEGROWTH = 5MB
),
(
    NAME = ECommerce_Secondary,
    FILENAME = 'D:\Project_HQTCSDL(LyThuyet)\DB\ShopeeVipDB.ndf',
    SIZE = 5MB,
    MAXSIZE = 100MB,
    FILEGROWTH = 2MB
)
LOG ON (
    NAME = Ecommerce_Log,
    FILENAME = 'D:\Project_HQTCSDL(LyThuyet)\DB\ShopeeVipLog.ldf',
    SIZE = 5MB,
    MAXSIZE = 50MB,
    FILEGROWTH = 1MB
);
GO