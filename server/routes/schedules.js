const express = require("express");
const router = express.Router();
const { createSchedule, getAllSchedules, getScheduleById, updateSchedule, deleteSchedule } = require("../controllers/schedules");
const validateJWT = require("../utils/validateJWT");

router.post("/", validateJWT, createSchedule);
router.get("/", validateJWT, getAllSchedules);
router.get("/:schedule_id", validateJWT, getScheduleById);
router.put("/:schedule_id", validateJWT, updateSchedule);
router.delete("/:schedule_id", validateJWT, deleteSchedule);

module.exports = router;