import React, { useState } from 'react';
import { Card, Form, Select, Button, DatePicker, InputNumber, Alert, Divider, Space, Table, Statistic, Row, Col, Progress, Tabs, Radio, Spin, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RocketOutlined, AreaChartOutlined, ExperimentOutlined, InfoCircleOutlined, DownloadOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

interface BacktestResult {
  id: string;
  strategyName: string;
  asset: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  profitLoss: number;
  profitLossPercentage: number;
  tradesCount: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: Trade[];
  performanceData: PerformancePoint[];
}

interface Trade {
  id: string;
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  value: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

interface PerformancePoint {
  date: string;
  strategyValue: number;
  holdValue: number;
  assetPrice: number;
}

const StrategyBacktest: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('results');
  
  const handleBacktest = async (values: any) => {
    setLoading(true);
    
    // 模拟API调用 - 将来会替换为真实API服务
    setTimeout(() => {
      // 假设我们从后端获取了回测结果
      const mockTrades: Trade[] = [];
      const mockPerformanceData: PerformancePoint[] = [];
      
      // 生成模拟的交易数据
      const startDate = new Date(values.dateRange[0].valueOf());
      const endDate = new Date(values.dateRange[1].valueOf());
      const daysBetween = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let currentDate = new Date(startDate);
      let strategyValue = values.initialCapital;
      let holdValue = values.initialCapital;
      let assetStartPrice = 100; // 假设起始价格
      let currentPrice = assetStartPrice;
      
      for (let i = 0; i <= daysBetween; i++) {
        // 简单的价格模型 - 每天随机波动 -2% 到 +2%
        const priceChange = currentPrice * (Math.random() * 0.04 - 0.02);
        currentPrice += priceChange;
        
        // 策略价值也随机波动，但假设它比单纯持有略好一些
        const strategyChange = strategyValue * (Math.random() * 0.05 - 0.02);
        strategyValue += strategyChange;
        
        // 持有价值简单地跟随资产价格变化
        holdValue = values.initialCapital * (currentPrice / assetStartPrice);
        
        // 生成每日的性能数据点
        mockPerformanceData.push({
          date: currentDate.toISOString().split('T')[0],
          strategyValue,
          holdValue,
          assetPrice: currentPrice
        });
        
        // 随机生成一些交易记录
        if (Math.random() > 0.8) {
          const tradeType = Math.random() > 0.5 ? 'buy' : 'sell';
          const tradeAmount = values.initialCapital * 0.1 * Math.random();
          const tradeValue = tradeAmount * currentPrice;
          
          mockTrades.push({
            id: `trade-${i}`,
            timestamp: currentDate.toISOString(),
            type: tradeType,
            price: currentPrice,
            amount: tradeAmount,
            value: tradeValue,
            profitLoss: tradeType === 'sell' ? tradeValue * 0.05 : undefined,
            profitLossPercentage: tradeType === 'sell' ? 5 : undefined
          });
        }
        
        // 增加一天
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // 计算胜率等指标
      const winningTrades = mockTrades.filter(t => t.type === 'sell' && t.profitLoss! > 0).length;
      const losingTrades = mockTrades.filter(t => t.type === 'sell' && t.profitLoss! < 0).length;
      const totalTrades = mockTrades.length;
      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      
      // 计算最大回撤
      let maxDrawdown = 0;
      let peak = mockPerformanceData[0].strategyValue;
      
      for (const point of mockPerformanceData) {
        if (point.strategyValue > peak) {
          peak = point.strategyValue;
        }
        
        const drawdown = (peak - point.strategyValue) / peak * 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
      
      // 计算夏普比率（简化版）
      const returns = mockPerformanceData.map((p, i) => 
        i > 0 ? (p.strategyValue / mockPerformanceData[i-1].strategyValue) - 1 : 0
      );
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const stdDeviation = Math.sqrt(
        returns.map(r => Math.pow(r - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length
      );
      const sharpeRatio = stdDeviation !== 0 ? (avgReturn / stdDeviation) * Math.sqrt(252) : 0; // 252个交易日/年
      
      const result: BacktestResult = {
        id: `backtest-${Date.now()}`,
        strategyName: values.strategyName,
        asset: values.asset,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        initialCapital: values.initialCapital,
        finalCapital: strategyValue,
        profitLoss: strategyValue - values.initialCapital,
        profitLossPercentage: ((strategyValue - values.initialCapital) / values.initialCapital) * 100,
        tradesCount: mockTrades.length,
        winningTrades,
        losingTrades,
        winRate,
        maxDrawdown,
        sharpeRatio,
        trades: mockTrades,
        performanceData: mockPerformanceData
      };
      
      setBacktestResult(result);
      setLoading(false);
      setActiveTab('results');
    }, 2000);
  };
  
  const renderBacktestForm = () => (
    <Card title="回测参数配置">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleBacktest}
        initialValues={{
          initialCapital: 10000,
          asset: 'BTC'
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="strategyName"
              label="策略名称"
              rules={[{ required: true, message: '请输入策略名称' }]}
            >
              <Select placeholder="选择策略">
                <Option value="BTC突破交易策略">BTC突破交易策略</Option>
                <Option value="ETH RSI超卖反弹策略">ETH RSI超卖反弹策略</Option>
                <Option value="SOL趋势跟踪策略">SOL趋势跟踪策略</Option>
                <Option value="自定义新策略">自定义新策略</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="asset"
              label="交易资产"
              rules={[{ required: true, message: '请选择交易资产' }]}
            >
              <Select placeholder="选择资产">
                <Option value="BTC">Bitcoin (BTC)</Option>
                <Option value="ETH">Ethereum (ETH)</Option>
                <Option value="SOL">Solana (SOL)</Option>
                <Option value="BNB">Binance Coin (BNB)</Option>
                <Option value="ADA">Cardano (ADA)</Option>
                <Option value="XRP">Ripple (XRP)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="dateRange"
          label="回测时间范围"
          rules={[{ required: true, message: '请选择回测时间范围' }]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="initialCapital"
          label="初始资金 (USDC)"
          rules={[{ required: true, message: '请输入初始资金' }]}
        >
          <InputNumber
            min={100}
            step={100}
            style={{ width: '100%' }}
          />
        </Form.Item>
        
        <Form.Item
          name="dataSource"
          label="数据源"
          initialValue="exchange"
        >
          <Radio.Group>
            <Radio.Button value="exchange">交易所数据</Radio.Button>
            <Radio.Button value="custom">自定义数据</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<RocketOutlined />}
              loading={loading}
            >
              开始回测
            </Button>
            <Button
              onClick={() => form.resetFields()}
              icon={<ReloadOutlined />}
            >
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
  
  const renderBacktestResults = () => {
    if (!backtestResult) {
      return (
        <Card>
          <Alert
            message="尚未运行回测"
            description="请设置回测参数并点击"开始回测"按钮来查看结果。"
            type="info"
            showIcon
          />
        </Card>
      );
    }
    
    const {
      strategyName,
      asset,
      startDate,
      endDate,
      initialCapital,
      finalCapital,
      profitLoss,
      profitLossPercentage,
      tradesCount,
      winningTrades,
      losingTrades,
      winRate,
      maxDrawdown,
      sharpeRatio,
      performanceData
    } = backtestResult;
    
    return (
      <div>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="回测结果" key="results">
            <Card title={`回测结果：${strategyName} - ${asset}`}>
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Statistic
                    title="初始资金"
                    value={initialCapital}
                    precision={2}
                    suffix="USDC"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="最终资金"
                    value={finalCapital}
                    precision={2}
                    suffix="USDC"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="盈亏"
                    value={profitLoss}
                    precision={2}
                    valueStyle={{ color: profitLoss >= 0 ? '#52c41a' : '#f5222d' }}
                    prefix={profitLoss >= 0 ? '+' : ''}
                    suffix="USDC"
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="盈亏百分比"
                    value={profitLossPercentage}
                    precision={2}
                    valueStyle={{ color: profitLossPercentage >= 0 ? '#52c41a' : '#f5222d' }}
                    prefix={profitLossPercentage >= 0 ? '+' : ''}
                    suffix="%"
                  />
                </Col>
              </Row>
              
              <Divider />
              
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="交易次数"
                      value={tradesCount}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="胜率"
                      value={winRate}
                      precision={2}
                      suffix="%"
                      valueStyle={{ color: winRate > 50 ? '#52c41a' : '#f5222d' }}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ color: '#52c41a' }}><CheckCircleOutlined /> {winningTrades}</span>
                      <span style={{ color: '#f5222d', marginLeft: '16px' }}><CloseCircleOutlined /> {losingTrades}</span>
                    </div>
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="最大回撤"
                      value={maxDrawdown}
                      precision={2}
                      suffix="%"
                      valueStyle={{ color: maxDrawdown < 15 ? '#52c41a' : maxDrawdown < 30 ? '#faad14' : '#f5222d' }}
                    />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card>
                    <Statistic
                      title="夏普比率"
                      value={sharpeRatio}
                      precision={2}
                      valueStyle={{ color: sharpeRatio > 1 ? '#52c41a' : sharpeRatio > 0 ? '#faad14' : '#f5222d' }}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Card title="策略表现" style={{ marginTop: '24px' }}>
                <div style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="strategyValue" 
                        name="策略价值" 
                        stroke="#1890ff" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="holdValue" 
                        name="持有价值" 
                        stroke="#52c41a" 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="assetPrice" 
                        name={`${asset}价格`} 
                        stroke="#faad14" 
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button icon={<DownloadOutlined />}>
                  导出报告
                </Button>
              </div>
            </Card>
          </TabPane>
          
          <TabPane tab="交易记录" key="trades">
            <Card title="回测交易记录">
              <Table
                dataSource={backtestResult.trades}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                columns={[
                  {
                    title: '时间',
                    dataIndex: 'timestamp',
                    key: 'timestamp',
                    render: (timestamp) => new Date(timestamp).toLocaleString()
                  },
                  {
                    title: '类型',
                    dataIndex: 'type',
                    key: 'type',
                    render: (type) => (
                      <Tag color={type === 'buy' ? '#1890ff' : '#52c41a'}>
                        {type === 'buy' ? '买入' : '卖出'}
                      </Tag>
                    )
                  },
                  {
                    title: '价格',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `${price.toFixed(2)} USDC`
                  },
                  {
                    title: '数量',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amount) => amount.toFixed(6)
                  },
                  {
                    title: '价值',
                    dataIndex: 'value',
                    key: 'value',
                    render: (value) => `${value.toFixed(2)} USDC`
                  },
                  {
                    title: '盈亏',
                    dataIndex: 'profitLoss',
                    key: 'profitLoss',
                    render: (profitLoss, record) => (
                      record.type === 'sell' && profitLoss !== undefined ? (
                        <span style={{ color: profitLoss >= 0 ? '#52c41a' : '#f5222d' }}>
                          {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} USDC
                          <span style={{ display: 'block' }}>
                            ({record.profitLossPercentage!.toFixed(2)}%)
                          </span>
                        </span>
                      ) : '-'
                    )
                  }
                ]}
              />
            </Card>
          </TabPane>
          
          <TabPane tab="风险分析" key="risk">
            <Card title="风险分析">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="每月回报">
                    <div style={{ height: '250px' }}>
                      {/* 此处应为月度回报柱状图 */}
                      <Alert
                        message="功能开发中"
                        description="每月回报图表功能即将推出。"
                        type="info"
                        showIcon
                      />
                    </div>
                  </Card>
                </Col>
                
                <Col span={12}>
                  <Card title="回撤分析">
                    <div style={{ height: '250px' }}>
                      {/* 此处应为回撤分析图表 */}
                      <Alert
                        message="功能开发中"
                        description="回撤分析图表功能即将推出。"
                        type="info"
                        showIcon
                      />
                    </div>
                  </Card>
                </Col>
              </Row>
              
              <Card title="风险指标" style={{ marginTop: '16px' }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic
                      title="夏普比率"
                      value={sharpeRatio}
                      precision={2}
                      valueStyle={{ color: sharpeRatio > 1 ? '#52c41a' : sharpeRatio > 0 ? '#faad14' : '#f5222d' }}
                    />
                    <Paragraph style={{ marginTop: '8px' }}>
                      <InfoCircleOutlined /> 夏普比率衡量了每单位风险的超额回报。值越大，每单位风险回报越高。
                    </Paragraph>
                  </Col>
                  
                  <Col span={8}>
                    <Statistic
                      title="最大回撤"
                      value={maxDrawdown}
                      precision={2}
                      suffix="%"
                      valueStyle={{ color: maxDrawdown < 15 ? '#52c41a' : maxDrawdown < 30 ? '#faad14' : '#f5222d' }}
                    />
                    <Paragraph style={{ marginTop: '8px' }}>
                      <InfoCircleOutlined /> 最大回撤表示从高点到低点的最大损失百分比。
                    </Paragraph>
                  </Col>
                  
                  <Col span={8}>
                    <Statistic
                      title="波动率"
                      value={Math.random() * 20 + 10} // 模拟数据
                      precision={2}
                      suffix="%"
                      valueStyle={{ color: '#faad14' }}
                    />
                    <Paragraph style={{ marginTop: '8px' }}>
                      <InfoCircleOutlined /> 波动率表示策略收益的标准偏差，衡量风险大小。
                    </Paragraph>
                  </Col>
                </Row>
              </Card>
            </Card>
          </TabPane>
          
          <TabPane tab="对比分析" key="compare">
            <Card title="策略对比分析">
              <Alert
                message="功能开发中"
                description="策略对比分析功能即将推出，将支持与其他策略、基准指标的对比。"
                type="info"
                showIcon
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>
    );
  };
  
  return (
    <div className="strategy-backtest">
      <Row gutter={[16, 16]}>
        <Col span={24} lg={8}>
          {renderBacktestForm()}
          
          <Card title="回测说明" style={{ marginTop: '16px' }}>
            <Paragraph>
              <InfoCircleOutlined /> 回测是在历史数据上模拟策略执行，评估其潜在表现的过程。
            </Paragraph>
            <Paragraph>
              <strong>注意事项：</strong>
            </Paragraph>
            <ul>
              <li>历史表现不代表未来结果</li>
              <li>回测结果可能存在过拟合风险</li>
              <li>未考虑滑点、手续费等实际交易成本</li>
              <li>建议结合多种指标评估策略质量</li>
            </ul>
          </Card>
        </Col>
        
        <Col span={24} lg={16}>
          {loading ? (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>正在进行回测计算，请稍候...</div>
              </div>
            </Card>
          ) : (
            renderBacktestResults()
          )}
        </Col>
      </Row>
    </div>
  );
};

export default StrategyBacktest; 