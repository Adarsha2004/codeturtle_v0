// src/utils/review-pipeline.ts
import { Octokit } from '@octokit/rest';
import { createCodeReviewSandbox, deleteSandbox } from '../integrations/daytona';
import { performAIReview } from '../agents/code-reviewer';
import { config } from '../config';

const octokit = new Octokit({ auth: config.githubToken });

export async function performCodeReview(pull_request: any, repository: any): Promise<void> {
  console.log(`Starting review for PR #${pull_request.number}: ${pull_request.title}`);
  
  let sandboxId: string | null = null;

  try {
    // Step 1: Create Daytona sandbox and clone PR branch
    console.log('Creating sandbox and cloning repository...');
    sandboxId = await createCodeReviewSandbox(
      repository.clone_url,
      pull_request.head.ref
    );
    console.log(`Sandbox created: ${sandboxId}`);

    // Step 2: Prepare PR context for AI
    const prInfo = `
Title: ${pull_request.title}
Description: ${pull_request.body || 'No description provided'}
Author: ${pull_request.user.login}
Branch: ${pull_request.head.ref}
Files changed: ${pull_request.changed_files || 'Unknown number of files'}
Commits: ${pull_request.commits || 'Unknown number of commits'}
    `.trim();

    // Step 3: Perform AI code review
    console.log('Performing AI code review...');
    const reviewResult = await performAIReview(sandboxId, prInfo);

    // Step 4: Post review comment to GitHub
    console.log('Posting review to GitHub...');
    await octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: pull_request.number,
      body: `## 🤖 AI Code Review

${reviewResult}

---
*This review was generated automatically by an AI code review agent.*`,
    });

    console.log('✅ Review completed successfully!');

  } catch (error) {
    console.error('❌ Review failed:', error);
    
    // Post error comment to GitHub
    try {
      await octokit.issues.createComment({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pull_request.number,
        body: `## ❌ AI Code Review Failed

Sorry, the automated code review encountered an error:

\`\`\`
${error}
\`\`\`

Please try again or contact the maintainer if this issue persists.`,
      });
    } catch (commentError) {
      console.error('Failed to post error comment:', commentError);
    }
  } finally {
    // Step 5: Cleanup sandbox (important for cost management)
    if (sandboxId) {
      console.log('Cleaning up sandbox...');
      await deleteSandbox(sandboxId);
      console.log('Sandbox cleanup completed');
    }
  }
}
