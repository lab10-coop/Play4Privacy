import nodemailer from 'nodemailer';

export default function sendWallet(recipient, text, buffer, fn) {
  const transporter = nodemailer.createTransport({
    host: 'mail.***.net',
    port: 465,
    secure: true,
    auth: {
      user: '***@***.at',
      pass: '****',
    },
  });
  const mailOptions = {
    from: 'david.forstenlechner@gmx.at',
    to: recipient,
    subject: 'Sending Email using Node.js',
    text,
    attachments: [ {
      filename: 'wallet.json',
      content: buffer,
    } ],
  };
  transporter.sendMail(mailOptions, fn);
}
