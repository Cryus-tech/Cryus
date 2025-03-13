import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Divider, Alert, Typography, Tooltip, Tag } from 'antd';
import { PieChart, Pie } from '@ant-design/plots';
import { RiseOutlined, FallOutlined, WarningOutlined, PieChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Asset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  allocation: number;
  change24h: number;
  risk: 'low' | 'medium' | 'high';
}

const PortfolioAnalyzer: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState({
    totalValue: 0,
    changePercentage: 0,
    change24h: 0,
    riskScore: 0,
    diversificationScore: 0,
    volatility: 0
  });

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    setLoading(true);

    // Mocked data - would be replaced with API calls
    setTimeout(() => {
      const mockAssets: Asset[] = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          amount: 0.5,
          value: 18500,
          allocation: 45,
          change24h: 2.3,
          risk: 'high'
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          amount: 4.2,
          value: 12600,
          allocation: 30,
          change24h: -1.2,
          risk: 'high'
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          amount: 65,
          value: 6500,
          allocation: 15,
          change24h: 5.7,
          risk: 'medium'
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          amount: 4000,
          value: 4000,
          allocation: 10,
          change24h: 0,
          risk: 'low'
        }
      ];

      const mockStats = {
        totalValue: 41600,
        changePercentage: 1.8,
        change24h: 720,
        riskScore: 65,
        diversificationScore: 40,
        volatility: 25.3
      };

      setAssets(mockAssets);
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  };

  const getRiskInfo = (score: number) => {
    if (score < 30) return { label: 'Low', color: '#52c41a' };
    if (score < 70) return { label: 'Medium', color: '#faad14' };
    return { label: 'High', color: '#f5222d' };
  };

  const getDiversificationInfo = (score: number) => {
    if (score > 70) return { label: 'Well Diversified', color: '#52c41a' };
    if (score > 40) return { label: 'Moderately Diversified', color: '#faad14' };
    return { label: 'Poorly Diversified', color: '#f5222d' };
  };

  const riskInfo = getRiskInfo(stats.riskScore);
  const diversificationInfo = getDiversificationInfo(stats.diversificationScore);

  const columns = [
    {
      title: 'Asset',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Asset) => (
        <span>
          <strong>{record.symbol}</strong> - {text}
        </span>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Asset) => `${amount} ${record.symbol}`
    },
    {
      title: 'Value (USDC)',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `$${value.toLocaleString()}`
    },
    {
      title: 'Allocation',
      dataIndex: 'allocation',
      key: 'allocation',
      render: (allocation: number) => (
        <div>
          <span>{allocation}%</span>
          <Progress percent={allocation} showInfo={false} size="small" />
        </div>
      )
    },
    {
      title: '24h Change',
      dataIndex: 'change24h',
      key: 'change24h',
      render: (change: number) => (
        <span style={{ color: change >= 0 ? '#52c41a' : '#f5222d' }}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )
    },
    {
      title: 'Risk Level',
      dataIndex: 'risk',
      key: 'risk',
      render: (risk: string) => {
        const colors = {
          high: '#f5222d',
          medium: '#faad14',
          low: '#52c41a'
        };
        return <Tag color={colors[risk as keyof typeof colors]}>{risk.toUpperCase()}</Tag>;
      }
    }
  ];

  const pieData = assets.map(asset => ({
    type: asset.symbol,
    value: asset.allocation
  }));

  const pieConfig = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [{ type: 'element-active' }],
  };

  if (loading) {
    return <Card loading={true} />;
  }

  return (
    <div className="portfolio-analyzer">
      <Title level={4}>Portfolio Analysis</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Total Portfolio Value"
              value={stats.totalValue}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              suffix="USDC"
            />
            <div style={{ marginTop: '8px' }}>
              <span style={{ 
                color: stats.changePercentage >= 0 ? '#52c41a' : '#f5222d',
                marginRight: '8px',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                {stats.changePercentage >= 0 ? <RiseOutlined /> : <FallOutlined />}
                {stats.changePercentage >= 0 ? '+' : ''}{stats.changePercentage.toFixed(2)}%
              </span>
              <span style={{ marginLeft: '8px', color: '#888' }}>
                24h: {stats.change24h >= 0 ? '+' : ''}{stats.change24h.toFixed(2)} USDC
              </span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Risk Score"
              value={stats.riskScore}
              suffix={`/100 (${riskInfo.label})`}
              valueStyle={{ color: riskInfo.color }}
              prefix={<WarningOutlined />}
            />
            <Tooltip title="This score is based on asset allocation and risk factors of each asset">
              <Progress 
                percent={stats.riskScore} 
                showInfo={false}
                strokeColor={{
                  '0%': '#52c41a',
                  '50%': '#faad14',
                  '100%': '#f5222d',
                }}
              />
            </Tooltip>
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Diversification Score"
              value={stats.diversificationScore}
              suffix={`/100 (${diversificationInfo.label})`}
              valueStyle={{ color: diversificationInfo.color }}
              prefix={<PieChartOutlined />}
            />
            <Tooltip title="Higher score means better risk distribution">
              <Progress 
                percent={stats.diversificationScore} 
                showInfo={false}
                strokeColor={{
                  '0%': '#f5222d',
                  '50%': '#faad14',
                  '100%': '#52c41a',
                }}
              />
            </Tooltip>
          </Card>
        </Col>
        
        <Col xs={24} md={12} lg={6}>
          <Card>
            <Statistic
              title="Volatility"
              value={stats.volatility}
              suffix="%"
              valueStyle={{ color: stats.volatility > 20 ? '#f5222d' : '#faad14' }}
            />
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
              <Tooltip title="Volatility based on historical price calculations">
                <span>30-day average volatility</span>
              </Tooltip>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Asset Allocation">
            <div style={{ height: 300 }}>
              <Pie {...pieConfig} />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Risk Exposure Analysis">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic 
                  title="High Risk"
                  value={assets.filter(a => a.risk === 'high').reduce((sum, a) => sum + a.allocation, 0)}
                  suffix="%"
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Medium Risk"
                  value={assets.filter(a => a.risk === 'medium').reduce((sum, a) => sum + a.allocation, 0)}
                  suffix="%"
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Low Risk"
                  value={assets.filter(a => a.risk === 'low').reduce((sum, a) => sum + a.allocation, 0)}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
            <Divider />
            <div>
              <Alert 
                message="Portfolio Risk Assessment"
                description={
                  <div>
                    <p>
                      {
                        stats.riskScore > 70 
                          ? 'Your portfolio has a high risk level. Consider increasing stablecoin or low-risk asset allocation.'
                          : stats.riskScore > 40
                            ? 'Your portfolio has a moderate risk level. Consider further diversification.'
                            : 'Your portfolio has a low risk level. Maintain your good asset allocation.'
                      }
                    </p>
                    
                    {stats.diversificationScore < 50 && (
                      <p style={{ marginTop: '8px' }}>
                        <WarningOutlined style={{ color: '#faad14' }} /> Consider adding different types of assets to improve diversification.
                      </p>
                    )}
                  </div>
                }
                type={stats.riskScore > 70 ? 'warning' : stats.riskScore > 40 ? 'info' : 'success'}
                showIcon
              />
            </div>
          </Card>
        </Col>
        
        <Col span={24}>
          <Card title="Asset Details">
            <Table 
              dataSource={assets} 
              columns={columns} 
              rowKey="symbol"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PortfolioAnalyzer; 