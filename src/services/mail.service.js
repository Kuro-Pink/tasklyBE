import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendInvitationEmail = async (email, projectName, token) => {
  const link = `${process.env.CLIENT_URL}/invite/accept?token=${token}`;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: `Bạn được mời tham gia dự án ${projectName}`,
    html: `
      <p>Bạn đã được mời tham gia dự án <strong>${projectName}</strong></p>
      <p>Click vào link bên dưới để tham gia:</p>
      <a href="${link}">${link}</a>
    `,
  });
};
