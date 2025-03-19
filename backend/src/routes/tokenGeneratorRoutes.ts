import { Router } from 'express';
import { TokenGeneratorController } from '../controllers/tokenGeneratorController';

const router = Router();
const tokenGeneratorController = new TokenGeneratorController();

// AI对话接口
router.post('/chat', tokenGeneratorController.chatMessage.bind(tokenGeneratorController));
router.get('/chat/history', tokenGeneratorController.getChatHistory.bind(tokenGeneratorController));
router.post('/chat/reset', tokenGeneratorController.resetConversation.bind(tokenGeneratorController));

// 代币配置接口
router.post('/config/update', tokenGeneratorController.updateTokenConfig.bind(tokenGeneratorController));
router.get('/features', tokenGeneratorController.getAvailableTokenFeatures.bind(tokenGeneratorController));

// 部署相关接口
router.post('/estimate-fee', tokenGeneratorController.estimateDeploymentFee.bind(tokenGeneratorController));
router.post('/deploy', tokenGeneratorController.deployToken.bind(tokenGeneratorController));
router.get('/tx/:txHash', tokenGeneratorController.checkTransactionStatus.bind(tokenGeneratorController));

export default router; 