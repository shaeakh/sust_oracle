const express = require("express");
const router = express.Router();
const { pool } = require("../db/dbconnect");
const validateJWT = require("../utils/validateJWT");

// Create or get chat room
router.post("/room", validateJWT, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const currentUserId = req.user.uid;

    // Make sure we're not creating a chat room with ourselves
    if (currentUserId === parseInt(otherUserId)) {
      return res.status(400).json({ message: "Cannot create chat room with yourself" });
    }

    // Try to find existing room
    const existingRoomQuery = `
      SELECT id FROM chat_rooms 
      WHERE (user1_id = $1 AND user2_id = $2) 
         OR (user1_id = $2 AND user2_id = $1)
    `;
    const existingRoom = await pool.query(existingRoomQuery, [currentUserId, otherUserId]);

    if (existingRoom.rows.length > 0) {
      return res.json({ roomId: existingRoom.rows[0].id });
    }

    // Create new room
    const createRoomQuery = `
      INSERT INTO chat_rooms (user1_id, user2_id)
      VALUES ($1, $2)
      RETURNING id
    `;
    const newRoom = await pool.query(createRoomQuery, [currentUserId, otherUserId]);

    res.json({ roomId: newRoom.rows[0].id });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ message: "Error creating chat room" });
  }
});

// Get chat messages
router.get("/messages/:roomId", validateJWT, async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user.uid;

    // Verify user has access to this room
    const roomCheck = await pool.query(
      `SELECT * FROM chat_rooms 
       WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [roomId, currentUserId]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get messages with user details
    const messages = await pool.query(
      `SELECT 
        cm.*,
        u.user_name as sender_name
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.uid
       WHERE cm.room_id = $1
       ORDER BY cm.created_at ASC`,
      [roomId]
    );

    res.json(messages.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Send message
router.post("/message", validateJWT, async (req, res) => {
  try {
    const { roomId, message } = req.body;
    const senderId = req.user.uid;

    // Verify user has access to this room
    const roomCheck = await pool.query(
      `SELECT * FROM chat_rooms 
       WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [roomId, senderId]
    );

    if (roomCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Insert message
    const result = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
      [roomId, senderId, message]
    );

    // Get sender's name
    const senderInfo = await pool.query(
      'SELECT user_name FROM users WHERE uid = $1',
      [senderId]
    );

    const messageData = {
      id: result.rows[0].id,
      room_id: roomId,
      sender_id: senderId,
      sender_name: senderInfo.rows[0].user_name,
      message: message,
      created_at: result.rows[0].created_at
    };

    // Get Socket.IO instance
    const io = req.app.get('io');
    
    // Emit to room
    if (io) {
      io.to(`chat-${roomId}`).emit('new-message', messageData);
    }

    res.json(messageData);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: "Error sending message" });
  }
});

module.exports = router;
