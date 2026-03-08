import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const createGithubRepo = async (repoName, description) => {
  const response = await octokit.repos.createForAuthenticatedUser({
    name: repoName,
    description,
    private: true,
  });

  return response.data;
};
