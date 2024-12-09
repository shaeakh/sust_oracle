const express = require("express");
const router = express.Router();
const validateJWT = require("../utils/validateJWT");
const { getDailySessionCount, getAllSessionData, generateInsightfulReport } = require("../controllers/adminstat");

router.post("/daily-session-count", validateJWT, getDailySessionCount);
router.get("/get-all-sessions", validateJWT, getAllSessionData);
router.post("/generate-insightful-report", validateJWT, generateInsightfulReport);

module.exports = router;