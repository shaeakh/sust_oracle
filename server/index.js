const cors = require("cors");
require("dotenv").config();
const express = require("express");
const { connectToDB } = require("./db/dbconnect");
const { createTables } = require("./db/tables");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const scheduleRouter = require("./routes/schedules");
const sessionRouter = require("./routes/session");
const userStatsRouter = require("./routes/userstats");
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const adminStatRouter = require("./routes/adminstat");

const app = express();
const PORT = 5050;

app.use(express.json());
const corsOptions = {
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Create HTTP server
const server = require('http').createServer(app);

// Create Socket.IO instance
const io = new Server(server, {
  cors: corsOptions,
  path: '/socket.io'
});

// Authentication middleware for Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Connection handling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join-chat', ({ roomId }) => {
    socket.join(`chat-${roomId}`);
    console.log(`User ${socket.user.uid} joined chat room ${roomId}`);
  });

  socket.on('leave-chat', ({ roomId }) => {
    socket.leave(`chat-${roomId}`);
    console.log(`User ${socket.user.uid} left chat room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/schedules", scheduleRouter);
app.use("/session", sessionRouter);
app.use("/userstats", userStatsRouter);
app.use("/chat", require("./routes/chat"));
app.use("/adminstat", adminStatRouter);

server.listen(PORT, async () => {
  await connectToDB();
  await createTables();
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, io };
