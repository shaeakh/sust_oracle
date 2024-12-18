const express = require("express");
const router = express.Router();
const { getUserSessionHistory, getSessionCountByDuration, getAcceptanceRate, getUserSessions } = require("../controllers/userstats");
const validateJWT = require("../utils/validateJWT");

router.get("/", (req, res) => res.send("Stats Route"));

router.get("/session-history",validateJWT, getUserSessionHistory);
router.get("/session-history/duration",validateJWT, getSessionCountByDuration);
router.get("/acceptance-rate/:user_id",validateJWT, getAcceptanceRate);
router.get("/sessions",validateJWT, getUserSessions);


module.exports = router;