import nodemailer from 'nodemailer';

// Email is optional. If SMTP isn't configured, we log the message to the
// console instead of failing — so the app still works during development.
export const isEmailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!isEmailConfigured()) {
    console.log('\n──────── EMAIL (SMTP not configured — logged instead) ────────');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text || html);
    console.log('──────────────────────────────────────────────────────────────\n');
    return { skipped: true };
  }
  const from = process.env.EMAIL_FROM || 'DSA Tracker <no-reply@dsatracker.app>';
  await getTransporter().sendMail({ from, to, subject, html, text });
  return { sent: true };
};

// ---- Simple branded HTML templates ----
const wrap = (title, body) => `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#1f2733">
    <h2 style="color:#5b6cff">DSA Tracker</h2>
    <h3>${title}</h3>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="font-size:12px;color:#888">If you didn't request this, you can safely ignore this email.</p>
  </div>`;

const button = (url, label) =>
  `<a href="${url}" style="display:inline-block;background:#5b6cff;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:bold">${label}</a>`;

export const verificationEmail = (name, link) =>
  wrap(
    'Verify your email',
    `<p>Hi ${name || 'there'}, welcome! Please confirm your email address to activate your account.</p>
     <p style="margin:22px 0">${button(link, 'Verify Email')}</p>
     <p style="font-size:13px;color:#666">Or paste this link into your browser:<br>${link}</p>
     <p style="font-size:13px;color:#666">This link expires in 24 hours.</p>`
  );

export const resetPasswordEmail = (name, link, isSet = false) =>
  wrap(
    isSet ? 'Set your password' : 'Reset your password',
    `<p>Hi ${name || 'there'}, ${
      isSet
        ? 'you can set a password for your account so you can also log in with your email (in addition to Google).'
        : 'we received a request to reset your password.'
    }</p>
     <p style="margin:22px 0">${button(link, isSet ? 'Set Password' : 'Reset Password')}</p>
     <p style="font-size:13px;color:#666">Or paste this link into your browser:<br>${link}</p>
     <p style="font-size:13px;color:#666">This link expires in 1 hour.</p>`
  );
