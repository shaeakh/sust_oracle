const cors = require("cors");
require("dotenv").config();
const express = require("express");
const { connectToDB } = require("./db/dbconnect");
const { createTables } = require("./db/tables");
const authRouter = require("./routes/auth");

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

app.use("/auth", authRouter);

app.listen(PORT, async () => {
  await connectToDB();
  await createTables();
  console.log(`Server is running on port ${PORT}`);
});
