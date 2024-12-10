const nodemailer = require("nodemailer");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

// Configuration for nodemailer
const config = {
  service: "gmail",
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
};

// Create a transporter object
const transporter = nodemailer.createTransport(config);

// Single email sending service
const singleMailService = async (email, subject, body) => {
  const mail = {
    from: `"Team SUST Oracle" <${process.env.EMAIL}>`,
    to: email,
    subject: subject,
    html: body,
  };

  try {
    await transporter.sendMail(mail);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message); // Log error for debugging
    return false;
  }
};

module.exports = singleMailService;
