const express = require("express");
const router = express.Router();
const { getUserSessionHistory } = require("../controllers/userstats");
const validateJWT = require("../utils/validateJWT");

router.get("/", (req, res) => res.send("Stats Route"));

router.get("/session-history",validateJWT, getUserSessionHistory);

module.exports = router;