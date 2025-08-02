import { Daytona } from '@daytonaio/sdk';
import { config } from '../config';

export async function createCodeReviewSandbox(repoUrl: string, branch: string): Promise<string> {
  const daytona = new Daytona({
    apiKey: config.daytonaApiKey,
  });

  try {
    const sandbox = await daytona.create({
      language: 'typescript',
      autoStopInterval: 15, //stop after 5 mins
    });

    // Clone the PR branch
    await sandbox.git.clone(
      repoUrl,
      'review-workspace',
      branch,
      undefined,
      'git',
      config.githubToken
    );

    return sandbox.id;
  } catch (error) {
    throw new Error(`Failed to create sandbox: ${error}`);
  }
}

export async function executeInSandbox(sandboxId: string, command: string): Promise<string> {
  const daytona = new Daytona({ apiKey: config.daytonaApiKey });
  const sandbox = await daytona.get(sandboxId);

  try {
    const result = await sandbox.process.executeCommand(command, 'review-workspace');
    return result.result;
  } catch (error) {
    throw new Error(`Command execution failed: ${error}`);
  }
}

export async function deleteSandbox(sandboxId: string): Promise<void> {
  try {
    const daytona = new Daytona({ apiKey: config.daytonaApiKey });
    const sandbox = await daytona.get(sandboxId);
    await sandbox.delete();
  } catch (error) {
    console.error(`Failed to delete sandbox: ${error}`);
  }
}