const { pool } = require("../db/dbconnect");
const { DateTime } = require("luxon");

const populateTimeSlots = async (schedule_id, start_time, end_time, min_duration) => {
    const slots = [];
    let slot_start = DateTime.fromISO(start_time, { zone: "utc" });
const slot_end = DateTime.fromISO(end_time, { zone: "utc" });

while (slot_start.plus({ minutes: min_duration }) <= slot_end) {
    const slot_end_time = slot_start.plus({ minutes: min_duration });
    slots.push([
        schedule_id,
        slot_start.toISO(),
        slot_end_time.toISO(),
    ]);
    slot_start = slot_end_time;
}

    if (slots.length > 0) {
        const query = `
            INSERT INTO schedule_availability (schedule_id, available_start, available_end) 
            VALUES ${slots.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`).join(", ")}
        `;
        const values = slots.flat();
        await pool.query(query, values);
    }
};

const createSchedule = async (req, res) => {
    const { start_time, end_time, min_duration, max_duration, auto_approve } = req.body;
    const { uid } = req.user;

    if (!start_time || !end_time || !min_duration || !max_duration || auto_approve === undefined) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (min_duration <= 0 || max_duration <= 0 || min_duration > max_duration) {
        return res.status(400).json({ message: "Invalid duration values" });
    }
    
    if (DateTime.fromISO(end_time, { zone: "utc" }) - DateTime.fromISO(start_time, { zone: "utc" }) < min_duration * 60000) {
        return res.status(400).json({ message: "Schedule duration is too short to accommodate minimum duration slots." });
    }    

    try {
        // Check for overlapping schedules
        const overlapQuery = `
            SELECT * FROM schedules 
            WHERE user_id = $1 
              AND NOT ($2 >= end_time OR $3 <= start_time)
        `;
        const overlapValues = [
            uid,
            DateTime.fromISO(start_time, { zone: "utc" }).toISO(),
            DateTime.fromISO(end_time, { zone: "utc" }).toISO(),
        ];        
        const overlapResult = await pool.query(overlapQuery, overlapValues);

        if (overlapResult.rows.length > 0) {
            return res.status(400).json({ message: "Schedule overlaps with an existing schedule" });
        }

        // Insert the new schedule
        const query = `
            INSERT INTO schedules (user_id, start_time, end_time, min_duration, max_duration, auto_approve) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;
        const values = [
            uid,
            DateTime.fromISO(start_time, { zone: "utc" }).toISO(),
            DateTime.fromISO(end_time, { zone: "utc" }).toISO(),
            min_duration,
            max_duration,
            auto_approve,
        ];        
        const result = await pool.query(query, values);

        // Populate time slots in the schedule_availability table
        await populateTimeSlots(result.rows[0].id, start_time, end_time, min_duration);

        // Return the response with the inserted schedule
        const responseSchedule = result.rows[0];
        res.status(200).json([{
            id: responseSchedule.id,
            user_id: responseSchedule.user_id,
            start_time: responseSchedule.start_time,  // Assuming the time is already in UTC in the database
            end_time: responseSchedule.end_time,      // Same assumption here
            min_duration: responseSchedule.min_duration,
            max_duration: responseSchedule.max_duration,
            auto_approve: responseSchedule.auto_approve,
        }]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create schedule" });
    }
};

const getAllSchedules = async (req, res) => {
    const { uid } = req.user;
    try {
        const query = `SELECT * FROM schedules WHERE user_id = $1`;
        const values = [uid];
        const result = await pool.query(query, values);

        // Return the schedules in the expected format
        const responseSchedules = result.rows.map(schedule => ({
            id: schedule.id,
            user_id: schedule.user_id,
            start_time: schedule.start_time,  // Ensure this is in UTC
            end_time: schedule.end_time,      // Ensure this is in UTC
            min_duration: schedule.min_duration,
            max_duration: schedule.max_duration,
            auto_approve: schedule.auto_approve,
        }));
        
        res.status(200).json(responseSchedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get schedules" });
    }
};

const getScheduleById = async (req, res) => {
    const { schedule_id } = req.params;
    const { uid } = req.user;
    try {
        const query = `SELECT * FROM schedules WHERE id = $1 AND user_id = $2`;
        const values = [schedule_id, uid];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Schedule not found" });
        }

        // Return the schedule in the expected format
        const schedule = result.rows[0];
        res.status(200).json({
            id: schedule.id,
            user_id: schedule.user_id,
            start_time: schedule.start_time,  // Ensure this is in UTC
            end_time: schedule.end_time,      // Ensure this is in UTC
            min_duration: schedule.min_duration,
            max_duration: schedule.max_duration,
            auto_approve: schedule.auto_approve,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get schedule" });
    }
};

const updateSchedule = async (req, res) => {
    const { schedule_id } = req.params;
    const { start_time, end_time, min_duration, max_duration, auto_approve } = req.body;
    const { uid } = req.user;

    if (!start_time || !end_time || !min_duration || !max_duration || auto_approve === undefined) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check for overlapping schedules (excluding the current one)
        const overlapQuery = `
            SELECT * FROM schedules 
            WHERE user_id = $1 
              AND id != $2 
              AND NOT ($3 >= end_time OR $4 <= start_time)
        `;
        const overlapValues = [
            uid,
            schedule_id,
            DateTime.fromISO(start_time, { zone: "utc" }).toISO(),
            DateTime.fromISO(end_time, { zone: "utc" }).toISO(),
        ];        
        const overlapResult = await pool.query(overlapQuery, overlapValues);

        if (overlapResult.rows.length > 0) {
            return res.status(400).json({ message: "Updated schedule overlaps with an existing schedule" });
        }

        // Update the schedule
        const query = `
            UPDATE schedules 
            SET start_time = $1, end_time = $2, min_duration = $3, max_duration = $4, auto_approve = $5 
            WHERE id = $6 AND user_id = $7 
            RETURNING *
        `;
        const values = [
            DateTime.fromISO(start_time, { zone: "utc" }).toISO(),
            DateTime.fromISO(end_time, { zone: "utc" }).toISO(),
            min_duration,
            max_duration,
            auto_approve,
            schedule_id,
            uid,
        ];
        
        const result = await pool.query(query, values);

        // Clear existing time slots
        await pool.query(`DELETE FROM schedule_availability WHERE schedule_id = $1`, [schedule_id]);

        // Populate new time slots in the schedule_availability table
        await populateTimeSlots(schedule_id, start_time, end_time, min_duration);

        // Return the updated schedule in the expected format
        const updatedSchedule = result.rows[0];
        res.status(200).json({
            id: updatedSchedule.id,
            user_id: updatedSchedule.user_id,
            start_time: updatedSchedule.start_time,  // Ensure this is in UTC
            end_time: updatedSchedule.end_time,      // Ensure this is in UTC
            min_duration: updatedSchedule.min_duration,
            max_duration: updatedSchedule.max_duration,
            auto_approve: updatedSchedule.auto_approve,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update schedule" });
    }
};

const deleteSchedule = async (req, res) => {
    const { schedule_id } = req.params;
    const { uid } = req.user;

    try {
        // First check if there are any associated sessions
        const sessionQuery = `
            SELECT COUNT(*) 
            FROM sessions 
            WHERE schedule_id = $1
        `;
        const sessionResult = await pool.query(sessionQuery, [schedule_id]);
        const sessionCount = parseInt(sessionResult.rows[0].count);

        if (sessionCount > 0) {
            return res.status(409).json({ 
                message: "Cannot delete schedule that has existing appointments. Please cancel all appointments first.",
                sessionCount
            });
        }

        // If no sessions exist, proceed with deletion
        await pool.query(`DELETE FROM schedule_availability WHERE schedule_id = $1`, [schedule_id]);

        const query = `
            DELETE FROM schedules 
            WHERE id = $1 AND user_id = $2 
            RETURNING *
        `;
        const values = [schedule_id, uid];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Schedule not found or you don't have permission to delete it" });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete schedule" });
    }
};

// get schedule by user id
const getScheduleByUserId = async (req, res) => {
    const { uid } = req.params;
    try {
        const query = "SELECT * FROM schedules WHERE user_id = $1";
        const result = await pool.query(query, [uid]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
    getScheduleByUserId,
};