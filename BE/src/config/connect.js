const sql = require("mssql");
require("dotenv").config();

const sqlConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_SERVER_SYSTEM,
  server: process.env.DB_SERVER,
  port: 1433,
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

const adminSqlConfig = {
  user: process.env.DB_USER_ADMIN,
  password: process.env.DB_PASS_ADMIN,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  port: 1433,
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

const shopSqlConfig = {
  user: process.env.DB_USER_SHOP,
  password: process.env.DB_PASS_SHOP,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  port: 1433,
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

const customerSqlConfig = {
  user: process.env.DB_USER_CUSTOMER,
  password: process.env.DB_PASS_CUSTOMER,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  port: 1433,
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then((pool) => {
    console.log("Kết nối thành công");
    return pool;
  })
  .catch((err) => {
    console.log("Kết nối thất bại: ", err);
  });

const adminPoolPromise = new sql.ConnectionPool(adminSqlConfig)
  .connect()
  .then((adminPool) => {
    console.log("Kết nối admin thành công");
    return adminPool;
  })
  .catch((err) => {
    console.log("Kết nối admin thất bại: ", err);
  });

const shopPoolPromise = new sql.ConnectionPool(shopSqlConfig)
  .connect()
  .then((adminPool) => {
    console.log("Kết nối shop thành công");
    return adminPool;
  })
  .catch((err) => {
    console.log("Kết nối shop thất bại: ", err);
  });

const customerPoolPromise = new sql.ConnectionPool(customerSqlConfig)
  .connect()
  .then((adminPool) => {
    console.log("Kết nối khách hàng thành công");
    return adminPool;
  })
  .catch((err) => {
    console.log("Kết nối khách hàng thất bại: ", err);
  });

module.exports = {
  sql,
  poolPromise,
  adminPoolPromise,
  shopPoolPromise,
  customerPoolPromise,
};
