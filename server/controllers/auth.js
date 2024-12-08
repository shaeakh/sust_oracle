const { pool } = require("../db/dbconnect");
const singleMailService = require("../utils/mailService");
const otpGenerator = require("../utils/otpGenerator");
const passwordGenerator = require("../utils/passGenerator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registration = async (req, res) => {
  // Registration logic here
  const { email, username, password } = req.body;
  const hassedPassword = await bcrypt.hash(password, 10);

  if (!email || !username || !password) {
    return res.status(400).json({ message: "Email, Username, and Password are required" });
  }

  try {

    // check if email already exists
    const emailQuery = "SELECT * FROM users WHERE user_email = $1";
    const emailResult = await pool.query(emailQuery, [email]);

    if (emailResult.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // generate hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user into database
    const insertQuery = "INSERT INTO users (user_name, user_email, password) VALUES ($1, $2, $3) RETURNING *";
    const insertResult = await pool.query(insertQuery, [username, email, hashedPassword]);

    if (insertResult.rows.length === 0) {
      return res.status(500).json({ message: "Registration failed" });
    }

    // generate OTP
    const otp = otpGenerator();

    // insert OTP into database
    const otpQuery = "INSERT INTO email_otp (email_id, otp, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *";
    const otpResult = await pool.query(otpQuery, [email, otp]);

    // send email with OTP
    const emailBody = `
      <p style="text-align: center;">
        <img src="https://res.cloudinary.com/djx7nzzzq/image/upload/v1733142971/qgebalt4vovtkeedmkb3.png" style="width: 187px;">
      </p>
      <p>Dear ${username},</p>
      <p>Thank you for signing up with <strong>SUST Oracle</strong>! To complete your registration, please verify your email address by entering the One-Time Password (OTP) provided below:</p>
      <p style="text-align: center; font-size: 30px; background-color: rgb(209, 213, 216); padding: 10px;">${otp}</p>
      <p>This OTP is valid for the next 5 minutes. Please do not share it with anyone for security reasons.</p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <p>Thank you,<br><strong>Team SUST Oracle</strong></p>
    `;

    const subject = "SUST Oracle - Verify Your Email Address";

    await singleMailService(email, subject, emailBody);

    if (insertResult.rows.length > 0) {
      return res.status(201).json({ message: "Registration successful. OTP sent to your email. Please verify your email to complete the registration process." });
    }

  } catch (error) {
    console.error("Error in registration:", error.message);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }

};

const registrationVerify = async (req, res) => {
  // Registration verification logic here
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    // check if email exists in database
    const emailQuery = "SELECT * FROM users WHERE user_email = $1";
    const emailResult = await pool.query(emailQuery, [email]);

    if (emailResult.rows.length === 0) {
      return res.status(400).json({ message: "Email does not exist in our database" });
    }

    // check if OTP is valid
    const otpQuery = "SELECT * FROM email_otp WHERE email_id = $1 AND otp = $2 AND created_at > NOW() - INTERVAL '5 minutes'";
    const otpResult = await pool.query(otpQuery, [email, otp]);

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }

    // update user in database
    const updateQuery = "UPDATE users SET isverified = true WHERE user_email = $1";
    const updateResult = await pool.query(updateQuery, [email]);

    if (updateResult.rowCount === 0) {
      return res.status(500).json({ message: "Registration verification failed" });
    }

    // delete OTP from database
    const deleteQuery = "DELETE FROM email_otp WHERE email_id = $1";
    await pool.query(deleteQuery, [email]);

    // send success mail
    const emailBody = `
      <p style="text-align: center;">
        <img src="https://res.cloudinary.com/djx7nzzzq/image/upload/v1733142971/qgebalt4vovtkeedmkb3.png" style="width: 187px;">
      </p>
      <p>Dear ${emailResult.rows[0].user_name},</p>
      <p>Thank you for verifying your email address with <strong>SUST Oracle</strong>. You can now access all the features of our platform.</p>
      <p>Thank you,<br><strong>Team SUST Oracle</strong></p>
    `;

    const subject = "SUST Oracle - Email Verification Successful";

    await singleMailService(email, subject, emailBody);

    return res.status(200).json({ message: "Registration verification successful. You can now access all the features of our platform." });

  } catch (error) {
    console.error("Error in registration verification:", error.message);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

const resendVerification = async (req, res) => {
  // Resend verification logic here
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // check if email exists in database
    const emailQuery = "SELECT * FROM email_otp WHERE email_id = $1";
    const emailResult = await pool.query(emailQuery, [email]);

    if (emailResult.rows.length === 0) {
      return res.status(400).json({ message: "Email does not exist in our database" });
    }

    // generate OTP
    const otp = otpGenerator();

    // update OTP in database
    const updateQuery = "UPDATE email_otp SET otp = $1, created_at = CURRENT_TIMESTAMP WHERE email_id = $2";
    const updateResult = await pool.query(updateQuery, [otp, email]);

    // send email with OTP
    const emailBody = `
      <p style="text-align: center;">
        <img src="https://res.cloudinary.com/djx7nzzzq/image/upload/v1733142971/qgebalt4vovtkeedmkb3.png" style="width: 187px;">
      </p>
      <p>Dear ${emailResult.rows[0].user_name},</p>
      <p>Thank you for signing up with <strong>SUST Oracle</strong>! To complete your registration, please verify your email address by entering the One-Time Password (OTP) provided below:</p>
      <p style="text-align: center; font-size: 30px; background-color: rgb(209, 213, 216); padding: 10px;">${otp}</p>
      <p>This OTP is valid for the next 5 minutes. Please do not share it with anyone for security reasons.</p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <p>Thank you,<br><strong>Team SUST Oracle</strong></p>
    `;

    const subject = "SUST Oracle - Verify Your Email Address";

    await singleMailService(email, subject, emailBody);

    if (updateResult.rowCount > 0) {
      return res.status(200).json({ message: "OTP sent to your email. Please verify your email to complete the registration process." });
    } else {
      return res.status(500).json({ message: "An error occurred. Please try again later." });
    }

  } catch (error) {
    console.error("Error in resend verification:", error.message);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

const login = async (req, res) => {
  // Login logic here
  const { email, password, remember } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try {
    // check if email exists in database
    const emailQuery = "SELECT * FROM users WHERE user_email = $1";
    const emailResult = await pool.query(emailQuery, [email]);

    if (emailResult.rows.length === 0) {
      return res.status(400).json({ message: "Email does not exist in our database" });
    }

    // check if verified
    if (!emailResult.rows[0].isverified) {
      return res.status(400).json({ message: "Email is not verified. Please verify your email to complete the registration process." });
    }

    // check if password is correct
    const passwordMatch = await bcrypt.compare(password, emailResult.rows[0].password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // create JWT token with 1 day expiration and if remember is true, set it to 30 days
    const token = jwt.sign({ uid: emailResult.rows[0].uid, email: emailResult.rows[0].user_email }, process.env.SECRET, { expiresIn: remember ? "30d" : "1d" });

    // send success response
    return res.status(200).json({ message: "Login successful", token: token });

  } catch (error) {
    console.error("Error in login:", error.message);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

const forgotPassword = async (req, res) => {
  // Forgot password logic here
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // check if email exists in database
    const emailQuery = "SELECT * FROM users WHERE user_email = $1";
    const emailResult = await pool.query(emailQuery, [email]);

    if (emailResult.rows.length === 0) {
      return res.status(400).json({ message: "Email does not exist in our database" });
    }

    // generate OTP
    const otp = otpGenerator();
    const currentTimestamp = new Date();

    // First check if email exists in reset_otp table
    const checkOtpQuery = "SELECT * FROM reset_otp WHERE email_id = $1";
    const otpResult = await pool.query(checkOtpQuery, [email]);

    let updateResult;
    if (otpResult.rows.length > 0) {
      // Update existing record
      const updateQuery = "UPDATE reset_otp SET otp = $1, created_at = $2 WHERE email_id = $3";
      updateResult = await pool.query(updateQuery, [otp, currentTimestamp, email]);
    } else {
      // Insert new record
      const insertQuery = "INSERT INTO reset_otp (email_id, otp, created_at) VALUES ($1, $2, $3)";
      updateResult = await pool.query(insertQuery, [email, otp, currentTimestamp]);
    }
    // send email with OTP
    const emailBody = `
      <p style="text-align: center;">
        <img src="https://res.cloudinary.com/djx7nzzzq/image/upload/v1733142971/qgebalt4vovtkeedmkb3.png" style="width: 187px;">
      </p>  
      <p>Dear ${emailResult.rows[0].user_name},</p>
      <p>Thank you for signing up with <strong>SUST Oracle</strong>! To reset your password, please enter the One-Time Password (OTP) provided below:</p>
      <p style="text-align: center; font-size: 30px; background-color: rgb(209, 213, 216); padding: 10px;">${otp}</p>
      <p>This OTP is valid for the next 5 minutes. Please do not share it with anyone for security reasons.</p>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <p>Thank you,<br><strong>Team SUST Oracle</strong></p>
    `;

    const subject = "SUST Oracle - Reset Your Password";

    await singleMailService(email, subject, emailBody);

    if (updateResult.rowCount > 0) {
      return res.status(200).json({ message: "OTP sent to your email. Please enter the OTP to reset your password." });
    } else {
      return res.status(500).json({ message: "An error occurred. Please try again later." });
    }

  } catch (error) {
    console.error("Error in forgot password:", error.message);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

const vaildateResetOtp = async (req, res) => {
  // Validate reset OTP logic here
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    // check if email exists in database
    const emailQuery = "SELECT * FROM reset_otp WHERE email_id = $1";
    const emailResult = await pool.query(emailQuery, [email]);

    if (emailResult.rows.length === 0) {
      return res.status(400).json({ message: "Email does not exist in our database" });
    }

    // check if OTP is valid with expiry
    const storedOtp = String(emailResult.rows[0].otp);
    const receivedOtp = String(otp);
    const otpCreatedAt = new Date(emailResult.rows[0].created_at).getTime();
    const expiryTime = Date.now() - (5 * 60 * 1000); // 5 minutes ago
    
    if (storedOtp !== receivedOtp || otpCreatedAt < expiryTime) {
      return res.status(400).json({ message: "OTP is incorrect or has expired" });
    }

    // create new password
    const newPassword = passwordGenerator();

    // Get user info for email
    const userQuery = "SELECT user_name FROM users WHERE user_email = $1";
    const userResult = await pool.query(userQuery, [email]);

    // update password in database
    const updateQuery = "UPDATE users SET password = $1 WHERE user_email = $2";
    const updateResult = await pool.query(updateQuery, [await bcrypt.hash(newPassword, 10), email]);

    // send email with new password
    const emailBody = `
      <p style="text-align: center;">
        <img src="https://res.cloudinary.com/djx7nzzzq/image/upload/v1733142971/qgebalt4vovtkeedmkb3.png" style="width: 187px;">
      </p>  
      <p>Dear ${userResult.rows[0].user_name},</p>
      <p>Thank you for signing up with <strong>SUST Oracle</strong>! Your new password is:</p>
      <p style="text-align: center; font-size: 30px; background-color: rgb(209, 213, 216); padding: 10px;">${newPassword}</p>
      <p>Please use this password to login to your account.</p>
      <p>Thank you,<br><strong>Team SUST Oracle</strong></p>
    `;

    const subject = "SUST Oracle - Your New Password";

    await singleMailService(email, subject, emailBody);

    if (updateResult.rowCount > 0) {
      return res.status(200).json({ message: "Password reset successful. Please check your email for your new password." });
    } else {
      return res.status(500).json({ message: "An error occurred. Please try again later." });
    }

  } catch (error) {
    console.error("Error in validate reset OTP:", error.message);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

module.exports = { registration, registrationVerify, resendVerification, login, forgotPassword, vaildateResetOtp };
