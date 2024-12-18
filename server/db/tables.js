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
                user_image VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS email_otp(
                email_id VARCHAR(255) PRIMARY KEY,
                otp VARCHAR(6) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS schedules (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(uid),
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                min_duration INT NOT NULL,
                max_duration INT NOT NULL,
                auto_approve BOOLEAN NOT NULL DEFAULT FALSE,
                CONSTRAINT no_overlap UNIQUE (user_id, start_time, end_time)
            );

            CREATE TABLE IF NOT EXISTS sessions (
              id SERIAL PRIMARY KEY,
              host_id INT NOT NULL REFERENCES users(uid),
              guest_id INT NOT NULL REFERENCES users(uid),
              schedule_id INT NOT NULL REFERENCES schedules(id),
              start_time TIMESTAMP NOT NULL,
              end_time TIMESTAMP NOT NULL,
              title VARCHAR(255),
              meeting_host_url VARCHAR(255),
              meeting_url VARCHAR(255),
              status BOOLEAN NOT NULL DEFAULT FALSE,
              CONSTRAINT no_overlap_sessions UNIQUE (host_id, start_time, end_time)
          );

          CREATE TABLE IF NOT EXISTS schedule_availability (
              id SERIAL PRIMARY KEY,
              schedule_id INT NOT NULL REFERENCES schedules(id),
              available_start TIMESTAMP NOT NULL,
              available_end TIMESTAMP NOT NULL,
              CONSTRAINT no_overlap_availability UNIQUE (schedule_id, available_start, available_end)
          );

          CREATE TABLE IF NOT EXISTS meetings (
              id SERIAL PRIMARY KEY,
              host_id INT NOT NULL REFERENCES users(uid),
              guest_id INT NOT NULL REFERENCES users(uid),
              schedule_id INT NOT NULL REFERENCES schedules(id),
              start_time TIMESTAMP NOT NULL,
              status VARCHAR(20) NOT NULL DEFAULT 'pending',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'declined'))
          );

          CREATE TABLE IF NOT EXISTS chat_rooms (
              id SERIAL PRIMARY KEY,
              user1_id INT NOT NULL REFERENCES users(uid),
              user2_id INT NOT NULL REFERENCES users(uid),
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE (user1_id, user2_id)
          );

          CREATE TABLE IF NOT EXISTS chat_messages (
              id SERIAL PRIMARY KEY,
              room_id INT NOT NULL REFERENCES chat_rooms(id),
              sender_id INT NOT NULL REFERENCES users(uid),
              message TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          -- Table for zoom token with one hour expiry
          CREATE TABLE IF NOT EXISTS zoom_tokens (
              token TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS notifications (
              id SERIAL PRIMARY KEY,
              user_id INTEGER NOT NULL REFERENCES users(uid),
              type VARCHAR(50) NOT NULL,
              title VARCHAR(255) NOT NULL,
              message TEXT NOT NULL,
              meeting_id VARCHAR(255),
              read BOOLEAN DEFAULT false,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
          );

            `);
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Unable to create any table:", error);
  }
}

module.exports = { createTables };