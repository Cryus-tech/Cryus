import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { TokenGeneratorController } from './controllers/tokenGeneratorController';

// Create Express application
const app = express();

// Middleware
app.use(cors());
app.use(json());

// Create controller instances
const tokenGeneratorController = new TokenGeneratorController();

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'Cryus AI-Driven Token Generation Platform API',
    version: '1.0.0',
    status: 'active'
  });
});

// Token generator routes
app.post('/api/token-generator/message', (req, res) => tokenGeneratorController.sendMessage(req, res));
app.get('/api/token-generator/conversation', (req, res) => tokenGeneratorController.getConversation(req, res));
app.post('/api/token-generator/reset', (req, res) => tokenGeneratorController.resetConversation(req, res));
app.post('/api/token-generator/generate', (req, res) => tokenGeneratorController.generateToken(req, res));
app.get('/api/token-generator/features', (req, res) => tokenGeneratorController.getTokenFeatures(req, res));
app.get('/api/token-generator/blockchains', (req, res) => tokenGeneratorController.getAvailableBlockchains(req, res));
app.get('/api/token-generator/templates/:blockchain', (req, res) => tokenGeneratorController.getAvailableTemplates(req, res));

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

export default app; 