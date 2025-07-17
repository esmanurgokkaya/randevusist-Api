// utils/emailTemplate.js
const fs = require("fs");
const path = require("path");

/**
 * @desc Email şablonunu belirtilen içerikle doldurur
 * @param {Object} param0
 * @param {string} param0.title - E-posta başlığı
 * @param {string} param0.name - Alıcının adı
 * @param {string} param0.content - E-posta içeriği (HTML)
 * @returns {string} - Doldurulmuş HTML e-posta şablonu
 */
function renderEmailTemplate({ title, name, content }) {
  const templatePath = path.join(__dirname, "../templates/emailTemplate.html");
  let template = fs.readFileSync(templatePath, "utf8");

  template = template
    .replace(/{{title}}/g, title)
    .replace(/{{name}}/g, name)
    .replace(/{{content}}/g, content);

  return template;
}

module.exports = renderEmailTemplate;
