// /services/mail.service.js

const nodemailer = require("nodemailer"); // 📦 Nodemailer: E-posta göndermek için kullanılır
const { MAIL_USER, MAIL_PASS } = process.env; // .env dosyasından e-posta hesabı bilgileri çekilir

// ⚠️ Ortam değişkenleri tanımlı mı kontrol edilir
if (!MAIL_USER || !MAIL_PASS) {
  console.warn("⚠️ MAIL_USER veya MAIL_PASS tanımlı değil!");
}

// ✉️ E-posta gönderici (transporter) nesnesi oluşturuluyor
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail SMTP servisi kullanılıyor
  auth: {
    user: MAIL_USER, // Gönderici e-posta adresi
    pass: MAIL_PASS, // Uygulama şifresi veya hesap şifresi (tercihen app password)
  },
});

/**
 * 📧 sendMail fonksiyonu
 * Belirtilen adrese HTML formatında e-posta gönderir
 *
 * @param {string} to - Alıcı e-posta adresi
 * @param {string} subject - E-posta başlığı
 * @param {string} htmlContent - HTML içeriği (şablon)
 */
async function sendMail(to, subject, htmlContent) {
  try {
    const mailOptions = {
      from: `Rezervasyon Sistemi <${MAIL_USER}>`, // Gönderici görünen adı ve adresi
      to,                                          // Alıcı adresi
      subject,                                     // Konu
      html: htmlContent,                           // İçerik (HTML olarak)
    };

    const info = await transporter.sendMail(mailOptions); // E-posta gönderme işlemi
    console.log(`✉️ Mail gönderildi: ${info.messageId}`); // Başarıyla gönderildiğinde loglanır
  } catch (error) {
    console.error("❌ Mail hatası:", error); // Hata varsa logla
    throw new Error("Mail gönderilemedi");   // Hata dışarı fırlatılır (controller'da yakalanmak üzere)
  }
}

module.exports = sendMail; // Fonksiyon dışarıya açılır
