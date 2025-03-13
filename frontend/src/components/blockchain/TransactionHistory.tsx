import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spin, Alert, Typography, Tag, Space, Modal, Descriptions, Divider, Input, Row, Col, Select, DatePicker, Pagination } from 'antd';
import { SearchOutlined, ReloadOutlined, FieldTimeOutlined, CopyOutlined, InfoCircleOutlined, FilterOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Transaction {
  _id: string;
  transactionType: string;
  blockchain: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  addresses: {
    source?: string;
    destination?: string;
    mint?: string;
    token?: string;
    nft?: string;
  };
  amount?: number;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

interface TransactionHistoryProps {
  singleTransaction?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ singleTransaction = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    type: undefined,
    status: undefined,
    dateRange: undefined,
    searchTerm: '',
  });
  
  useEffect(() => {
    if (singleTransaction && id) {
      fetchTransactionDetail(id);
    } else {
      fetchTransactions(pagination.current, pagination.pageSize);
    }
  }, [singleTransaction, id, pagination.current, pagination.pageSize]);

  const fetchTransactions = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = `?page=${page}&limit=${limit}`;
      if (filters.type) queryParams += `&type=${filters.type}`;
      if (filters.status) queryParams += `&status=${filters.status}`;
      if (filters.searchTerm) queryParams += `&search=${filters.searchTerm}`;
      if (filters.dateRange && filters.dateRange.length === 2) {
        queryParams += `&startDate=${filters.dateRange[0].toISOString()}&endDate=${filters.dateRange[1].toISOString()}`;
      }
      
      const response = await axios.get(`/api/blockchain/transactions${queryParams}`);
      
      setTransactions(response.data.data.transactions);
      setPagination({
        ...pagination,
        current: page,
        total: response.data.data.pagination.total,
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionDetail = async (transactionId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/blockchain/transactions/${transactionId}`);
      setTransaction(response.data.data.transaction);
      setError(null);
    } catch (err) {
      console.error('Error fetching transaction details:', err);
      setError('Failed to load transaction details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (current: number, pageSize: number) => {
    setPagination({ ...pagination, current, pageSize });
  };

  const applyFilters = () => {
    setPagination({ ...pagination, current: 1 }); // Reset to first page
    fetchTransactions(1, pagination.pageSize);
  };

  const resetFilters = () => {
    setFilters({
      type: undefined,
      status: undefined,
      dateRange: undefined,
      searchTerm: '',
    });
    setPagination({ ...pagination, current: 1 }); // Reset to first page
    fetchTransactions(1, pagination.pageSize);
  };

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

  const formatDatetime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const viewTransactionDetails = (id: string) => {
    navigate(`/blockchain/transactions/${id}`);
  };

  const getAddressesDisplay = (addresses: any) => {
    return (
      <div>
        {addresses.source && (
          <div style={{ marginBottom: '4px' }}>
            <Text strong>Source: </Text>
            <Text style={{ wordBreak: 'break-all' }} copyable>{addresses.source}</Text>
          </div>
        )}
        
        {addresses.destination && (
          <div style={{ marginBottom: '4px' }}>
            <Text strong>Destination: </Text>
            <Text style={{ wordBreak: 'break-all' }} copyable>{addresses.destination}</Text>
          </div>
        )}
        
        {addresses.mint && (
          <div style={{ marginBottom: '4px' }}>
            <Text strong>Mint: </Text>
            <Text style={{ wordBreak: 'break-all' }} copyable>{addresses.mint}</Text>
          </div>
        )}
        
        {addresses.token && (
          <div style={{ marginBottom: '4px' }}>
            <Text strong>Token: </Text>
            <Text style={{ wordBreak: 'break-all' }} copyable>{addresses.token}</Text>
          </div>
        )}
        
        {addresses.nft && (
          <div style={{ marginBottom: '4px' }}>
            <Text strong>NFT: </Text>
            <Text style={{ wordBreak: 'break-all' }} copyable>{addresses.nft}</Text>
          </div>
        )}
      </div>
    );
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
      title: 'Hash',
      dataIndex: 'txHash',
      key: 'txHash',
      render: (hash: string) => (
        <Space>
          <Text ellipsis style={{ maxWidth: 150 }}>{hash}</Text>
          {hash && (
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              onClick={() => copyToClipboard(hash)}
              size="small"
            />
          )}
        </Space>
      ),
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
      render: (date: string) => formatDatetime(date),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record: Transaction) => (
        <Button 
          type="link" 
          icon={<InfoCircleOutlined />}
          onClick={() => viewTransactionDetails(record._id)}
        >
          Details
        </Button>
      ),
    },
  ];

  if (loading && (!transactions.length || !transaction)) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '20px' }}>Loading transaction data...</p>
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

  if (singleTransaction && transaction) {
    return (
      <div className="transaction-detail">
        <Title level={2}>Transaction Details</Title>
        
        <Card style={{ marginBottom: '24px' }}>
          <Descriptions 
            bordered 
            column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
            title={
              <Space>
                {getTransactionTypeDisplay(transaction.transactionType)}
                {getStatusTag(transaction.status)}
              </Space>
            }
          >
            <Descriptions.Item label="Transaction ID" span={3}>
              <Space>
                <Text copyable>{transaction._id}</Text>
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Blockchain" span={3}>
              {transaction.blockchain}
            </Descriptions.Item>
            
            {transaction.txHash && (
              <Descriptions.Item label="Transaction Hash" span={3}>
                <Space>
                  <Text copyable>{transaction.txHash}</Text>
                </Space>
              </Descriptions.Item>
            )}
            
            {transaction.amount !== undefined && (
              <Descriptions.Item label="Amount">
                {transaction.amount}
              </Descriptions.Item>
            )}
            
            <Descriptions.Item label="Created At">
              {formatDatetime(transaction.createdAt)}
            </Descriptions.Item>
            
            <Descriptions.Item label="Updated At">
              {formatDatetime(transaction.updatedAt)}
            </Descriptions.Item>
          </Descriptions>
          
          <Divider orientation="left">Addresses</Divider>
          
          {transaction.addresses && Object.keys(transaction.addresses).some(key => !!transaction.addresses[key]) ? (
            getAddressesDisplay(transaction.addresses)
          ) : (
            <Text type="secondary">No address information available</Text>
          )}
          
          {transaction.error && (
            <>
              <Divider orientation="left">Error</Divider>
              <Alert message={transaction.error} type="error" />
            </>
          )}
          
          {transaction.data && Object.keys(transaction.data).length > 0 && (
            <>
              <Divider orientation="left">Additional Data</Divider>
              <pre style={{ background: '#f6f8fa', padding: '12px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(transaction.data, null, 2)}
              </pre>
            </>
          )}
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button onClick={() => navigate('/blockchain/transactions')}>
              Back to Transactions
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <Title level={2}>Transaction History</Title>
      
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Input
              placeholder="Search by hash, address..."
              prefix={<SearchOutlined />}
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              onPressEnter={applyFilters}
            />
          </Col>
          
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Transaction Type"
              allowClear
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Option value="token_mint">Mint Tokens</Option>
              <Option value="token_transfer">Transfer Tokens</Option>
              <Option value="token_burn">Burn Tokens</Option>
              <Option value="mint_creation">Create Mint</Option>
              <Option value="account_creation">Create Account</Option>
              <Option value="nft_creation">Create NFT</Option>
              <Option value="nft_transfer">Transfer NFT</Option>
              <Option value="nft_update">Update NFT</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} lg={4}>
            <Select
              placeholder="Status"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="pending">Pending</Option>
              <Option value="confirmed">Confirmed</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} lg={4}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates, dateStrings) => {
                setFilters({ ...filters, dateRange: dates as any });
              }}
              value={filters.dateRange}
            />
          </Col>
          
          <Col xs={24} sm={24} lg={4} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={applyFilters}
              >
                Filter
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={resetFilters}
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
      
      <Card>
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="_id"
          pagination={false}
          loading={loading}
          locale={{ emptyText: 'No transactions found' }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page, pageSize) => handleTableChange(page, pageSize || 10)}
            showQuickJumper
            showSizeChanger
            showTotal={(total) => `Total ${total} items`}
          />
        </div>
      </Card>
    </div>
  );
};

export default TransactionHistory; 