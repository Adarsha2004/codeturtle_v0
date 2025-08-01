import express from 'express';
import { githubWebhook } from './webhooks/github';
import { config } from './config';

const app = express();

app.use(express.json());
app.use('/api', githubWebhook);

app.listen(config.port);