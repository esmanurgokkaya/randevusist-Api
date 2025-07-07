// 📧 Nodemailer ile e-posta gönderimi yapılır
const nodemailer = require('nodemailer');

// 🌐 .env üzerinden mail kullanıcı bilgileri alınır
const { MAIL_USER, MAIL_PASS } = process.env;

// 🔒 Ortam değişkenleri eksikse uyarı verir
if (!MAIL_USER || !MAIL_PASS) {
  console.warn("⚠️ MAIL_USER veya MAIL_PASS .env dosyasında tanımlı değil!");
}

// 🛠️ Mail sunucusu yapılandırması (Gmail servisi ile)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS, // ❗ Gmail uygulama şifresi kullanılmalı
  },
});

/**
 * @desc Belirtilen adrese e-posta gönderir
 * @param {string} to - Alıcı e-posta adresi
 * @param {string} subject - Konu başlığı
 * @param {string} htmlContent - HTML içerik
 * @returns {Promise<void>}
 */
const sendMail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"Randevu Sistemi" <${MAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    // ✉️ Mail gönderme işlemi
    const info = await transporter.sendMail(mailOptions);
    console.log(`📬 Mail gönderildi → ${to} | Mesaj ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Mail gönderimi başarısız:");
    console.error("Hata Mesajı:", error.message);
    if (error.response) {
      console.error("SMTP Yanıtı:", error.response);
    }
    throw new Error('Mail gönderilemedi');
  }
};

module.exports = sendMail;
