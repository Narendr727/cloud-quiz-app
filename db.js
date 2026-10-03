const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Nare@2005',
  multipleStatements: true
});

const promisePool = pool.promise();

async function initDB() {
  try {
    // Database auto-create karega
    await promisePool.query("CREATE DATABASE IF NOT EXISTS quiz_portal;");
    await promisePool.query("USE quiz_portal;");

    // Tables create karega
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('Student', 'Faculty') DEFAULT 'Student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        topic VARCHAR(255),
        expiryTime DATETIME,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("=========================================");
    console.log("✅ SUCCESS: Connected to Local MySQL Database!");
    console.log("=========================================");
  } catch (err) {
    console.error("❌ Database Connection Error:", err.message);
  }
}

initDB();

module.exports = promisePool;
