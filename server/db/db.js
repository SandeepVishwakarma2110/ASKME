// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();}
const sql = require('mssql');

const dbConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER, // e.g., askmeserver.database.windows.net
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true, // Required for Azure
    trustServerCertificate: false,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log("✅ Azure SQL connected (via db.js)");
    return pool;
  })
  .catch(err => {
    console.error("❌ Azure SQL connection error:", err.message);
  });
  console.log("🔍 Azure SQL Config:", dbConfig);
module.exports = { sql, poolPromise };