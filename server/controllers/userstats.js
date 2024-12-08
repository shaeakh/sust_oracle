const { pool } = require("../db/dbconnect");
const { DateTime } = require("luxon");

const getUserSessionHistory = async (req, res) => {
    const { uid } = req.user;

    try {
        // Query to fetch sessions the user participated in
        const query = `
            SELECT start_time 
            FROM sessions 
            WHERE (host_id = $1 OR guest_id = $1)
            AND status = true
        `;
        const result = await pool.query(query, [uid]);

        if (result.rows.length === 0) {
            return res.status(200).json([]);
        }

        // Process sessions to group by date
        const sessionCounts = result.rows.reduce((acc, session) => {
            const rawDate = session.start_time;

            // Try parsing with JavaScript's native Date
            const jsDate = new Date(rawDate);
            if (isNaN(jsDate)) {
                return acc;
            }

            // Then, use Luxon to format it
            const date = DateTime.fromJSDate(jsDate, { setZone: true }).toFormat("yyyy-MM-dd");

            // Accumulate session counts
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Format the result as an array of objects
        const history = Object.entries(sessionCounts).map(([date, count]) => ({
            date,
            meeting_count: count,
        }));

        // Sort the history array by date in ascending order
        const sortedHistory = history.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json(sortedHistory);
    } catch (error) {
        console.error("Error fetching user session history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getUserSessionHistory };