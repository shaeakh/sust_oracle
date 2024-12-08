const { pool } = require("./dbconnect");

async function createTables() {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                uid SERIAL PRIMARY KEY,
                user_name VARCHAR(100) NOT NULL,
                user_email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL DEFAULT 'user',
                isverified BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS email_otp(
                email_id VARCHAR(255) PRIMARY KEY,
                otp VARCHAR(6) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            `);
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Unable to create any table:", error);
  }
}

module.exports = { createTables };