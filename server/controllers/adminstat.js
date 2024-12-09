const { pool } = require("../db/dbconnect");
const { get } = require("../routes/auth");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAPI_KEY });

const generateInsightfulReport = async (req, res) => {
    try {
      const { uid } = req.user;
      const { prompt = "" } = req.body; // Optional prompt from the frontend
  
      // Check user permissions
      const getUserQuery = "SELECT * FROM users WHERE uid = $1";
      const getUserResult = await pool.query(getUserQuery, [uid]);
  
      if (getUserResult.rows[0].role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to access this route"
        });
      }
  
      // Fetch session data for the analysis
      const sessionDataQuery = `
        SELECT 
          DATE_TRUNC('day', start_time) AS session_date,
          COUNT(*) AS meeting_count,
          COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60), 0) AS avg_duration
        FROM sessions
        WHERE status = true
        GROUP BY DATE_TRUNC('day', start_time)
        ORDER BY session_date;
      `;
      const sessionDataResult = await pool.query(sessionDataQuery);
  
      const sessionData = sessionDataResult.rows.map(row => ({
        date: row.session_date.toISOString().split('T')[0],
        meeting_count: parseInt(row.meeting_count),
        avg_duration: Number(row.avg_duration || 0).toFixed(2), // Convert to number first, then format
      }));
  
      // Prepare AI prompt
      const aiPrompt = `
        You are a data analyst. Based on the provided session data, generate a detailed and insightful report in markdown format.
        Include key trends, patterns, and any notable observations. Also, incorporate the following prompt from the user, if provided:
        "${prompt}"
  
        Session data:
        ${JSON.stringify(sessionData, null, 2)}
  
        Return the result in markdown format.
      `;
  
      const messages = [
        { role: "system", content: aiPrompt },
      ];
  
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
      });
  
      const aiResponse = completion.choices[0].message.content;
  
      res.status(200).json({
        success: true,
        report: aiResponse,
      });
    } catch (error) {
      console.error("Error generating AI analysis:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };
  
async function getDailySessionCount(req, res) {
    try {
      const { user_id } = req.query;

      const { uid } = req.user;

      const getUserQuery = "SELECT * FROM users WHERE uid = $1";
      const getUserResult = await pool.query(getUserQuery, [uid]);

      if (getUserResult.rows[0].role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to access this route"
        });
      }

      let query;
      let queryParams;
      if (user_id) {
        // Query for a specific user's session count for the last 30 days
        query = `
          WITH date_series AS (
            SELECT generate_series(
              DATE_TRUNC('day', CURRENT_DATE - INTERVAL '29 days'), 
              DATE_TRUNC('day', CURRENT_DATE), 
              '1 day'::interval
            ) AS session_date
          )
          SELECT 
            date_series.session_date,
            COALESCE(COUNT(sessions.id), 0) AS meeting_count
          FROM date_series
          LEFT JOIN sessions ON 
            DATE_TRUNC('day', sessions.start_time) = date_series.session_date
            AND sessions.status = true
            AND (sessions.host_id = $1 OR sessions.guest_id = $1)
          GROUP BY date_series.session_date
          ORDER BY date_series.session_date
        `;
        queryParams = [user_id];
      } else {
        // Query for total session count for the last 30 days across all users
        query = `
          WITH date_series AS (
            SELECT generate_series(
              DATE_TRUNC('day', CURRENT_DATE - INTERVAL '29 days'), 
              DATE_TRUNC('day', CURRENT_DATE), 
              '1 day'::interval
            ) AS session_date
          )
          SELECT 
            date_series.session_date,
            COALESCE(COUNT(sessions.id), 0) AS meeting_count
          FROM date_series
          LEFT JOIN sessions ON 
            DATE_TRUNC('day', sessions.start_time) = date_series.session_date
            AND sessions.status = true
          GROUP BY date_series.session_date
          ORDER BY date_series.session_date
        `;
        queryParams = [];
      }
  
      const result = await pool.query(query, queryParams);
  
      // Transform the result to match the desired format
      const formattedData = result.rows.map(row => ({
        date: row.session_date.toISOString().split('T')[0],
        meeting_count: parseInt(row.meeting_count)
      }));
  
      res.status(200).json({
        success: true,
        data: formattedData
      });
    } catch (error) {
      console.error("Error fetching daily session count:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  }
// return all session data
  const getAllSessionData = async (req, res) => {
    try {
        const { uid } = req.user;

      const getUserQuery = "SELECT * FROM users WHERE uid = $1";
      const getUserResult = await pool.query(getUserQuery, [uid]);

      if (getUserResult.rows[0].role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to access this route"
        });
      }
      const query = "SELECT * FROM sessions";
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

module.exports = { getDailySessionCount, getAllSessionData, generateInsightfulReport };