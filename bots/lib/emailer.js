'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

let _transport = null;

function getTransport() {
  if (!_transport) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    }
    _transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: parseInt(SMTP_PORT || '587', 10) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return _transport;
}

/**
 * Send a single email.
 * @param {object} opts - { to, subject, text, html }
 * @returns {Promise<object>} nodemailer send info
 */
async function sendEmail({ to, subject, text, html }) {
  const transport = getTransport();
  const fromName = process.env.FROM_NAME || 'Bot Vault Pro';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  return transport.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html: html || `<pre style="font-family:sans-serif">${text}</pre>`,
  });
}

module.exports = { sendEmail };
