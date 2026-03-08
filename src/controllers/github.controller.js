import Issue from '../models/Issue.js';

export const githubWebhookController = async (req, res) => {
  try {
    const commits = req.body.commits || [];

    for (const commit of commits) {
      const message = commit.message;

      // tìm issue key dạng TASK-12
      const match = message.match(/([A-Z]+-\d+)/);

      if (!match) continue;

      const issueKey = match[1];

      const issue = await Issue.findOne({ key: issueKey });

      if (!issue) continue;

      issue.commits.push({
        message: commit.message,
        url: commit.url,
        author: commit.author?.name,
        date: commit.timestamp,
      });

      await issue.save();
    }

    res.status(200).send('ok');
  } catch (error) {
    console.error('GitHub webhook error:', error);
    res.status(500).send('Webhook error');
  }
};
