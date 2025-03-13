import BlockchainAPI from './blockchain';

// 将来可以添加更多API服务，如用户服务、认证服务等

export {
  BlockchainAPI,
};

// 导出默认API组合
export default {
  blockchain: BlockchainAPI,
}; 