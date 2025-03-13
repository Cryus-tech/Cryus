import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Spin, Alert, Typography, Tag } from 'antd';
import { WalletOutlined, TokenOutlined, HistoryOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

interface Transaction {
  _id: string;
  transactionType: string;
  blockchain: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  amount?: number;
  createdAt: string;
}

interface TokenBalance {
  name: string;
  symbol: string;
  balance: number;
  mintAddress: string;
}

const BlockchainDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch wallet balance
        const balanceResponse = await axios.get('/api/blockchain/balance');
        
        // Fetch recent transactions
        const transactionsResponse = await axios.get('/api/blockchain/transactions?limit=5');
        
        // Fetch token balances
        const tokensResponse = await axios.get('/api/blockchain/tokens');
        
        setWalletBalance(balanceResponse.data.data.balance);
        setTransactions(transactionsResponse.data.data.transactions);
        setTokens(tokensResponse.data.data.tokens);
        setError(null);
      } catch (err) {
        console.error('Error fetching blockchain data:', err);
        setError('Failed to load blockchain data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Tag color="green">Confirmed</Tag>;
      case 'pending':
        return <Tag color="blue">Pending</Tag>;
      case 'failed':
        return <Tag color="red">Failed</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'token_mint':
        return 'Mint Tokens';
      case 'token_transfer':
        return 'Transfer Tokens';
      case 'token_burn':
        return 'Burn Tokens';
      case 'mint_creation':
        return 'Create Mint';
      case 'account_creation':
        return 'Create Account';
      case 'nft_creation':
        return 'Create NFT';
      case 'nft_transfer':
        return 'Transfer NFT';
      case 'nft_update':
        return 'Update NFT';
      default:
        return type;
    }
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'transactionType',
      key: 'type',
      render: (type: string) => getTransactionTypeDisplay(type),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => amount ? amount.toString() : '-',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record: Transaction) => (
        <Link to={`/blockchain/transactions/${record._id}`}>
          <Button type="link" icon={<ArrowRightOutlined />}>Details</Button>
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Loading blockchain data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ maxWidth: '800px', margin: '50px auto' }}
      />
    );
  }

  return (
    <div className="blockchain-dashboard">
      <Title level={2}>Blockchain Dashboard</Title>
      
      {/* Wallet Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Wallet Balance"
              value={walletBalance / 1000000000} // Convert lamports to SOL
              precision={4}
              suffix="SOL"
              prefix={<WalletOutlined style={{ marginRight: '8px' }} />}
            />
            <div style={{ marginTop: '16px' }}>
              <Link to="/blockchain/balance">
                <Button type="primary">Manage Wallet</Button>
              </Link>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Token Types"
              value={tokens.length}
              prefix={<TokenOutlined style={{ marginRight: '8px' }} />}
            />
            <div style={{ marginTop: '16px' }}>
              <Link to="/blockchain/tokens">
                <Button type="primary">Manage Tokens</Button>
              </Link>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={transactions.length}
              prefix={<HistoryOutlined style={{ marginRight: '8px' }} />}
            />
            <div style={{ marginTop: '16px' }}>
              <Link to="/blockchain/transactions">
                <Button type="primary">View All</Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Tokens */}
      <Card title="Your Tokens" style={{ marginBottom: '24px' }}>
        {tokens.length > 0 ? (
          <Row gutter={[16, 16]}>
            {tokens.map((token) => (
              <Col xs={24} sm={12} md={8} lg={6} key={token.mintAddress}>
                <Card size="small" hoverable>
                  <Statistic
                    title={`${token.name} (${token.symbol})`}
                    value={token.balance}
                    precision={2}
                    valueStyle={{ fontSize: '18px' }}
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Mint: {token.mintAddress.substring(0, 8)}...
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Text type="secondary">No tokens found</Text>
            <div style={{ marginTop: '12px' }}>
              <Link to="/blockchain/tokens/create">
                <Button type="primary">Create Token</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
      
      {/* Recent Transactions */}
      <Card title="Recent Transactions">
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="_id"
          pagination={false}
          locale={{ emptyText: 'No transactions yet' }}
        />
        {transactions.length > 0 && (
          <div style={{ textAlign: 'right', marginTop: '16px' }}>
            <Link to="/blockchain/transactions">
              <Button type="link">View All Transactions</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BlockchainDashboard; 