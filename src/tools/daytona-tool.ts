import { executeInSandbox } from '../integrations/daytona';

export async function executeDaytonaCommand(sandboxId: string, command: string): Promise<string> {
  try {
    const result = await executeInSandbox(sandboxId, command);
    return result;
  } catch (error) {
    return `Error executing command: ${error}`;
  }
}

export function getDaytonaToolConfig(sandboxId: string) {
  return {
    name: 'daytona_execute',
    description: 'Execute commands in Daytona sandbox environment for code analysis. Use this to run commands like "npm run lint", "npm test", "cat filename.js", "find . -name \'*.ts\'", etc.',
    func: (command: string) => executeDaytonaCommand(sandboxId, command)
  };
}
