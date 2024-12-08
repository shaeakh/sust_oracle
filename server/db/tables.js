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
                bio VARCHAR(1000),
                location VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS email_otp(
                email_id VARCHAR(255) PRIMARY KEY,
                otp VARCHAR(6) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS schedules(
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                min_duration INT NOT NULL,
                max_duration INT NOT NULL,
                auto_approve BOOLEAN NOT NULL DEFAULT FALSE
            );

            CREATE TABLE IF NOT EXISTS sessions(
                id SERIAL PRIMARY KEY,
                guest_id INT[] NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                title VARCHAR(255),
                meeting_host_url VARCHAR(255),
                meeting_url VARCHAR(255),
                status BOOLEAN NOT NULL DEFAULT FALSE
            );

            `);
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Unable to create any table:", error);
  }
}

module.exports = { createTables };