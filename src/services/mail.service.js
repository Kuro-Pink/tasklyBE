import nodemailer from 'nodemailer';
import Project from '../models/Project.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

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

export const sendDeadlineReminder = async (to, issue) => {
  const project = await Project.findById(issue.project);

  // Convert sang giờ Việt Nam
  const deadlineVN = dayjs(issue.dueDate).tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY - HH:mm');

  const mailOptions = {
    from: `"Taskly System" <${process.env.MAIL_USER}>`,
    to,
    subject: `⏰ Issue gần đến hạn: "${project.key} - ${issue.number}: ${issue.title}"`,
    html: `
      <h3>Issue sắp đến hạn</h3>
      <p><b>Công việc:</b> "${project.key} - ${issue.number}: ${issue.title}"</p>
      <p><b>Hạn làm:</b> ${deadlineVN}</p>
      <p>Vui lòng hoàn thành trước khi quá hạn.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
