import express from 'express';
import { Octokit } from '@octokit/rest';
import { config } from '../config';
import { performCodeReview } from '../utils/review_pipeline';

const octokit = new Octokit({ auth: config.githubToken });

export const githubWebhook = express.Router();

githubWebhook.post('/webhook', async (req, res) => {
  const { action, pull_request, repository } = req.body;
  
  if (action === 'opened' || action === 'synchronize') {
    console.log(`PR ${action}: ${pull_request.title}`);
    
    // Trigger code review
    performCodeReview(pull_request, repository).catch(console.error);
  }
  
  res.status(200).send('OK');
});
