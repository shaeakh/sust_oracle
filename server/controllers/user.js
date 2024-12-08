const {pool} = require("../db/dbconnect");

const getUser = async (req, res) => {
    const {uid} = req.user;
    try {
        // return user info without password
        const query = "SELECT uid, user_name, user_email, bio, location, isverified FROM users WHERE uid = $1";
        const result = await pool.query(query, [uid]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = result.rows[0];
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateUser = async (req, res) => {
    const {uid} = req.user;
    const updates = req.body;
    const allowedFields = ["user_name", "user_email", "bio", "location"];
    const validUpdates = Object.keys(updates).filter((key) => allowedFields.includes(key));
    try {
        const query = `UPDATE users SET ${validUpdates.map((key) => `${key} = $${validUpdates.indexOf(key) + 1}`).join(", ")} WHERE uid = $${validUpdates.length + 1} RETURNING *`;
        const values = Object.values(updates).concat(uid);
        let result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        // remove password from response
        delete result.rows[0].password;
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const query = "SELECT uid, user_name, user_email, bio, location, isverified FROM users";
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getUser, updateUser, getAllUsers };