import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  BlockchainDashboard,
  TokenManagement, 
  NFTManagement,
  TransactionHistory,
  WalletConnect,
  RiskManagement,
  AlgorithmicTrading,
  StrategyBuilder,
  StrategyManager
} from '../components/blockchain';

const BlockchainRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BlockchainDashboard />} />
      <Route path="/tokens" element={<TokenManagement />} />
      <Route path="/nft" element={<NFTManagement />} />
      <Route path="/transactions" element={<TransactionHistory />} />
      <Route path="/wallet" element={<WalletConnect />} />
      
      {/* Risk Management Routes */}
      <Route path="/risk" element={<RiskManagement />} />
      
      {/* Algorithmic Trading Routes */}
      <Route path="/trading" element={<AlgorithmicTrading />} />
      <Route path="/trading/builder" element={<StrategyBuilder />} />
      <Route path="/trading/manager" element={<StrategyManager />} />
    </Routes>
  );
};

export default BlockchainRoutes; 