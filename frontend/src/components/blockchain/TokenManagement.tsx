import React, { useState, useEffect } from 'react';
import { Tabs, Card, Form, Input, Button, InputNumber, Select, Table, message, Spin, Alert, Modal, Typography, Space } from 'antd';
import { PlusOutlined, SendOutlined, FireOutlined, CopyOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;
const { Option } = Select;
const { Title, Text } = Typography;

interface Token {
  name: string;
  symbol: string;
  decimals: number;
  mintAddress: string;
  tokenAccounts: TokenAccount[];
}

interface TokenAccount {
  address: string;
  balance: number;
  owner: string;
}

const TokenManagement: React.FC = () => {
  const [createForm] = Form.useForm();
  const [mintForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [burnForm] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/blockchain/tokens');
      setTokens(response.data.data.tokens);
      setError(null);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Failed to load tokens. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async (values: any) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/api/blockchain/token/mint', {
        name: values.name,
        symbol: values.symbol,
        decimals: values.decimals || 9,
      });

      message.success('Token created successfully!');
      createForm.resetFields();
      fetchTokens();
      
      // Show token details in modal
      Modal.success({
        title: 'Token Created Successfully',
        content: (
          <div>
            <p>Your token has been created with the following details:</p>
            <p><strong>Mint Address:</strong> {response.data.data.mintAddress}</p>
            <p><strong>Transaction Signature:</strong> {response.data.data.signature}</p>
            <p>You can now create token accounts and mint tokens.</p>
          </div>
        ),
      });
    } catch (err) {
      console.error('Error creating token:', err);
      message.error('Failed to create token. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!selectedToken) {
      message.error('Please select a token');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post('/api/blockchain/token/account', {
        mintAddress: selectedToken
      });

      message.success('Token account created successfully!');
      fetchTokens();
      
      // Show account details in modal
      Modal.success({
        title: 'Token Account Created',
        content: (
          <div>
            <p>Your token account has been created:</p>
            <p><strong>Account Address:</strong> {response.data.data.tokenAccountAddress}</p>
            <p><strong>Transaction Signature:</strong> {response.data.data.signature}</p>
          </div>
        ),
      });
    } catch (err) {
      console.error('Error creating token account:', err);
      message.error('Failed to create token account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMintTokens = async (values: any) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/api/blockchain/token/mint-tokens', {
        mintAddress: values.tokenMint,
        destinationAddress: values.destination,
        amount: values.amount,
      });

      message.success('Tokens minted successfully!');
      mintForm.resetFields();
      fetchTokens();
    } catch (err) {
      console.error('Error minting tokens:', err);
      message.error('Failed to mint tokens. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransferTokens = async (values: any) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/api/blockchain/token/transfer', {
        sourceAddress: values.source,
        destinationAddress: values.destination,
        amount: values.amount,
      });

      message.success('Tokens transferred successfully!');
      transferForm.resetFields();
      fetchTokens();
    } catch (err) {
      console.error('Error transferring tokens:', err);
      message.error('Failed to transfer tokens. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBurnTokens = async (values: any) => {
    try {
      setSubmitting(true);
      const response = await axios.post('/api/blockchain/token/burn', {
        tokenAccountAddress: values.tokenAccount,
        mintAddress: values.tokenMint,
        amount: values.amount,
      });

      message.success('Tokens burned successfully!');
      burnForm.resetFields();
      fetchTokens();
    } catch (err) {
      console.error('Error burning tokens:', err);
      message.error('Failed to burn tokens. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const tokenColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Decimals',
      dataIndex: 'decimals',
      key: 'decimals',
    },
    {
      title: 'Mint Address',
      dataIndex: 'mintAddress',
      key: 'mintAddress',
      render: (text: string) => (
        <Space>
          <Text ellipsis style={{ maxWidth: 200 }}>{text}</Text>
          <Button 
            type="text" 
            icon={<CopyOutlined />} 
            onClick={() => copyToClipboard(text)}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: 'Token Accounts',
      dataIndex: 'tokenAccounts',
      key: 'tokenAccounts',
      render: (accounts: TokenAccount[]) => accounts ? accounts.length : 0,
    },
  ];

  const accountColumns = [
    {
      title: 'Account Address',
      dataIndex: 'address',
      key: 'address',
      render: (text: string) => (
        <Space>
          <Text ellipsis style={{ maxWidth: 200 }}>{text}</Text>
          <Button 
            type="text" 
            icon={<CopyOutlined />} 
            onClick={() => copyToClipboard(text)}
            size="small"
          />
        </Space>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      render: (text: string) => (
        <Text ellipsis style={{ maxWidth: 150 }}>{text}</Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Loading token data...</p>
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
    <div className="token-management">
      <Title level={2}>Token Management</Title>
      
      <Tabs defaultActiveKey="tokens">
        <TabPane tab="Your Tokens" key="tokens">
          <Card title="Token List" style={{ marginBottom: '24px' }}>
            <Table 
              dataSource={tokens} 
              columns={tokenColumns} 
              rowKey="mintAddress"
              expandable={{
                expandedRowRender: record => (
                  <div>
                    <Title level={5}>Token Accounts</Title>
                    <Table
                      dataSource={record.tokenAccounts}
                      columns={accountColumns}
                      rowKey="address"
                      pagination={false}
                    />
                  </div>
                ),
              }}
            />
          </Card>
        </TabPane>
        
        <TabPane tab="Create Token" key="create">
          <Card title="Create New Token">
            <Form
              form={createForm}
              layout="vertical"
              onFinish={handleCreateToken}
            >
              <Form.Item
                name="name"
                label="Token Name"
                rules={[{ required: true, message: 'Please enter token name' }]}
              >
                <Input placeholder="e.g., My Token" />
              </Form.Item>
              
              <Form.Item
                name="symbol"
                label="Token Symbol"
                rules={[{ required: true, message: 'Please enter token symbol' }]}
              >
                <Input placeholder="e.g., MTK" />
              </Form.Item>
              
              <Form.Item
                name="decimals"
                label="Decimals"
                initialValue={9}
                rules={[{ required: true, message: 'Please enter decimals' }]}
              >
                <InputNumber min={0} max={9} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  icon={<PlusOutlined />}
                >
                  Create Token
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Create Account" key="account">
          <Card title="Create Token Account">
            <Form layout="vertical">
              <Form.Item
                label="Select Token"
                rules={[{ required: true, message: 'Please select a token' }]}
              >
                <Select
                  placeholder="Select a token"
                  value={selectedToken}
                  onChange={(value) => setSelectedToken(value)}
                  style={{ width: '100%' }}
                >
                  {tokens.map(token => (
                    <Option key={token.mintAddress} value={token.mintAddress}>
                      {token.name} ({token.symbol})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  onClick={handleCreateAccount} 
                  loading={submitting}
                  icon={<PlusOutlined />}
                >
                  Create Token Account
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Mint Tokens" key="mint">
          <Card title="Mint Tokens">
            <Form
              form={mintForm}
              layout="vertical"
              onFinish={handleMintTokens}
            >
              <Form.Item
                name="tokenMint"
                label="Token Mint"
                rules={[{ required: true, message: 'Please select a token mint' }]}
              >
                <Select placeholder="Select token mint">
                  {tokens.map(token => (
                    <Option key={token.mintAddress} value={token.mintAddress}>
                      {token.name} ({token.symbol})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="destination"
                label="Destination Account"
                rules={[{ required: true, message: 'Please enter destination account' }]}
              >
                <Input placeholder="Token account address" />
              </Form.Item>
              
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  icon={<PlusOutlined />}
                >
                  Mint Tokens
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Transfer" key="transfer">
          <Card title="Transfer Tokens">
            <Form
              form={transferForm}
              layout="vertical"
              onFinish={handleTransferTokens}
            >
              <Form.Item
                name="source"
                label="Source Account"
                rules={[{ required: true, message: 'Please enter source account' }]}
              >
                <Input placeholder="Source token account address" />
              </Form.Item>
              
              <Form.Item
                name="destination"
                label="Destination Account"
                rules={[{ required: true, message: 'Please enter destination account' }]}
              >
                <Input placeholder="Destination token account address" />
              </Form.Item>
              
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  icon={<SendOutlined />}
                >
                  Transfer Tokens
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane tab="Burn" key="burn">
          <Card title="Burn Tokens">
            <Form
              form={burnForm}
              layout="vertical"
              onFinish={handleBurnTokens}
            >
              <Form.Item
                name="tokenMint"
                label="Token Mint"
                rules={[{ required: true, message: 'Please select a token mint' }]}
              >
                <Select placeholder="Select token mint">
                  {tokens.map(token => (
                    <Option key={token.mintAddress} value={token.mintAddress}>
                      {token.name} ({token.symbol})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="tokenAccount"
                label="Token Account"
                rules={[{ required: true, message: 'Please enter token account' }]}
              >
                <Input placeholder="Token account address" />
              </Form.Item>
              
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  danger
                  htmlType="submit" 
                  loading={submitting}
                  icon={<FireOutlined />}
                >
                  Burn Tokens
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TokenManagement; 