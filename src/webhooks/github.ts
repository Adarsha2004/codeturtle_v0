import express from 'express';
import { Octokit } from '@octokit/rest';
import { config } from '../config';

const octokit = new Octokit({ auth: config.githubToken });

export const githubWebhook = express.Router();

githubWebhook.post('/webhook', async (req, res) => {
  const { action, pull_request, repository } = req.body;
  
  if (action === 'opened' || action === 'synchronize') {
    console.log(`PR ${action}: ${pull_request.title}`);
    
    // Trigger code review (we'll implement this next)
    await triggerCodeReview(pull_request, repository);
  }
  
  res.status(200).send('OK');
});

async function triggerCodeReview(pull_request: any, repository: any) {
  // Implementation coming in next steps
  console.log('Code review triggered for PR:', pull_request.number);
  console.log('Repository:', repository.name);
  console.log('PR Title:', pull_request.title);
  console.log('PR Author:', pull_request.user.login);
  console.log('Branch:', pull_request.head.ref);
}
