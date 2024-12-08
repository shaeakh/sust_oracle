const { pool } = require("../db/dbconnect");

const getSessionsByUser = async (req, res) => {
    const { uid } = req.user;

    try {
        // return all sessions where host_id or guest_id is the user_id and the end_time is in the future
        const query = `SELECT * FROM sessions WHERE (host_id = $1 OR guest_id = $1) AND end_time > NOW() ORDER BY start_time ASC;`;
        const result = await pool.query(query, [uid]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getSessionById = async (req, res) => {
    const { session_id } = req.params;
    const { uid } = req.user;

    console.log(session_id, uid);

    try {
        // return all sessions where host_id or guest_id is the user_id and the end_time is in the future
        const query = `SELECT * FROM sessions WHERE id = $1 AND (host_id = $2 OR guest_id = $2) AND end_time > NOW() ORDER BY start_time ASC;`;
        const result = await pool.query(query, [session_id, uid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createSession = async (req, res) => {
    const { schedule_id, start_time, end_time, title } = req.body;
    const { uid: guest_id } = req.user;

    if (!schedule_id || !start_time || !end_time || !title) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if the schedule exists and is valid for the given times
        const scheduleQuery = `
            SELECT * FROM schedules 
            WHERE id = $1 AND start_time <= $2 AND end_time >= $3
        `;
        const scheduleResult = await pool.query(scheduleQuery, [schedule_id, start_time, end_time]);

        if (scheduleResult.rows.length === 0) {
            return res.status(404).json({ message: "Schedule not found or not valid for the provided times" });
        }

        const schedule = scheduleResult.rows[0];
        const { user_id: host_id, min_duration, max_duration } = schedule;

        const sessionDuration = (new Date(end_time) - new Date(start_time)) / (1000 * 60);
        if (sessionDuration < min_duration || sessionDuration > max_duration) {
            return res.status(400).json({
                message: `Session duration must be between ${min_duration} and ${max_duration} minutes`,
            });
        }

        // Check if the user has already requested a session for the same time
        const userRequestQuery = `
            SELECT * FROM sessions
            WHERE guest_id = $1 AND schedule_id = $2 
            AND start_time = $3 AND end_time = $4
        `;
        const userRequestResult = await pool.query(userRequestQuery, [guest_id, schedule_id, start_time, end_time]);

        if (userRequestResult.rows.length > 0) {
            return res.status(400).json({ message: "You have already requested a session for this time." });
        }

        // Check for overlapping sessions for the host where status = true
        const hostOverlapQuery = `
            SELECT * FROM sessions 
            WHERE host_id = $1 
              AND NOT ($2 >= end_time OR $3 <= start_time)
              AND status = true
        `;
        const hostOverlapValues = [host_id, start_time, end_time];
        const hostOverlapResult = await pool.query(hostOverlapQuery, hostOverlapValues);

        if (hostOverlapResult.rows.length > 0) {
            return res.status(400).json({ message: "Host is not available at this time" });
        }

        // Check for overlapping sessions for the guest where status = true
        const guestOverlapQuery = `
            SELECT * FROM sessions 
            WHERE guest_id = $1 
              AND NOT ($2 >= end_time OR $3 <= start_time)
              AND status = true
        `;
        const guestOverlapValues = [guest_id, start_time, end_time];
        const guestOverlapResult = await pool.query(guestOverlapQuery, guestOverlapValues);

        if (guestOverlapResult.rows.length > 0) {
            return res.status(400).json({ message: "Guest has a conflicting session at this time" });
        }

        // Insert the new session
        const status = schedule.auto_approve ? true : false;
        const insertQuery = `
            INSERT INTO sessions (host_id, guest_id, schedule_id, start_time, end_time, title, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
        `;
        const insertValues = [host_id, guest_id, schedule_id, start_time, end_time, title, status];
        const insertResult = await pool.query(insertQuery, insertValues);

        res.status(201).json(insertResult.rows[0]);
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const approveSession = async (req, res) => {
    const { session_id } = req.params;
    const { uid } = req.user;

    try {
        // Check if the session exists and is hosted by the user
        const sessionQuery = `SELECT * FROM sessions WHERE id = $1 AND host_id = $2`;
        const sessionResult = await pool.query(sessionQuery, [session_id, uid]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: "Session not found or unauthorized" });
        }

        const session = sessionResult.rows[0];
        const { start_time, end_time, host_id } = session;

        // Update the session status to true
        const updateQuery = `UPDATE sessions SET status = true WHERE id = $1 RETURNING *`;
        const updateValues = [session_id];
        const updateResult = await pool.query(updateQuery, updateValues);

        // Delete all overlapping sessions for the host with status false
        const deleteQuery = `
            DELETE FROM sessions 
            WHERE host_id = $1 
              AND status = false
              AND NOT ($2 >= end_time OR $3 <= start_time)
              AND id != $4
            RETURNING *;
        `;
        const deleteValues = [host_id, start_time, end_time, session_id];
        const deleteResult = await pool.query(deleteQuery, deleteValues);

        // Return the approved session and deleted sessions for reference
        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        console.error("Error approving session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


const deleteSession = async (req, res) => {
    const { session_id } = req.params;
    const { uid } = req.user;

    try {
        // Check if the session exists
        const sessionQuery = `SELECT * FROM sessions WHERE id = $1`;
        const sessionResult = await pool.query(sessionQuery, [session_id]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ message: "Session not found" });
        }

        // if the session is hosted by the user or the guest, delete it
        const session = sessionResult.rows[0];
        if (session.host_id === uid || session.guest_id === uid) {
            const deleteQuery = `DELETE FROM sessions WHERE id = $1 RETURNING *`;
            const deleteValues = [session_id];
            const deleteResult = await pool.query(deleteQuery, deleteValues);

            res.status(200).json(deleteResult.rows[0]);
        } else {
            return res.status(403).json({ message: "Unauthorized to delete this session" });
        }
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getSessionsByUser, getSessionById, createSession, approveSession, deleteSession };