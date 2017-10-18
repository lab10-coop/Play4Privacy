import nodemailer from 'nodemailer';

export default function sendWallet(recipient, subject, text, buffer, fn) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS,
    },
  });
  const mailOptions = {
    from: 'play@lab10.coop',
    to: recipient,
    subject,
    text,
    attachments: [ {
      filename: 'wallet.json',
      content: buffer,
    } ],
  };
  transporter.sendMail(mailOptions, fn);
}
