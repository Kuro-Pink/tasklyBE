import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const createGithubRepo = async (repoName, description) => {
  const repo = await octokit.repos.createForAuthenticatedUser({
    name: repoName,
    description,
    private: true,
  });

  await octokit.repos.createWebhook({
    owner: process.env.GITHUB_USERNAME,
    repo: repoName,
    config: {
      url: `${process.env.SERVER_URL}/api/v1/github/webhook`,
      content_type: 'json',
    },
    events: ['push'],
  });

  return repo.data;
};
