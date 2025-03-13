import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import BlockchainDashboard from '../components/blockchain/Dashboard';
import TokenManagement from '../components/blockchain/TokenManagement';
import NFTManagement from '../components/blockchain/NFTManagement';
import TransactionHistory from '../components/blockchain/TransactionHistory';
import WalletConnect from '../components/blockchain/WalletConnect';
import WhitepaperGeneration from '../components/whitepaper/WhitepaperGeneration';
import WhitepaperList from '../components/whitepaper/WhitepaperList';
import WhitepaperView from '../components/whitepaper/WhitepaperView';
import TokenomicsGeneration from '../components/tokenomics/TokenomicsGeneration';
import TokenomicsList from '../components/tokenomics/TokenomicsList';
import TokenomicsView from '../components/tokenomics/TokenomicsView';
import DappGeneration from '../components/dapp/DappGeneration';
import DappList from '../components/dapp/DappList';
import DappView from '../components/dapp/DappView';
import ContractGeneration from '../components/contract/ContractGeneration';
import ContractList from '../components/contract/ContractList';
import ContractView from '../components/contract/ContractView';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import PrivateRoute from './PrivateRoute';
import NotFound from '../components/common/NotFound';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private Routes */}
      <Route path="/" element={<PrivateRoute />}>
        <Route index element={<Dashboard />} />
        
        {/* Blockchain Routes */}
        <Route path="blockchain" element={<Navigate to="/blockchain/dashboard" replace />} />
        <Route path="blockchain/dashboard" element={<BlockchainDashboard />} />
        <Route path="blockchain/wallet" element={<WalletConnect />} />
        <Route path="blockchain/tokens" element={<TokenManagement />} />
        <Route path="blockchain/nfts" element={<NFTManagement />} />
        <Route path="blockchain/transactions" element={<TransactionHistory />} />
        <Route path="blockchain/transactions/:id" element={<TransactionHistory singleTransaction={true} />} />
        
        {/* Whitepaper Routes */}
        <Route path="whitepaper" element={<Navigate to="/whitepaper/list" replace />} />
        <Route path="whitepaper/generate" element={<WhitepaperGeneration />} />
        <Route path="whitepaper/list" element={<WhitepaperList />} />
        <Route path="whitepaper/:id" element={<WhitepaperView />} />
        
        {/* Tokenomics Routes */}
        <Route path="tokenomics" element={<Navigate to="/tokenomics/list" replace />} />
        <Route path="tokenomics/generate" element={<TokenomicsGeneration />} />
        <Route path="tokenomics/list" element={<TokenomicsList />} />
        <Route path="tokenomics/:id" element={<TokenomicsView />} />
        
        {/* Dapp Routes */}
        <Route path="dapp" element={<Navigate to="/dapp/list" replace />} />
        <Route path="dapp/generate" element={<DappGeneration />} />
        <Route path="dapp/list" element={<DappList />} />
        <Route path="dapp/:id" element={<DappView />} />
        
        {/* Contract Routes */}
        <Route path="contract" element={<Navigate to="/contract/list" replace />} />
        <Route path="contract/generate" element={<ContractGeneration />} />
        <Route path="contract/list" element={<ContractList />} />
        <Route path="contract/:id" element={<ContractView />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes; 