// utils/emailTemplate.js
const fs = require("fs");
const path = require("path");

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
