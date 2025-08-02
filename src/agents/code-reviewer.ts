import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { DynamicTool } from 'langchain/tools';
import { getDaytonaToolConfig } from '../tools/daytona-tool';
import { config } from '../config';

const CODE_REVIEW_PROMPT = `
You are an expert code reviewer. Analyze the code changes and provide constructive feedback.

Focus on:
1. Code quality and readability
2. Security vulnerabilities  
3. Performance issues
4. Best practices
5. Potential bugs

Use the daytona_execute tool to run commands like:
- "npm run lint" for linting
- "npm test" for testing
- "cat filename" to read files
- "find . -name '*.ts'" to explore structure

Be specific and helpful in your feedback.

Pull Request Info: {input}
`;

export async function createCodeReviewAgent(sandboxId: string) {
  const llm = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0.1,
    openAIApiKey: config.openaiApiKey,
  });

  const daytonaConfig = getDaytonaToolConfig(sandboxId);
  const daytonaTool = new DynamicTool(daytonaConfig);

  const tools = [daytonaTool];
  
  const prompt = ChatPromptTemplate.fromTemplate(CODE_REVIEW_PROMPT);
  
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
    maxIterations: 5,
  });
}

export async function performAIReview(sandboxId: string, prInfo: string): Promise<string> {
  const executor = await createCodeReviewAgent(sandboxId);

  const result = await executor.invoke({
    input: prInfo,
  });

  return result.output;
}
