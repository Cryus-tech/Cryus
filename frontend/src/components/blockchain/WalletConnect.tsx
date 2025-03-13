import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Typography, Space, Spin, Dropdown, Menu, Modal, Divider, Statistic, Avatar, List, Tag } from 'antd';
import { WalletOutlined, LinkOutlined, DisconnectOutlined, ReloadOutlined, CheckCircleOutlined, CopyOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

// Import this when you have proper wallet integration
// import { useWallet } from '@solana/wallet-adapter-react';

const { Title, Text, Paragraph } = Typography;

interface WalletInfo {
  address: string;
  balance: number;
  networks: {
    name: string;
    active: boolean;
    endpoint: string;
  }[];
}

const WalletConnect: React.FC = () => {
  // States
  const [loading, setLoading] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('devnet');
  const [showNetworkModal, setShowNetworkModal] = useState<boolean>(false);
  
  // When we have proper wallet integration, use this instead of mock data
  // const wallet = useWallet();
  
  // Networks
  const networks = [
    { name: 'Mainnet', value: 'mainnet-beta', endpoint: 'https://api.mainnet-beta.solana.com' },
    { name: 'Testnet', value: 'testnet', endpoint: 'https://api.testnet.solana.com' },
    { name: 'Devnet', value: 'devnet', endpoint: 'https://api.devnet.solana.com' },
    { name: 'Localhost', value: 'localhost', endpoint: 'http://localhost:8899' },
  ];

  // Wallet providers
  const walletProviders = [
    { name: 'Phantom', icon: 'https://phantom.app/favicon.ico' },
    { name: 'Solflare', icon: 'https://solflare.com/favicon.ico' },
    { name: 'Sollet', icon: 'https://sollet.io/favicon.ico' },
    { name: 'Slope', icon: 'https://slope.finance/favicon.ico' },
  ];

  useEffect(() => {
    // For demo purposes, we're using a mock connection
    // In a real app, use the wallet adapter to detect connection status
    
    if (connected) {
      fetchWalletInfo();
    }
  }, [connected, selectedNetwork]);

  const connectWallet = async (providerName: string) => {
    try {
      setConnecting(true);
      setError(null);
      
      // In a real app, this would use the wallet adapter to connect
      // For mock demonstration, we'll simulate a connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful connection
      setConnected(true);
      
      // Create mock wallet info
      const mockWalletInfo: WalletInfo = {
        address: '5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8',
        balance: 5.23,
        networks: networks.map(network => ({
          name: network.name,
          active: network.value === selectedNetwork,
          endpoint: network.endpoint,
        })),
      };
      
      setWalletInfo(mockWalletInfo);
      
      // Store connection in local storage for persistence
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('selectedNetwork', selectedNetwork);
      
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setLoading(true);
      
      // In a real app, use the wallet adapter to disconnect
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setConnected(false);
      setWalletInfo(null);
      
      // Clear from local storage
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('selectedNetwork');
      
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would fetch real data from the blockchain
      // For mock demonstration, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with mock data
      const updatedWalletInfo = {
        ...walletInfo!,
        balance: Math.random() * 10,
        networks: networks.map(network => ({
          name: network.name,
          active: network.value === selectedNetwork,
          endpoint: network.endpoint,
        })),
      };
      
      setWalletInfo(updatedWalletInfo);
      setError(null);
    } catch (err) {
      console.error('Error fetching wallet info:', err);
      setError('Failed to fetch wallet information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmNetworkChange = (network: string) => {
    Modal.confirm({
      title: 'Change Network',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to change to ${networks.find(n => n.value === network)?.name}?`,
      onOk() {
        setSelectedNetwork(network);
      },
    });
  };

  const copyAddress = () => {
    if (walletInfo) {
      navigator.clipboard.writeText(walletInfo.address);
      message.success('Address copied to clipboard!');
    }
  };

  const openNetworkModal = () => {
    setShowNetworkModal(true);
  };

  const handleNetworkSelect = (network: string) => {
    confirmNetworkChange(network);
    setShowNetworkModal(false);
  };

  if (connecting) {
    return (
      <Card className="wallet-connect-card" style={{ textAlign: 'center', padding: '30px' }}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: '20px' }}>Connecting to Wallet</Title>
        <Text type="secondary">Please approve the connection request in your wallet...</Text>
      </Card>
    );
  }

  if (!connected) {
    return (
      <Card className="wallet-connect-card">
        <Title level={3}>Connect Wallet</Title>
        <Paragraph>Connect your Solana wallet to access blockchain features.</Paragraph>
        
        {error && (
          <Alert 
            message="Connection Error" 
            description={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: '16px' }} 
          />
        )}
        
        <List
          itemLayout="horizontal"
          dataSource={walletProviders}
          renderItem={provider => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={provider.icon} />}
                title={provider.name}
                description={`Connect to ${provider.name} wallet`}
              />
              <Button 
                type="primary" 
                icon={<LinkOutlined />} 
                onClick={() => connectWallet(provider.name)}
                loading={connecting}
              >
                Connect
              </Button>
            </List.Item>
          )}
        />
        
        <Divider />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">Network:</Text>
          <Dropdown 
            overlay={
              <Menu>
                {networks.map(network => (
                  <Menu.Item key={network.value} onClick={() => setSelectedNetwork(network.value)}>
                    {network.name}
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <Button>
              {networks.find(n => n.value === selectedNetwork)?.name} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </Card>
    );
  }

  return (
    <Card className="wallet-connect-card" loading={loading}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={3}>Wallet</Title>
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchWalletInfo} 
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            icon={<DisconnectOutlined />} 
            onClick={disconnectWallet} 
            danger
          >
            Disconnect
          </Button>
        </Space>
      </div>
      
      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: '16px' }} 
        />
      )}
      
      <Card style={{ marginBottom: '16px' }}>
        <Statistic
          title="SOL Balance"
          value={walletInfo?.balance || 0}
          precision={4}
          valueStyle={{ color: '#3f8600' }}
          prefix={<WalletOutlined />}
          suffix="SOL"
        />
      </Card>
      
      <Card 
        title="Wallet Address" 
        extra={
          <Button 
            icon={<CopyOutlined />} 
            onClick={copyAddress} 
            size="small"
          >
            Copy
          </Button>
        }
        style={{ marginBottom: '16px' }}
      >
        <Paragraph 
          ellipsis={{ rows: 1, expandable: true, symbol: 'more' }}
          style={{ fontFamily: 'monospace' }}
        >
          {walletInfo?.address}
        </Paragraph>
      </Card>
      
      <Card 
        title="Network" 
        extra={
          <Button 
            type="link" 
            onClick={openNetworkModal}
          >
            Change
          </Button>
        }
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
          <div>
            <div>{networks.find(n => n.value === selectedNetwork)?.name}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {networks.find(n => n.value === selectedNetwork)?.endpoint}
            </Text>
          </div>
        </div>
      </Card>
      
      <Modal
        title="Select Network"
        open={showNetworkModal}
        footer={null}
        onCancel={() => setShowNetworkModal(false)}
      >
        <List
          itemLayout="horizontal"
          dataSource={networks}
          renderItem={network => (
            <List.Item 
              actions={[
                network.value === selectedNetwork ? (
                  <Tag color="success">Active</Tag>
                ) : (
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={() => handleNetworkSelect(network.value)}
                  >
                    Select
                  </Button>
                )
              ]}
            >
              <List.Item.Meta
                title={network.name}
                description={network.endpoint}
              />
            </List.Item>
          )}
        />
      </Modal>
    </Card>
  );
};

export default WalletConnect; 