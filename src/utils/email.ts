import nodemailer from 'nodemailer';

export const sendRecoveryEmail = async (to: string, code: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Mistura App" <no-reply@mistura.com>',
    to,
    subject: 'Recuperação de senha',
    text: `Seu código de recuperação é: ${code}`,
  });
};
