const fs = require("fs");
const { Pool } = require("pg");

const connectionString = process.env.DBURL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync("./ca.pem").toString(),
      },    
  });

async function connectToDB() {
  try {
    await pool.connect();
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
  }
}

module.exports = { connectToDB, pool };
