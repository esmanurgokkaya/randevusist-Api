// /services/mail.service.js
const nodemailer = require("nodemailer");
const { MAIL_USER, MAIL_PASS } = process.env;

if (!MAIL_USER || !MAIL_PASS) {
  console.warn("\u26A0\uFE0F MAIL_USER veya MAIL_PASS tanımlı değil!");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

async function sendMail(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: `Rezervasyon Sistemi <${MAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\u2709\uFE0F Mail gönderildi: ${info.messageId}`);
  } catch (error) {
    console.error("\u274C Mail hatası:", error);
    throw new Error("Mail gönderilemedi");
  }
}

module.exports = sendMail;
 