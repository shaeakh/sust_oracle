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

const getSessionCountByDuration = async (req, res) => {
    const { uid } = req.user;

    try {
        // Query to fetch the sessions the user participated in, including start and end time
        const query = `
            SELECT start_time, end_time
            FROM sessions
            WHERE (host_id = $1 OR guest_id = $1)
            AND status = true
        `;
        const result = await pool.query(query, [uid]);

        if (result.rows.length === 0) {
            return res.status(200).json([]);
        }

        // Calculate duration in minutes for each session and group by duration
        const durationCounts = result.rows.reduce((acc, session) => {
            const startTime = new Date(session.start_time);
            const endTime = new Date(session.end_time);
            
            // Calculate duration in minutes
            const duration = (endTime - startTime) / 1000 / 60;  // duration in minutes
            
            // Round the duration to the nearest integer (optional)
            const roundedDuration = Math.round(duration);

            // Accumulate the session count for each duration
            acc[roundedDuration] = (acc[roundedDuration] || 0) + 1;
            return acc;
        }, {});

        // Convert the grouped durations into an array of objects
        const history = Object.entries(durationCounts).map(([duration, count]) => ({
            duration: parseInt(duration),  // Ensure duration is an integer
            session_count: count,
        }));

        // Sort the array by duration in ascending order
        const sortedHistory = history.sort((a, b) => a.duration - b.duration);

        // Return the sorted response
        res.status(200).json(sortedHistory);
    } catch (error) {
        console.error("Error fetching user session history by duration:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAcceptanceRate = async (req, res) => {
    const { user_id } = req.params;

    try {
        // Query to get the total number of meetings (both hosted and attended)
        const totalMeetingQuery = `
            SELECT 
                (SELECT COUNT(*) FROM sessions WHERE host_id = $1) +
                (SELECT COUNT(*) FROM sessions WHERE guest_id = $1) as total_meeting
            FROM users 
            WHERE uid = $1
        `;
        const totalMeetingResult = await pool.query(totalMeetingQuery, [user_id]);

        // Query to get the user's total number of accepted sessions
        const acceptedQuery = `
            SELECT COUNT(*) AS accepted_count
            FROM sessions
            WHERE (host_id = $1 OR guest_id = $1) AND status = true
        `;
        const acceptedResult = await pool.query(acceptedQuery, [user_id]);

        // Check if user exists
        if (!totalMeetingResult.rows.length) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const totalMeeting = parseInt(totalMeetingResult.rows[0]?.total_meeting || 0, 10);
        const acceptedCount = parseInt(acceptedResult.rows[0]?.accepted_count || 0, 10);

        // Calculate the acceptance rate
        const acceptanceRate = totalMeeting > 0
            ? (acceptedCount / totalMeeting) * 100
            : 0;

        // Return acceptance rate, total meetings requested, and accepted sessions
        res.status(200).json({
            acceptance_rate: Math.min(100, acceptanceRate).toFixed(2), // Cap at 100%
            total_meeting: totalMeeting,
            total_accepted: acceptedCount
        });
    } catch (error) {
        console.error("Error calculating acceptance rate:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUserSessions = async (req, res) => {
    const { user_id } = req.query;
    const range = req.query.range || 'this-week'; // Default to 'this-week'

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        let dateFilterQuery = '';
        const currentDate = new Date();
        const startOfWeek = new Date();
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday of this week
        startOfWeek.setHours(0, 0, 0, 0);
        
        switch (range) {
            case 'today':
                dateFilterQuery = `AND start_time >= CURRENT_DATE AND start_time < CURRENT_DATE + INTERVAL '1 day'`;
                break;
            case 'this-week':
                dateFilterQuery = `AND start_time >= '${startOfWeek.toISOString()}' AND start_time < '${new Date(startOfWeek.setDate(startOfWeek.getDate() + 7)).toISOString()}'`;
                break;
            case 'this-month':
                dateFilterQuery = `AND start_time >= DATE_TRUNC('month', CURRENT_DATE)`;
                break;
            case 'this-year':
                dateFilterQuery = `AND start_time >= DATE_TRUNC('year', CURRENT_DATE)`;
                break;
            case 'life-time':
                dateFilterQuery = '';
                break;
            default:
                return res.status(400).json({ message: 'Invalid range value' });
        }

        // SQL query to fetch sessions with status = true
        const query = `
            SELECT id, host_id, guest_id, schedule_id, start_time, end_time, title, status
            FROM sessions
            WHERE (host_id = $1 OR guest_id = $1) 
              AND status = true
              ${dateFilterQuery}
            ORDER BY start_time DESC
        `;
        
        const result = await pool.query(query, [user_id]);
        
        // Check if no sessions are found
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No sessions found for this user' });
        }

        // Return sessions as JSON
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getUserSessionHistory, getSessionCountByDuration, getAcceptanceRate, getUserSessions };