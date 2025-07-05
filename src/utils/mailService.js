// 📧 Nodemailer ile e-posta gönderimi yapılır
const nodemailer = require('nodemailer');

// 🌐 .env üzerinden mail kullanıcı bilgileri alınır
const { MAIL_USER, MAIL_PASS } = process.env;

// 🔒 Ortam değişkenleri eksikse uyarı verir
if (!MAIL_USER || !MAIL_PASS) {
  console.warn("⚠️ MAIL_USER veya MAIL_PASS .env dosyasında tanımlı değil!");
}

// 🛠️ Mail sunucusu yapılandırması
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail dışı servisler için host, port, secure da kullanılabilir
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
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
    // ✉️ Mail gönderme işlemi
    await transporter.sendMail({
      from: `"Randevu Sistemi" <${MAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`📬 Mail gönderildi → ${to}`);
  } catch (error) {
    console.error("❌ Mail gönderimi başarısız:", error);
    throw new Error('Mail gönderilemedi');
  }
};

module.exports = sendMail;
