const express = require("express");
const router = express.Router();
const validateJWT = require("../utils/validateJWT");
const { getSessionsByUser, getSessionById, createSession, approveSession, deleteSession, getCustomSessionById } = require("../controllers/sessions");

router.get("/", validateJWT, getSessionsByUser);
router.get("/custom/:session_id", validateJWT, getCustomSessionById);
router.get("/:session_id", validateJWT, getSessionById);
router.post("/", validateJWT, createSession);
router.put("/approve/:session_id", validateJWT, approveSession);
router.delete("/:session_id", validateJWT, deleteSession);

module.exports = router;