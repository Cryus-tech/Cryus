import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Button, DatePicker, Statistic, Table, Tabs, Typography, List, Tag, Space, Alert, Spin, Badge, Progress, Input, Radio } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SearchOutlined, SyncOutlined, RiseOutlined, FallOutlined, FireOutlined, LikeOutlined, DislikeOutlined, StarOutlined, InfoCircleOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

interface MarketOverview {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  marketCapChange24h: number;
  volumeChange24h: number;
  fearGreedIndex: number;
  fearGreedLabel: string;
}

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change1h: number;
  change24h: number;
  change7d: number;
  supply: number;
  ath: number;
  athDate: string;
  athPercentage: number;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: number;
}

const MarketAnalyzer: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [marketOverview, setMarketOverview] = useState<MarketOverview | null>(null);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<string>('BTC');
  const [timeRange, setTimeRange] = useState<string>('7d');
  const [newsViewMode, setNewsViewMode] = useState<string>('list');
  
  useEffect(() => {
    fetchMarketData();
  }, []);
  
  const fetchMarketData = async () => {
    setLoading(true);
    
    // 模拟API调用 - 将来会替换为真实API服务
    setTimeout(() => {
      // 市场概览数据
      const mockMarketOverview: MarketOverview = {
        totalMarketCap: 1248976542100,
        totalVolume24h: 78956432100,
        btcDominance: 42.5,
        marketCapChange24h: 2.34,
        volumeChange24h: -5.67,
        fearGreedIndex: 65,
        fearGreedLabel: '贪婪'
      };
      
      // 加密货币数据
      const mockCoins: CoinData[] = [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          price: 36542.78,
          marketCap: 698765432100,
          volume24h: 24354678900,
          change1h: 0.45,
          change24h: 2.34,
          change7d: -1.23,
          supply: 18956785,
          ath: 69000,
          athDate: '2021-11-10T00:00:00Z',
          athPercentage: -46.8
        },
        {
          id: 'ethereum',
          symbol: 'ETH',
          name: 'Ethereum',
          price: 2354.67,
          marketCap: 276543210000,
          volume24h: 15678900000,
          change1h: -0.23,
          change24h: 1.45,
          change7d: 4.56,
          supply: 120456789,
          ath: 4878,
          athDate: '2021-11-10T00:00:00Z',
          athPercentage: -51.4
        },
        {
          id: 'solana',
          symbol: 'SOL',
          name: 'Solana',
          price: 98.76,
          marketCap: 35678900000,
          volume24h: 2345678000,
          change1h: 1.23,
          change24h: 5.67,
          change7d: 12.34,
          supply: 361234567,
          ath: 260,
          athDate: '2021-11-06T00:00:00Z',
          athPercentage: -62.1
        },
        {
          id: 'cardano',
          symbol: 'ADA',
          name: 'Cardano',
          price: 0.45,
          marketCap: 15432100000,
          volume24h: 876543200,
          change1h: -0.56,
          change24h: -2.34,
          change7d: -8.76,
          supply: 34567890123,
          ath: 3.10,
          athDate: '2021-09-02T00:00:00Z',
          athPercentage: -85.2
        },
        {
          id: 'binancecoin',
          symbol: 'BNB',
          name: 'Binance Coin',
          price: 312.45,
          marketCap: 48765432100,
          volume24h: 1987654300,
          change1h: 0.12,
          change24h: 0.89,
          change7d: 2.45,
          supply: 156789012,
          ath: 690,
          athDate: '2021-05-10T00:00:00Z',
          athPercentage: -54.3
        }
      ];
      
      // 新闻数据
      const mockNews: NewsItem[] = [
        {
          id: 'news1',
          title: '比特币突破35000美元，分析师称这可能是牛市开始的信号',
          source: 'CryptoNews',
          url: 'https://example.com/news1',
          publishedAt: '2023-06-05T09:15:00Z',
          sentiment: 'positive',
          relevance: 95
        },
        {
          id: 'news2',
          title: '以太坊伦敦硬分叉即将到来，ETH价格波动加剧',
          source: 'BlockchainInsider',
          url: 'https://example.com/news2',
          publishedAt: '2023-06-04T14:30:00Z',
          sentiment: 'neutral',
          relevance: 87
        },
        {
          id: 'news3',
          title: 'Solana生态系统遭遇技术困难，多个项目受到影响',
          source: 'CryptoDaily',
          url: 'https://example.com/news3',
          publishedAt: '2023-06-03T18:45:00Z',
          sentiment: 'negative',
          relevance: 82
        },
        {
          id: 'news4',
          title: '监管机构加强对加密货币交易所的审查，市场出现担忧情绪',
          source: 'FinanceWatch',
          url: 'https://example.com/news4',
          publishedAt: '2023-06-02T11:20:00Z',
          sentiment: 'negative',
          relevance: 90
        },
        {
          id: 'news5',
          title: '新的DeFi协议在Solana上线，吸引数百万美元投资',
          source: 'DeFiPulse',
          url: 'https://example.com/news5',
          publishedAt: '2023-06-01T08:50:00Z',
          sentiment: 'positive',
          relevance: 78
        }
      ];
      
      setMarketOverview(mockMarketOverview);
      setCoins(mockCoins);
      setNews(mockNews);
      setLoading(false);
    }, 1500);
  };
  
  const handleCoinChange = (value: string) => {
    setSelectedCoin(value);
  };
  
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '#52c41a';
      case 'neutral':
        return '#faad14';
      case 'negative':
        return '#f5222d';
      default:
        return '#1890ff';
    }
  };
  
  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return '积极';
      case 'neutral':
        return '中性';
      case 'negative':
        return '消极';
      default:
        return '未知';
    }
  };
  
  const getChangeColor = (change: number) => {
    return change >= 0 ? '#52c41a' : '#f5222d';
  };
  
  const getFearGreedColor = (index: number) => {
    if (index < 25) return '#f5222d';
    if (index < 45) return '#faad14';
    if (index < 55) return '#1890ff';
    if (index < 75) return '#52c41a';
    return '#87d068';
  };
  
  const getFearGreedText = (index: number) => {
    if (index < 25) return '极度恐惧';
    if (index < 45) return '恐惧';
    if (index < 55) return '中性';
    if (index < 75) return '贪婪';
    return '极度贪婪';
  };
  
  // 生成价格历史数据（模拟数据）
  const generatePriceHistory = (coin: string, range: string) => {
    const data = [];
    const now = new Date();
    const coinPriceBase = coins.find(c => c.symbol === coin)?.price || 100;
    
    // 根据时间范围确定数据点数和间隔
    let days = 7;
    switch (range) {
      case '1d':
        days = 1;
        for (let i = 0; i < 24; i++) {
          const date = new Date(now);
          date.setHours(date.getHours() - (24 - i));
          
          data.push({
            timestamp: date.toISOString(),
            label: `${date.getHours()}:00`,
            price: coinPriceBase * (1 + (Math.random() * 0.1 - 0.05)) // 价格波动±5%
          });
        }
        break;
      case '7d':
        for (let i = 0; i < 7; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - (7 - i));
          
          data.push({
            timestamp: date.toISOString(),
            label: `${date.getMonth() + 1}/${date.getDate()}`,
            price: coinPriceBase * (1 + (Math.random() * 0.2 - 0.1)) // 价格波动±10%
          });
        }
        break;
      case '30d':
        for (let i = 0; i < 30; i += 2) {
          const date = new Date(now);
          date.setDate(date.getDate() - (30 - i));
          
          data.push({
            timestamp: date.toISOString(),
            label: `${date.getMonth() + 1}/${date.getDate()}`,
            price: coinPriceBase * (1 + (Math.random() * 0.3 - 0.15)) // 价格波动±15%
          });
        }
        break;
      case '90d':
        for (let i = 0; i < 90; i += 6) {
          const date = new Date(now);
          date.setDate(date.getDate() - (90 - i));
          
          data.push({
            timestamp: date.toISOString(),
            label: `${date.getMonth() + 1}/${date.getDate()}`,
            price: coinPriceBase * (1 + (Math.random() * 0.4 - 0.2)) // 价格波动±20%
          });
        }
        break;
      case '1y':
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - (12 - i));
          
          data.push({
            timestamp: date.toISOString(),
            label: `${date.getMonth() + 1}月`,
            price: coinPriceBase * (1 + (Math.random() * 0.6 - 0.3)) // 价格波动±30%
          });
        }
        break;
    }
    
    return data;
  };
  
  // 生成交易量历史数据（模拟数据）
  const generateVolumeHistory = (coin: string, range: string) => {
    const data = [];
    const priceData = generatePriceHistory(coin, range);
    const coinVolumeBase = coins.find(c => c.symbol === coin)?.volume24h || 1000000;
    
    for (const point of priceData) {
      data.push({
        ...point,
        volume: coinVolumeBase * (0.5 + Math.random()) / priceData.length * 2 // 模拟交易量
      });
    }
    
    return data;
  };
  
  // 生成市场情绪数据（模拟数据）
  const generateSentimentData = () => {
    const data = [
      { name: '积极', value: 45 },
      { name: '中性', value: 30 },
      { name: '消极', value: 25 }
    ];
    
    return data;
  };
  
  // 渲染市场概览
  const renderMarketOverview = () => {
    if (!marketOverview) return null;
    
    const {
      totalMarketCap,
      totalVolume24h,
      btcDominance,
      marketCapChange24h,
      volumeChange24h,
      fearGreedIndex
    } = marketOverview;
    
    return (
      <Card title="市场概览" className="market-overview-card">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic
              title="总市值"
              value={totalMarketCap}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              suffix="USD"
              formatter={(value) => `$${(value / 1e9).toFixed(2)}B`}
            />
            <div style={{ marginTop: '8px' }}>
              <Text style={{ color: getChangeColor(marketCapChange24h) }}>
                {marketCapChange24h >= 0 ? <RiseOutlined /> : <FallOutlined />}
                {marketCapChange24h.toFixed(2)}%
              </Text>
              <Text type="secondary" style={{ marginLeft: '8px' }}>24h</Text>
            </div>
          </Col>
          
          <Col span={8}>
            <Statistic
              title="24h交易量"
              value={totalVolume24h}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              suffix="USD"
              formatter={(value) => `$${(value / 1e9).toFixed(2)}B`}
            />
            <div style={{ marginTop: '8px' }}>
              <Text style={{ color: getChangeColor(volumeChange24h) }}>
                {volumeChange24h >= 0 ? <RiseOutlined /> : <FallOutlined />}
                {volumeChange24h.toFixed(2)}%
              </Text>
              <Text type="secondary" style={{ marginLeft: '8px' }}>24h</Text>
            </div>
          </Col>
          
          <Col span={8}>
            <Statistic
              title="BTC市场占比"
              value={btcDominance}
              precision={1}
              valueStyle={{ color: '#faad14' }}
              suffix="%"
            />
          </Col>
          
          <Col span={24}>
            <Card title="恐惧与贪婪指数" size="small">
              <Row align="middle">
                <Col span={16}>
                  <Progress 
                    percent={fearGreedIndex} 
                    showInfo={false}
                    strokeColor={{
                      '0%': '#f5222d',
                      '40%': '#faad14',
                      '60%': '#1890ff',
                      '100%': '#52c41a',
                    }}
                  />
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <div style={{ color: getFearGreedColor(fearGreedIndex), fontWeight: 'bold', fontSize: '24px' }}>
                    {fearGreedIndex}
                  </div>
                  <div style={{ color: getFearGreedColor(fearGreedIndex) }}>
                    {getFearGreedText(fearGreedIndex)}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    );
  };
  
  // 渲染币种价格图表
  const renderCoinChart = () => {
    const selectedCoinData = coins.find(coin => coin.symbol === selectedCoin);
    if (!selectedCoinData) return null;
    
    const priceHistory = generatePriceHistory(selectedCoin, timeRange);
    const volumeHistory = generateVolumeHistory(selectedCoin, timeRange);
    
    const formatCurrency = (value: number) => {
      return `$${value.toFixed(2)}`;
    };
    
    const formatVolume = (value: number) => {
      if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
      return `$${value.toFixed(2)}`;
    };
    
    return (
      <Card
        title={
          <div>
            <Space>
              <span>{selectedCoinData.name} ({selectedCoinData.symbol})</span>
              <span style={{ fontSize: '16px', color: '#1890ff' }}>
                ${selectedCoinData.price.toFixed(2)}
              </span>
              <Tag color={getChangeColor(selectedCoinData.change24h)}>
                {selectedCoinData.change24h >= 0 ? '+' : ''}{selectedCoinData.change24h.toFixed(2)}%
              </Tag>
            </Space>
            <div className="chart-controls" style={{ marginTop: '8px' }}>
              <Radio.Group value={timeRange} onChange={(e) => handleTimeRangeChange(e.target.value)} size="small">
                <Radio.Button value="1d">1D</Radio.Button>
                <Radio.Button value="7d">7D</Radio.Button>
                <Radio.Button value="30d">1M</Radio.Button>
                <Radio.Button value="90d">3M</Radio.Button>
                <Radio.Button value="1y">1Y</Radio.Button>
              </Radio.Group>
            </div>
          </div>
        }
      >
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={priceHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis 
                yAxisId="left" 
                domain={['auto', 'auto']} 
                tickFormatter={formatCurrency}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={['auto', 'auto']}
                tickFormatter={formatVolume}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === '价格') return formatCurrency(value as number);
                  if (name === '交易量') return formatVolume(value as number);
                  return value;
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="price" 
                name="价格" 
                stroke="#1890ff" 
                dot={false}
                strokeWidth={2}
              />
              <Bar 
                yAxisId="right"
                dataKey="volume" 
                name="交易量" 
                fill="#8884d8" 
                opacity={0.3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    );
  };
  
  // 渲染币种排行榜
  const renderCoinRanking = () => {
    const columns = [
      {
        title: '#',
        key: 'index',
        render: (_: any, __: any, index: number) => index + 1
      },
      {
        title: '币种',
        dataIndex: 'name',
        key: 'name',
        render: (name: string, record: CoinData) => (
          <Space>
            <Button 
              type={record.symbol === selectedCoin ? 'primary' : 'text'} 
              size="small"
              onClick={() => handleCoinChange(record.symbol)}
            >
              {record.symbol}
            </Button>
            <span>{name}</span>
          </Space>
        )
      },
      {
        title: '价格',
        dataIndex: 'price',
        key: 'price',
        render: (price: number) => `$${price.toFixed(2)}`
      },
      {
        title: '24h变化',
        dataIndex: 'change24h',
        key: 'change24h',
        render: (change: number) => (
          <span style={{ color: getChangeColor(change) }}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        )
      },
      {
        title: '7d变化',
        dataIndex: 'change7d',
        key: 'change7d',
        render: (change: number) => (
          <span style={{ color: getChangeColor(change) }}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        )
      },
      {
        title: '市值',
        dataIndex: 'marketCap',
        key: 'marketCap',
        render: (marketCap: number) => {
          if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
          if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
          if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
          return `$${marketCap.toFixed(2)}`;
        }
      },
      {
        title: '交易量(24h)',
        dataIndex: 'volume24h',
        key: 'volume24h',
        render: (volume: number) => {
          if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
          if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
          return `$${volume.toFixed(2)}`;
        }
      }
    ];
    
    return (
      <Card title="加密货币排行榜">
        <Table 
          dataSource={coins} 
          columns={columns} 
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    );
  };
  
  // 渲染市场情绪
  const renderMarketSentiment = () => {
    const sentimentData = generateSentimentData();
    
    return (
      <Card title="市场情绪分析">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#52c41a' : index === 1 ? '#faad14' : '#f5222d'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Col>
          <Col span={12}>
            <List
              size="small"
              header={<div>情绪指标</div>}
              bordered
              dataSource={[
                { name: '恐惧与贪婪指数', value: marketOverview?.fearGreedIndex || 0, type: 'index' },
                { name: '积极新闻占比', value: 45, type: 'news' },
                { name: '社交媒体情绪', value: 62, type: 'social' },
                { name: '买卖压力比', value: 1.2, type: 'pressure' }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{item.name}</span>
                    <span>
                      {item.type === 'index' ? (
                        <Tag color={getFearGreedColor(item.value)}>
                          {item.value} - {getFearGreedText(item.value)}
                        </Tag>
                      ) : item.type === 'pressure' ? (
                        <Tag color={item.value > 1 ? '#52c41a' : '#f5222d'}>
                          {item.value.toFixed(2)}
                        </Tag>
                      ) : (
                        <Tag color={item.value > 50 ? '#52c41a' : item.value > 30 ? '#faad14' : '#f5222d'}>
                          {item.value}%
                        </Tag>
                      )}
                    </span>
                  </div>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Card>
    );
  };
  
  // 渲染新闻
  const renderNews = () => {
    return (
      <Card 
        title="市场新闻" 
        extra={
          <Space>
            <Radio.Group value={newsViewMode} onChange={(e) => setNewsViewMode(e.target.value)} size="small">
              <Radio.Button value="list"><UnorderedListOutlined /></Radio.Button>
              <Radio.Button value="grid"><AppstoreOutlined /></Radio.Button>
            </Radio.Group>
            <Button icon={<SyncOutlined />} size="small" onClick={() => fetchMarketData()}>
              刷新
            </Button>
          </Space>
        }
      >
        {newsViewMode === 'list' ? (
          <List
            itemLayout="vertical"
            size="large"
            dataSource={news}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                extra={
                  <div>
                    <Tag color={getSentimentColor(item.sentiment)}>
                      {getSentimentText(item.sentiment)}
                    </Tag>
                    <div style={{ marginTop: '8px' }}>
                      相关性: {item.relevance}%
                    </div>
                  </div>
                }
              >
                <List.Item.Meta
                  title={<a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>}
                  description={
                    <div>
                      <Space>
                        <span>{item.source}</span>
                        <span>{new Date(item.publishedAt).toLocaleString()}</span>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {news.map(item => (
              <Col span={12} key={item.id}>
                <Card size="small" hoverable>
                  <div style={{ marginBottom: '8px' }}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                      <span>{item.source}</span>
                      <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    </Space>
                    <Tag color={getSentimentColor(item.sentiment)}>
                      {getSentimentText(item.sentiment)}
                    </Tag>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>
    );
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  return (
    <div className="market-analyzer">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space style={{ marginBottom: '16px' }}>
            <Select 
              value={selectedCoin} 
              onChange={handleCoinChange}
              style={{ width: '150px' }}
            >
              {coins.map(coin => (
                <Option key={coin.id} value={coin.symbol}>
                  {coin.symbol} - {coin.name}
                </Option>
              ))}
            </Select>
            <Button icon={<SyncOutlined />} onClick={() => fetchMarketData()}>
              刷新数据
            </Button>
          </Space>
        </Col>
        
        <Col span={24} lg={16}>
          {renderCoinChart()}
        </Col>
        
        <Col span={24} lg={8}>
          {renderMarketOverview()}
        </Col>
        
        <Col span={24}>
          {renderCoinRanking()}
        </Col>
        
        <Col span={24}>
          <Tabs defaultActiveKey="sentiment">
            <TabPane tab="市场情绪" key="sentiment">
              {renderMarketSentiment()}
            </TabPane>
            <TabPane tab="市场新闻" key="news">
              {renderNews()}
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    </div>
  );
};

export default MarketAnalyzer; 