import cron from 'node-cron';
import dayjs from 'dayjs';
import Issue from '../models/Issue.js';
import Status from '../models/Status.js';
import { sendDeadlineReminder } from '../services/mail.service.js';

cron.schedule('0 9 * * *', async () => {
  console.log('Running deadline reminder job...');

  const now = dayjs();
  const twoDaysLater = now.add(2, 'day');

  const doneStatus = await Status.findOne({ name: 'Hoàn thành' || 'Done' });

  const issues = await Issue.find({
    dueDate: {
      $gte: now.toDate(),
      $lte: twoDaysLater.toDate(),
    },
    status: { $ne: doneStatus._id },
  }).populate('assignee');

  for (const issue of issues) {
    if (issue.assignee?.email) {
      await sendDeadlineReminder(issue.assignee.email, issue);
    }
  }
});
