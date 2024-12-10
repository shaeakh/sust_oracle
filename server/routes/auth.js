const express = require("express");
const {
  registration,
  registrationVerify,
  resendVerification,
  login,
  forgotPassword,
  vaildateResetOtp,
} = require("../controllers/auth");
const router = express.Router();

router.get("/registration", (req, res) => res.send("Auth Route"));
router.post("/registration", registration);
router.post("/registration-verify", registrationVerify);
router.post("/resend-verification", resendVerification);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/validate-reset-otp", vaildateResetOtp);

module.exports = router;
