const axios = require("axios");
const { pool } = require("../db/dbconnect");

const getZoomToken = async () => {
  try {
    // Check if a token exists in the database
    const query = "SELECT * FROM zoom_tokens ORDER BY created_at DESC LIMIT 1";
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      // No token exists, generate a new one
      return await refreshZoomToken();
    }

    const { token, created_at } = result.rows[0];
    const createdTime = new Date(created_at);
    const currentTime = new Date();
    const timeDifference = (currentTime - createdTime) / 1000; // Time difference in seconds

    if (timeDifference > 3600) {
      // Token expired, generate a new one
      return await refreshZoomToken();
    }

    // Token is still valid
    return token;
  } catch (error) {
    console.error("Error fetching Zoom token:", error);
    throw new Error("Failed to get Zoom token");
  }
};

const refreshZoomToken = async () => {
  try {
    // Request a new token from Zoom
    const response = await axios.post(
      "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=ShtejehGSwutQPPR0z1Svw",
      null,
      {
        auth: {
          username: process.env.ZOOM_CLIENT_ID,
          password: process.env.ZOOM_CLIENT_SECRET,
        },
      }
    );

    const { access_token } = response.data;

    // Update the database with the new token
    const updateQuery = `
      INSERT INTO zoom_tokens (token, created_at)
      VALUES ($1, NOW())
    `;
    await pool.query(updateQuery, [access_token]);

    return access_token;
  } catch (error) {
    console.error("Error generating Zoom token:", error.response?.data || error);
    throw new Error("Failed to refresh Zoom token");
  }
};

module.exports = { getZoomToken };