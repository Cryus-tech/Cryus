import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { TokenConfig, TokenFeature, ChatMessage } from '../types/tokenGenerator';

// API基础URL
const API_BASE_URL = '/api/token';

/**
 * 代币生成器页面组件
 */
const TokenGenerator: React.FC = () => {
  // 状态管理
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenConfig, setTokenConfig] = useState<TokenConfig>({
    name: '',
    symbol: '',
    decimals: 18,
    initialSupply: '1000000',
    features: [TokenFeature.BURNABLE]
  });
  const [tokenFeatures, setTokenFeatures] = useState<Array<{key: string, label: string, description: string}>>([]);
  const [notification, setNotification] = useState<{
    open: boolean,
    message: string,
    type: 'success' | 'error' | 'info'
  }>({
    open: false,
    message: '',
    type: 'info'
  });
  const [deploymentFee, setDeploymentFee] = useState<{
    fee: string,
    feeUSD: string,
    currency: string
  } | null>(null);
  const [deployButtonEnabled, setDeployButtonEnabled] = useState<boolean>(false);
  
  // 引用
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // 初始加载
  useEffect(() => {
    // 获取可用的代币特性
    fetchTokenFeatures();
    
    // 获取现有对话历史
    fetchChatHistory();
  }, []);
  
  // 对话历史变化时滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  // 获取代币特性列表
  const fetchTokenFeatures = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/features`);
      if (response.data.success) {
        setTokenFeatures(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching token features:', error);
      showNotification('获取代币特性失败', 'error');
    }
  };
  
  // 获取现有对话历史
  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/history`);
      if (response.data.success) {
        setChatHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };
  
  // 发送消息到AI
  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: chatMessage
      });
      
      if (response.data.success) {
        setChatHistory(response.data.data.chatHistory);
        
        // 如果AI分析结果有效，更新代币配置
        if (response.data.data.analysisResult) {
          setTokenConfig(response.data.data.analysisResult.tokenConfig);
          // 启用部署按钮
          setDeployButtonEnabled(true);
        }
      }
      
      // 清空输入框
      setChatMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('发送消息失败', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // 重置对话
  const resetChat = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/reset`);
      
      if (response.data.success) {
        setChatHistory([]);
        setTokenConfig({
          name: '',
          symbol: '',
          decimals: 18,
          initialSupply: '1000000',
          features: [TokenFeature.BURNABLE]
        });
        setDeploymentFee(null);
        setDeployButtonEnabled(false);
        showNotification('对话已重置', 'success');
      }
    } catch (error) {
      console.error('Error resetting chat:', error);
      showNotification('重置对话失败', 'error');
    }
  };
  
  // 更新代币配置
  const updateTokenConfig = async (updatedConfig: Partial<TokenConfig>) => {
    try {
      // 合并现有配置和更新部分
      const newConfig = { ...tokenConfig, ...updatedConfig };
      setTokenConfig(newConfig);
      
      // 向后端发送更新
      await axios.post(`${API_BASE_URL}/config/update`, newConfig);
      
      // 清除现有费用估算，因为配置已更改
      setDeploymentFee(null);
    } catch (error) {
      console.error('Error updating token config:', error);
      showNotification('更新代币配置失败', 'error');
    }
  };
  
  // 切换代币特性
  const toggleFeature = (feature: TokenFeature) => {
    const features = [...tokenConfig.features || []];
    const index = features.indexOf(feature);
    
    if (index >= 0) {
      features.splice(index, 1);
    } else {
      features.push(feature);
    }
    
    updateTokenConfig({ features });
  };
  
  // 估算部署费用
  const estimateDeploymentFee = async () => {
    if (!validateTokenConfig()) {
      showNotification('请完成代币配置', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/estimate-fee`, tokenConfig);
      
      if (response.data.success) {
        setDeploymentFee(response.data.data.fee);
        showNotification('费用估算完成', 'success');
      }
    } catch (error) {
      console.error('Error estimating fee:', error);
      showNotification('估算部署费用失败', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // 验证代币配置
  const validateTokenConfig = (): boolean => {
    return (
      !!tokenConfig.name && 
      !!tokenConfig.symbol && 
      tokenConfig.symbol.length >= 2 &&
      tokenConfig.decimals >= 0 &&
      parseFloat(tokenConfig.initialSupply.toString()) > 0
    );
  };
  
  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      open: true,
      message,
      type
    });
  };
  
  // 关闭通知
  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        AI 驱动的智能合约生成器
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        通过简单对话，快速创建您的定制代币智能合约
      </Typography>
      
      <Grid container spacing={3}>
        {/* 左侧：AI对话区域 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: '80vh' 
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
              与AI对话
            </Typography>
            
            {/* 对话历史 */}
            <Box 
              ref={chatContainerRef}
              sx={{ 
                flexGrow: 1, 
                overflow: 'auto', 
                mb: 2,
                p: 2
              }}
            >
              {chatHistory.length === 0 ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="body1" align="center" gutterBottom>
                    欢迎使用AI驱动的代币生成器
                  </Typography>
                  <Typography variant="body2" align="center" paragraph>
                    请描述您想要创建的代币项目，AI将帮您生成合适的代币合约
                  </Typography>
                  <Typography variant="body2" align="center">
                    例如: "我想创建一个名为TokenXYZ的代币，用于游戏生态系统，初始供应量为100万，具有增发功能"
                  </Typography>
                </Box>
              ) : (
                chatHistory.map((msg, index) => (
                  <Box 
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        backgroundColor: msg.role === 'user' ? 'primary.light' : 'grey.100',
                        color: msg.role === 'user' ? 'white' : 'text.primary',
                        borderRadius: msg.role === 'user' 
                          ? '20px 20px 5px 20px' 
                          : '20px 20px 20px 5px'
                      }}
                    >
                      <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                        {msg.content}
                      </Typography>
                      <Typography variant="caption" color={msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ display: 'block', mt: 1 }}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
            </Box>
            
            {/* 输入区域 */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="描述您想要创建的代币..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={loading}
                multiline
                rows={2}
                sx={{ mr: 1 }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  onClick={sendMessage}
                  disabled={loading || !chatMessage.trim()}
                  sx={{ mb: 1 }}
                >
                  发送
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<RefreshIcon />}
                  onClick={resetChat}
                  disabled={loading || chatHistory.length === 0}
                >
                  重置
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* 右侧：代币配置表单 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: '80vh',
              overflow: 'auto'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
              代币配置
            </Typography>
            
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                label="代币名称"
                variant="outlined"
                value={tokenConfig.name}
                onChange={(e) => updateTokenConfig({ name: e.target.value })}
                margin="normal"
                helperText="您的代币的完整名称"
                required
              />
              
              <TextField
                fullWidth
                label="代币符号"
                variant="outlined"
                value={tokenConfig.symbol}
                onChange={(e) => updateTokenConfig({ symbol: e.target.value.toUpperCase() })}
                margin="normal"
                helperText="交易所中显示的代币简称（2-6个字符）"
                required
                inputProps={{ maxLength: 6 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="小数位数"
                    variant="outlined"
                    type="number"
                    value={tokenConfig.decimals}
                    onChange={(e) => updateTokenConfig({ decimals: parseInt(e.target.value) })}
                    margin="normal"
                    helperText="代币的小数精度，通常为18"
                    InputProps={{ inputProps: { min: 0, max: 18 } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="初始供应量"
                    variant="outlined"
                    value={tokenConfig.initialSupply}
                    onChange={(e) => updateTokenConfig({ initialSupply: e.target.value })}
                    margin="normal"
                    helperText="初始创建的代币数量"
                    required
                  />
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                代币特性
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {tokenFeatures.map((feature) => (
                  <Chip
                    key={feature.key}
                    label={feature.label}
                    color={tokenConfig.features?.includes(feature.key as TokenFeature) ? "primary" : "default"}
                    onClick={() => toggleFeature(feature.key as TokenFeature)}
                    sx={{ m: 0.5 }}
                    title={feature.description}
                  />
                ))}
              </Box>
              
              {tokenConfig.features?.includes(TokenFeature.TAX) && (
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      交易税配置
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="买入税 (%)"
                          variant="outlined"
                          type="number"
                          value={tokenConfig.metadata?.taxConfig?.buyTax || 0}
                          onChange={(e) => {
                            const taxConfig = {
                              ...(tokenConfig.metadata?.taxConfig || {}),
                              buyTax: parseInt(e.target.value)
                            };
                            updateTokenConfig({
                              metadata: {
                                ...(tokenConfig.metadata || {}),
                                taxConfig
                              }
                            });
                          }}
                          size="small"
                          InputProps={{ inputProps: { min: 0, max: 20 } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="卖出税 (%)"
                          variant="outlined"
                          type="number"
                          value={tokenConfig.metadata?.taxConfig?.sellTax || 0}
                          onChange={(e) => {
                            const taxConfig = {
                              ...(tokenConfig.metadata?.taxConfig || {}),
                              sellTax: parseInt(e.target.value)
                            };
                            updateTokenConfig({
                              metadata: {
                                ...(tokenConfig.metadata || {}),
                                taxConfig
                              }
                            });
                          }}
                          size="small"
                          InputProps={{ inputProps: { min: 0, max: 20 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={estimateDeploymentFee}
                  disabled={loading || !validateTokenConfig()}
                >
                  估算部署费用
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  disabled={!deployButtonEnabled || loading || !validateTokenConfig()}
                >
                  部署代币
                </Button>
              </Box>
              
              {deploymentFee && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    估算部署费用
                  </Typography>
                  <Typography variant="body2">
                    {deploymentFee.fee} {deploymentFee.currency} (约 ${deploymentFee.feeUSD})
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 通知 */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TokenGenerator; 