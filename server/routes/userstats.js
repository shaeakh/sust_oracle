const express = require("express");
const router = express.Router();
const { getUserSessionHistory, getSessionCountByDuration } = require("../controllers/userstats");
const validateJWT = require("../utils/validateJWT");

router.get("/", (req, res) => res.send("Stats Route"));

router.get("/session-history",validateJWT, getUserSessionHistory);
router.get("/session-history/duration",validateJWT, getSessionCountByDuration);

module.exports = router;