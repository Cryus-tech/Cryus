import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Statistic, Switch, Button, Space, Collapse, Badge, Tabs, Row, Col, Tooltip, Modal, Tag, Form, Input, InputNumber, Select } from 'antd';
import { ExclamationCircleOutlined, BellOutlined, SettingOutlined, CaretUpOutlined, CaretDownOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

interface RiskAlert {
  id: string;
  type: 'price' | 'volatility' | 'marketCap' | 'volume' | 'correlation' | 'custom';
  asset: string;
  condition: 'above' | 'below' | 'increase' | 'decrease';
  threshold: number;
  status: 'active' | 'triggered' | 'disabled';
  createdAt: string;
  triggeredAt?: string;
  priority: 'high' | 'medium' | 'low';
}

interface RiskIndicator {
  id: string;
  name: string;
  value: number;
  change: number;
  status: 'normal' | 'warning' | 'danger';
  description: string;
}

const RiskMonitor: React.FC = () => {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [indicators, setIndicators] = useState<RiskIndicator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addAlertVisible, setAddAlertVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  
  useEffect(() => {
    fetchRiskData();
  }, []);
  
  const fetchRiskData = async () => {
    setTimeout(() => {
      // Mock data loading
      const mockAlerts: RiskAlert[] = [
        {
          id: '1',
          type: 'price',
          asset: 'SOL',
          condition: 'below',
          threshold: 90,
          status: 'active',
          createdAt: '2023-05-20T14:22:00Z',
          priority: 'high'
        },
        {
          id: '2',
          type: 'volatility',
          asset: 'BTC',
          condition: 'above',
          threshold: 5,
          status: 'triggered',
          createdAt: '2023-05-15T10:30:00Z',
          triggeredAt: '2023-06-01T08:15:00Z',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'price',
          asset: 'ETH',
          condition: 'above',
          threshold: 2000,
          status: 'active',
          createdAt: '2023-06-10T09:45:00Z',
          priority: 'low'
        },
        {
          id: '4',
          type: 'volume',
          asset: 'SOL',
          condition: 'decrease',
          threshold: 30,
          status: 'disabled',
          createdAt: '2023-05-10T11:20:00Z',
          priority: 'medium'
        },
      ];
      
      const mockIndicators: RiskIndicator[] = [
        {
          id: '1',
          name: 'Market Fear Index',
          value: 65,
          change: 15,
          status: 'warning',
          description: 'Composite indicator based on market sentiment and volatility'
        },
        {
          id: '2',
          name: 'Liquidity Risk',
          value: 30,
          change: -5,
          status: 'normal',
          description: 'Assessment of liquidity based on trading volume and spread'
        },
        {
          id: '3',
          name: 'Price Crash Probability',
          value: 18,
          change: 3,
          status: 'normal',
          description: 'Probability of crash based on technical indicators and market conditions'
        },
        {
          id: '4',
          name: 'Portfolio Correlation',
          value: 78,
          change: 12,
          status: 'danger',
          description: 'Degree of correlation between assets in portfolio'
        },
        {
          id: '5',
          name: 'Market Manipulation Indicator',
          value: 42,
          change: 7,
          status: 'warning',
          description: 'Indicator that detects unusual market activity'
        },
      ];
      
      setAlerts(mockAlerts);
      setIndicators(mockIndicators);
      setLoading(false);
    }, 1000);
  };
  
  const handleToggleAlert = (id: string, enabled: boolean) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, status: enabled ? 'active' : 'disabled' } : alert
    );
    setAlerts(updatedAlerts);
  };
  
  const handleDeleteAlert = (id: string) => {
    Modal.confirm({
      title: 'Delete Risk Alert',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this risk alert? This action cannot be undone.',
      onOk() {
        setAlerts(alerts.filter(alert => alert.id !== id));
      }
    });
  };
  
  const handleAddAlert = () => {
    form.resetFields();
    setAddAlertVisible(true);
  };
  
  const handleSaveAlert = (values: any) => {
    const newAlert: RiskAlert = {
      id: `${Date.now()}`,
      type: values.type,
      asset: values.asset,
      condition: values.condition,
      threshold: values.threshold,
      status: 'active',
      createdAt: new Date().toISOString(),
      priority: values.priority
    };
    
    setAlerts([...alerts, newAlert]);
    setAddAlertVisible(false);
  };
  
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">Active</Tag>;
      case 'triggered':
        return <Tag color="red">Triggered</Tag>;
      case 'disabled':
        return <Tag color="default">Disabled</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };
  
  const getPriorityTag = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Tag color="red">High</Tag>;
      case 'medium':
        return <Tag color="orange">Medium</Tag>;
      case 'low':
        return <Tag color="blue">Low</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };
  
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'normal':
        return { color: '#52c41a', text: 'Normal' };
      case 'warning':
        return { color: '#faad14', text: 'Warning' };
      case 'danger':
        return { color: '#f5222d', text: 'Danger' };
      default:
        return { color: '#1890ff', text: 'Unknown' };
    }
  };
  
  const formatCondition = (alert: RiskAlert) => {
    const conditions: Record<string, string> = {
      'above': 'above',
      'below': 'below',
      'increase': 'increases by',
      'decrease': 'decreases by'
    };
    
    return `${alert.asset} ${conditions[alert.condition]} ${alert.threshold}${alert.condition === 'increase' || alert.condition === 'decrease' ? '%' : ''}`;
  };
  
  const alertColumns = [
    {
      title: 'Asset',
      dataIndex: 'asset',
      key: 'asset',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const types: Record<string, string> = {
          'price': 'Price',
          'volatility': 'Volatility',
          'marketCap': 'Market Cap',
          'volume': 'Volume',
          'correlation': 'Correlation',
          'custom': 'Custom'
        };
        return types[type] || type;
      }
    },
    {
      title: 'Condition',
      key: 'condition',
      render: (text: string, record: RiskAlert) => formatCondition(record)
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text: string, record: RiskAlert) => (
        <Space size="small">
          <Switch 
            checked={record.status === 'active'} 
            onChange={(checked) => handleToggleAlert(record.id, checked)}
            disabled={record.status === 'triggered'}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => handleDeleteAlert(record.id)}
          />
        </Space>
      )
    }
  ];
  
  return (
    <div className="risk-monitor">
      <Tabs defaultActiveKey="alerts">
        <TabPane 
          tab={
            <span>
              Risk Alerts <Badge count={alerts.filter(a => a.status === 'triggered').length} />
            </span>
          } 
          key="alerts"
        >
          <Card 
            title="Risk Alert Configuration"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddAlert}
              >
                Add Alert
              </Button>
            }
          >
            {alerts.filter(a => a.status === 'triggered').length > 0 && (
              <Alert
                message={`${alerts.filter(a => a.status === 'triggered').length} risk alerts triggered`}
                description="Potential risk conditions detected. Review details and take appropriate action."
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            )}
            
            <Table 
              dataSource={alerts} 
              columns={alertColumns} 
              rowKey="id"
              loading={loading}
            />
          </Card>
          
          <Modal
            title="Add Risk Alert"
            visible={addAlertVisible}
            onCancel={() => setAddAlertVisible(false)}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveAlert}
            >
              <Form.Item
                name="type"
                label="Alert Type"
                rules={[{ required: true, message: 'Please select an alert type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="price">Price</Option>
                  <Option value="volatility">Volatility</Option>
                  <Option value="marketCap">Market Cap</Option>
                  <Option value="volume">Volume</Option>
                  <Option value="correlation">Correlation</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="asset"
                label="Asset"
                rules={[{ required: true, message: 'Please enter asset name or symbol' }]}
              >
                <Input placeholder="e.g. SOL, BTC, ETH" />
              </Form.Item>
              
              <Form.Item
                name="condition"
                label="Condition"
                rules={[{ required: true, message: 'Please select a condition' }]}
              >
                <Select placeholder="Select condition">
                  <Option value="above">Above</Option>
                  <Option value="below">Below</Option>
                  <Option value="increase">Increase By</Option>
                  <Option value="decrease">Decrease By</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="threshold"
                label="Threshold"
                rules={[{ required: true, message: 'Please enter a threshold value' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="e.g. 100"
                  min={0}
                  step={0.01}
                />
              </Form.Item>
              
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select a priority' }]}
                initialValue="medium"
              >
                <Select placeholder="Select priority">
                  <Option value="high">High</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="low">Low</Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Save Alert
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </TabPane>
        
        <TabPane tab="Risk Indicators" key="indicators">
          <Card title="Market Risk Indicators">
            <Row gutter={[16, 16]}>
              {indicators.map(indicator => {
                const status = getStatusIndicator(indicator.status);
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={indicator.id}>
                    <Card>
                      <Statistic
                        title={
                          <Tooltip title={indicator.description}>
                            <span>{indicator.name}</span>
                          </Tooltip>
                        }
                        value={indicator.value}
                        valueStyle={{ color: status.color }}
                        prefix={<Badge color={status.color} />}
                        suffix={`(${status.text})`}
                      />
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ 
                          color: indicator.change > 0 ? '#f5222d' : '#52c41a',
                          marginRight: '8px'
                        }}>
                          {indicator.change > 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
                          {Math.abs(indicator.change)}%
                        </span>
                        <span style={{ fontSize: '12px', color: '#888' }}>
                          Change from last week
                        </span>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>
          
          <Card title="Risk Assessment Report" style={{ marginTop: '16px' }}>
            <Collapse defaultActiveKey={['1']}>
              <Panel header="Market Risk Summary" key="1">
                <p>
                  The market is currently in a {getStatusIndicator(
                    indicators.reduce((max, i) => 
                      i.status === 'danger' ? 'danger' : 
                      max === 'danger' ? 'danger' : 
                      i.status === 'warning' ? 'warning' : max, 
                      'normal'
                    )
                  ).text} state, with primary risks coming from:
                </p>
                <ul>
                  {indicators.filter(i => i.status !== 'normal').map(i => (
                    <li key={i.id}>
                      <strong>{i.name}:</strong> {i.value} 
                      <span style={{ 
                        color: i.change > 0 ? '#f5222d' : '#52c41a',
                        marginLeft: '8px'
                      }}>
                        ({i.change > 0 ? '+' : ''}{i.change}%)
                      </span>
                      <p style={{ color: '#888', marginTop: '4px' }}>{i.description}</p>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel header="Recommended Actions" key="2">
                <ul>
                  {indicators.some(i => i.status === 'danger') && (
                    <li>
                      <Alert
                        message="High Risk Warning"
                        description="Consider reducing exposure to high-risk assets and increasing stablecoin allocation."
                        type="error"
                        showIcon
                        style={{ marginBottom: '8px' }}
                      />
                    </li>
                  )}
                  
                  {indicators.some(i => i.name === 'Market Fear Index' && i.status !== 'normal') && (
                    <li>
                      <Alert
                        message="Market Sentiment Volatility"
                        description="Market sentiment is unstable. Avoid emotional decisions and stick to long-term investment strategy."
                        type="warning"
                        showIcon
                        style={{ marginBottom: '8px' }}
                      />
                    </li>
                  )}
                  
                  {indicators.some(i => i.name === 'Portfolio Correlation' && i.status !== 'normal') && (
                    <li>
                      <Alert
                        message="High Portfolio Correlation"
                        description="Your assets have high correlation. Consider adding uncorrelated asset classes to diversify risk."
                        type="warning"
                        showIcon
                        style={{ marginBottom: '8px' }}
                      />
                    </li>
                  )}
                  
                  <li>
                    <Alert
                      message="Regular Monitoring"
                      description="Continue monitoring risk indicators and adjust investment strategy based on alerts."
                      type="info"
                      showIcon
                    />
                  </li>
                </ul>
              </Panel>
            </Collapse>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RiskMonitor; 