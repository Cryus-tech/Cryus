import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Tooltip, Modal, Statistic, Row, Col, Alert, Switch, Badge, Menu, Dropdown, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined, EditOutlined, SettingOutlined, PlusOutlined, LineChartOutlined, HistoryOutlined, InfoCircleOutlined, EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

interface Strategy {
  id: string;
  name: string;
  asset: string;
  type: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  profitLoss: number;
  profitLossPercentage: number;
}

const StrategyManager: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [performanceModalVisible, setPerformanceModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  
  useEffect(() => {
    fetchStrategies();
  }, []);
  
  const fetchStrategies = async () => {
    setLoading(true);
    
    // 模拟API调用 - 将来会替换为真实API服务
    setTimeout(() => {
      const mockStrategies: Strategy[] = [
        {
          id: '1',
          name: 'BTC 突破交易策略',
          asset: 'BTC',
          type: 'technical',
          status: 'active',
          createdAt: '2023-05-15T10:00:00Z',
          updatedAt: '2023-06-01T15:30:00Z',
          executionCount: 24,
          successCount: 18,
          failureCount: 6,
          profitLoss: 530.25,
          profitLossPercentage: 12.5
        },
        {
          id: '2',
          name: 'ETH RSI 超卖反弹策略',
          asset: 'ETH',
          type: 'technical',
          status: 'paused',
          createdAt: '2023-04-20T14:00:00Z',
          updatedAt: '2023-05-25T09:45:00Z',
          executionCount: 15,
          successCount: 9,
          failureCount: 6,
          profitLoss: -120.50,
          profitLossPercentage: -3.2
        },
        {
          id: '3',
          name: 'SOL 趋势跟踪策略',
          asset: 'SOL',
          type: 'pattern',
          status: 'completed',
          createdAt: '2023-03-10T08:30:00Z',
          updatedAt: '2023-05-05T16:20:00Z',
          executionCount: 32,
          successCount: 25,
          failureCount: 7,
          profitLoss: 890.75,
          profitLossPercentage: 21.8
        },
        {
          id: '4',
          name: 'BNB 新闻情绪分析策略',
          asset: 'BNB',
          type: 'sentiment',
          status: 'failed',
          createdAt: '2023-05-05T09:15:00Z',
          updatedAt: '2023-05-10T11:30:00Z',
          executionCount: 3,
          successCount: 0,
          failureCount: 3,
          profitLoss: -250.60,
          profitLossPercentage: -15.4
        }
      ];
      
      setStrategies(mockStrategies);
      setLoading(false);
    }, 1000);
  };
  
  const toggleStrategyStatus = (id: string, activate: boolean) => {
    const updatedStrategies = strategies.map(strategy => 
      strategy.id === id 
        ? { ...strategy, status: activate ? 'active' : 'paused' } 
        : strategy
    );
    
    setStrategies(updatedStrategies);
    message.success(`策略已${activate ? '激活' : '暂停'}`);
  };
  
  const showDeleteConfirm = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setDeleteModalVisible(true);
  };
  
  const handleDelete = () => {
    if (selectedStrategy) {
      setStrategies(strategies.filter(strategy => strategy.id !== selectedStrategy.id));
      message.success('策略删除成功');
      setDeleteModalVisible(false);
    }
  };
  
  const showPerformance = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setPerformanceModalVisible(true);
  };
  
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">活跃</Tag>;
      case 'paused':
        return <Tag color="orange">暂停</Tag>;
      case 'completed':
        return <Tag color="blue">已完成</Tag>;
      case 'failed':
        return <Tag color="red">失败</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };
  
  const getStrategyTypeText = (type: string) => {
    const types: Record<string, string> = {
      'price': '价格策略',
      'technical': '技术指标策略',
      'pattern': '图表模式策略',
      'sentiment': '情绪分析策略',
      'fundamental': '基本面策略',
      'custom': '自定义策略'
    };
    
    return types[type] || type;
  };
  
  const actionMenu = (record: Strategy) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />}>
        <Link to={`/trading/builder?id=${record.id}`}>编辑策略</Link>
      </Menu.Item>
      <Menu.Item key="duplicate" icon={<PlusOutlined />}>
        复制策略
      </Menu.Item>
      <Menu.Item key="history" icon={<HistoryOutlined />}>
        查看执行历史
      </Menu.Item>
      <Menu.Item key="details" icon={<InfoCircleOutlined />}>
        查看详情
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => showDeleteConfirm(record)}>
        删除策略
      </Menu.Item>
    </Menu>
  );
  
  const columns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Strategy) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#888' }}>{record.asset} | {getStrategyTypeText(record.type)}</small>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '执行统计',
      key: 'executions',
      render: (text: string, record: Strategy) => (
        <div>
          <div>总执行: {record.executionCount}</div>
          <div>
            <Tag color="green">成功: {record.successCount}</Tag>
            <Tag color="red">失败: {record.failureCount}</Tag>
          </div>
        </div>
      )
    },
    {
      title: '盈亏',
      key: 'profitLoss',
      render: (text: string, record: Strategy) => (
        <div style={{ color: record.profitLoss >= 0 ? '#52c41a' : '#f5222d' }}>
          {record.profitLoss >= 0 ? '+' : ''}{record.profitLoss.toFixed(2)} USDC
          <div>
            ({record.profitLossPercentage >= 0 ? '+' : ''}{record.profitLossPercentage.toFixed(2)}%)
          </div>
        </div>
      )
    },
    {
      title: '创建/更新时间',
      key: 'dates',
      render: (text: string, record: Strategy) => (
        <div>
          <div>创建: {new Date(record.createdAt).toLocaleString()}</div>
          <div>更新: {new Date(record.updatedAt).toLocaleString()}</div>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Strategy) => (
        <Space size="small">
          {record.status !== 'completed' && record.status !== 'failed' && (
            <Tooltip title={record.status === 'active' ? '暂停策略' : '激活策略'}>
              <Button
                type={record.status === 'active' ? 'default' : 'primary'}
                shape="circle"
                icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => toggleStrategyStatus(record.id, record.status !== 'active')}
              />
            </Tooltip>
          )}
          
          <Tooltip title="查看表现">
            <Button
              type="default"
              shape="circle"
              icon={<LineChartOutlined />}
              onClick={() => showPerformance(record)}
            />
          </Tooltip>
          
          <Dropdown overlay={actionMenu(record)} trigger={['click']}>
            <Button type="default" shape="circle" icon={<EllipsisOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];
  
  const summarizeStrategies = () => {
    const totalProfit = strategies.reduce((sum, strategy) => sum + strategy.profitLoss, 0);
    const totalExecutions = strategies.reduce((sum, strategy) => sum + strategy.executionCount, 0);
    const totalSuccess = strategies.reduce((sum, strategy) => sum + strategy.successCount, 0);
    const successRate = totalExecutions > 0 ? (totalSuccess / totalExecutions * 100) : 0;
    
    return { totalProfit, totalExecutions, totalSuccess, successRate };
  };
  
  const summary = summarizeStrategies();
  
  return (
    <div className="strategy-manager">
      <Card
        title="算法交易策略管理"
        extra={
          <Link to="/trading/builder">
            <Button type="primary" icon={<PlusOutlined />}>
              创建新策略
            </Button>
          </Link>
        }
      >
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃策略"
                value={strategies.filter(s => s.status === 'active').length}
                valueStyle={{ color: '#1890ff' }}
                prefix={<PlayCircleOutlined />}
                suffix={`/ ${strategies.length}`}
              />
            </Card>
          </Col>
          
          <Col span={6}>
            <Card>
              <Statistic
                title="总盈亏"
                value={summary.totalProfit}
                precision={2}
                valueStyle={{ color: summary.totalProfit >= 0 ? '#52c41a' : '#f5222d' }}
                prefix={summary.totalProfit >= 0 ? '+' : ''}
                suffix="USDC"
              />
            </Card>
          </Col>
          
          <Col span={6}>
            <Card>
              <Statistic
                title="总执行次数"
                value={summary.totalExecutions}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
          
          <Col span={6}>
            <Card>
              <Statistic
                title="成功率"
                value={summary.successRate}
                precision={1}
                valueStyle={{ color: summary.successRate >= 50 ? '#52c41a' : '#f5222d' }}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>
        
        {strategies.length === 0 && !loading && (
          <Alert
            message="没有找到策略"
            description="您尚未创建任何交易策略。点击右上角的"创建新策略"按钮开始创建。"
            type="info"
            showIcon
          />
        )}
        
        <Table
          dataSource={strategies}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
      
      <Modal
        title="删除策略确认"
        visible={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '22px', marginRight: '16px' }} />
          <div>
            <p>您确定要删除以下策略吗？此操作无法撤销。</p>
            <p><strong>{selectedStrategy?.name}</strong></p>
          </div>
        </div>
        <p>删除策略将终止所有自动执行，并从系统中删除该策略的所有配置。历史交易记录将保留在系统中。</p>
      </Modal>
      
      <Modal
        title={`策略表现：${selectedStrategy?.name}`}
        visible={performanceModalVisible}
        onCancel={() => setPerformanceModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPerformanceModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedStrategy && (
          <div>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="盈亏"
                  value={selectedStrategy.profitLoss}
                  precision={2}
                  valueStyle={{ color: selectedStrategy.profitLoss >= 0 ? '#52c41a' : '#f5222d' }}
                  prefix={selectedStrategy.profitLoss >= 0 ? '+' : ''}
                  suffix="USDC"
                />
                <div style={{ marginTop: '8px', color: selectedStrategy.profitLossPercentage >= 0 ? '#52c41a' : '#f5222d' }}>
                  ({selectedStrategy.profitLossPercentage >= 0 ? '+' : ''}{selectedStrategy.profitLossPercentage.toFixed(2)}%)
                </div>
              </Col>
              
              <Col span={8}>
                <Statistic
                  title="执行次数"
                  value={selectedStrategy.executionCount}
                />
              </Col>
              
              <Col span={8}>
                <Statistic
                  title="成功率"
                  value={selectedStrategy.executionCount > 0 ? (selectedStrategy.successCount / selectedStrategy.executionCount * 100) : 0}
                  precision={1}
                  suffix="%"
                />
              </Col>
            </Row>
            
            <div style={{ marginTop: '24px' }}>
              <h4>表现分析</h4>
              <p>这里将显示策略性能图表和详细分析，包括：</p>
              <ul>
                <li>盈亏随时间变化曲线</li>
                <li>执行次数统计</li>
                <li>成功/失败的时间分布</li>
                <li>风险指标（最大回撤、夏普比率等）</li>
              </ul>
              <Alert
                message="功能正在开发中"
                description="完整的性能分析功能正在开发中，将在后续版本中提供。"
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StrategyManager; 