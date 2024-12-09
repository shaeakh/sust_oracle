const { pool } = require("../db/dbconnect");
const { generateMeetingUrl } = require("../utils/generateMeetingUrl");
const singleMailService = require("../utils/mailService");
const { DateTime } = require("luxon");

async function processApprovedSession(session) {
    try {
        // Fetch host and guest details
        const userQuery = `
            SELECT uid, user_name, user_email 
            FROM users 
            WHERE uid IN($1, $2)
        `;
        const userResult = await pool.query(userQuery, [session.host_id, session.guest_id]);

        // Ensure that host and guest details are correctly assigned
        const host = userResult.rows.find(user => user.uid === session.host_id);
        const guest = userResult.rows.find(user => user.uid === session.guest_id);

        // Check if host and guest are properly found, else throw error
        if (!host || !guest) {
            throw new Error('Host or Guest not found');
        }

        // Generate meeting URL
        const meetingData = {
            title: session.title,
            stime: DateTime.fromISO(session.start_time).toUTC().toFormat('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'')
        };
        const { meetingUrl, meeting_host_url } = await generateMeetingUrl(meetingData);

        // Update session with meeting URLs
        const updateQuery = `
            UPDATE sessions 
            SET meeting_url = $1, meeting_host_url = $2 
            WHERE id = $3
        `;
        await pool.query(updateQuery, [meetingUrl, meeting_host_url, session.id]);

        // Send emails to host and guest
        await sendSessionEmails(session, host, guest, meetingUrl, meeting_host_url);
    } catch (error) {
        console.error("Error processing approved session:", error);
    }
}

async function sendSessionEmails(session, host, guest, meetingUrl, meeting_host_url) {
    // Email to host
    const hostEmailBody = `    
        <p style="text-align: center;">
        <img src="https://res.cloudinary.com/djx7nzzzq/image/upload/v1733142971/qgebalt4vovtkeedmkb3.png" style="width: 187px;">
        </p>
        <p>Dear ${host.user_name},</p>
        <p>Your session "${session.title}" has been confirmed.</p>
        <p>Meeting Link (Host): ${meeting_host_url}</p>
        <p>Meeting Link (Guest): ${meetingUrl}</p>
        <p>Start Time: ${DateTime.fromISO(session.start_time).setZone('your-timezone-here').toLocaleString(DateTime.DATETIME_MED)}</p>
        <p>Guest: ${guest.user_name}</p>
        <p>Thank you,<br><strong>Team SUST Oracle</strong></p>

    `;

    await singleMailService(host.user_email, "Session Confirmed", hostEmailBody);

    // Email to guest
    const guestEmailBody = ` 
        <p style="text-align: center;">
        <img src="https://res.cloudinary.com/djx7nzzzq/image/upload/v1733142971/qgebalt4vovtkeedmkb3.png" style="width: 187px;">
        </p>
        <p>Dear ${guest.user_name},</p>
        <p>Your session "${session.title}" has been confirmed.</p>
        <p>Meeting Link: ${meetingUrl}</p>
        <p>Start Time: ${DateTime.fromISO(session.start_time).setZone('your-timezone-here').toLocaleString(DateTime.DATETIME_MED)}</p>
        <p>Host: ${host.user_name}</p>
        <p>Thank you,<br><strong>Team SUST Oracle</strong></p>
        `
        ;

    await singleMailService(guest.user_email, "Session Confirmed", guestEmailBody);
}


const getSessionsByUser = async (req, res) => {
    const { uid } = req.user;

    try {
        // return all sessions where host_id or guest_id is the user_id and the end_time is in the future
        const query = `SELECT * FROM sessions WHERE (host_id = $1 OR guest_id = $1) AND end_time > $2::timestamp ORDER BY start_time ASC;`;
        const result = await pool.query(query, [uid, DateTime.now().toUTC().toISO()]);

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
        const query = `SELECT * FROM sessions WHERE id = $1 AND (host_id = $2 OR guest_id = $2) AND end_time > $3::timestamp ORDER BY start_time ASC;`;
        const result = await pool.query(query, [session_id, uid, DateTime.now().toUTC().toISO()]);

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

        const start = DateTime.fromISO(start_time).toUTC();
        const end = DateTime.fromISO(end_time).toUTC();
        const sessionDuration = end.diff(start, 'minutes').minutes;
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
              AND NOT ($2::timestamp >= end_time OR $3::timestamp <= start_time)
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
              AND NOT ($2::timestamp >= end_time OR $3::timestamp <= start_time)
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

        const updateTotalMeetingQuery = `
            UPDATE users 
            SET total_meeting = total_meeting + 1
            WHERE uid = $1
        `;
        await pool.query(updateTotalMeetingQuery, [guest_id]);

        if (status) {
            await processApprovedSession(insertResult.rows[0]);
        }

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

        // Process the approved session
        await processApprovedSession(updateResult.rows[0]);

        // Delete all overlapping sessions for the host with status false
        const deleteQuery = `
            DELETE FROM sessions 
            WHERE host_id = $1 
              AND status = false
              AND NOT ($2::timestamp >= end_time OR $3::timestamp <= start_time)
              AND id != $4
            RETURNING *;
        `;
        const deleteValues = [
            host_id,
            DateTime.fromISO(start_time).toUTC().toISO(),
            DateTime.fromISO(end_time).toUTC().toISO(),
            session_id
        ];
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

// get custom session by id
const getCustomSessionsByUser = async (req, res) => {
    const { user_id } = req.params; // The user to fetch sessions for
    const { uid } = req.user; // The authenticated user's ID

    try {
        // Fetch all sessions where the user is either host or guest
        const sessionsQuery = `
            SELECT * FROM sessions 
            WHERE host_id = $1 OR guest_id = $1
            ORDER BY start_time ASC
        `;
        const sessionsResult = await pool.query(sessionsQuery, [user_id]);

        if (sessionsResult.rows.length === 0) {
            return res.json([]);
        }

        // Iterate through the sessions and construct the response
        const sessions = await Promise.all(
            sessionsResult.rows.map(async (session) => {
                const { id, host_id, guest_id, meeting_host_url, meeting_url } = session;

                // Fetch guest user details (excluding host)
                const usersQuery = `
                    SELECT uid AS id, user_name AS username 
                    FROM users 
                    WHERE uid = $1
                `;
                const usersResult = await pool.query(usersQuery, [guest_id]);

                // Prepare the `user` array with only guest details
                const userArray = usersResult.rows.map((user) => ({
                    id: user.id,
                    username: user.username,
                }));

                // Determine if the current user is authorized to view the meeting URL
                const isAuthorized =
                    uid === host_id || userArray.some((user) => user.id === uid);

                // Construct the formatted session object
                return {
                    id: session.id,
                    host_id: session.host_id,
                    schedule_id: session.schedule_id,
                    stime: DateTime.fromISO(session.start_time).toUTC().toISO(),
                    etime: DateTime.fromISO(session.end_time).toUTC().toISO(),
                    title: session.title,
                    meeting_url: isAuthorized ? (uid === host_id ? meeting_host_url : meeting_url) : null,
                    status: session.status,
                    user: userArray, // Contains only guest details
                };
            })
        );

        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error fetching custom sessions data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { getSessionsByUser, getSessionById, createSession, approveSession, deleteSession, getCustomSessionsByUser };