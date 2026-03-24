const sql = require("mssql");
require("dotenv").config();

const sqlConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  server: process.env.DB_SERVER,
  port: 1433,
  options: {
    encrypt: true, // for azure
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

module.exports = { sql, poolPromise };
