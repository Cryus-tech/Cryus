import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, InputNumber, Switch, Button, Divider, Space, Alert, Steps, Tooltip, Row, Col, DatePicker, Radio, Typography, message } from 'antd';
import { QuestionCircleOutlined, SaveOutlined, CodeOutlined, PlayCircleOutlined, FormOutlined, RobotOutlined, SettingOutlined, BulbOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Title, Text } = Typography;

interface StrategyFormValues {
  name: string;
  description: string;
  type: string;
  asset: string;
  timeframe: string;
  indicators: string[];
  conditions: Condition[];
  actions: Action[];
  maxExecutions: number;
  expiryDate: dayjs.Dayjs | null;
  isActive: boolean;
  riskLevel: number;
  maxLossPercentage: number;
  advancedMode: boolean;
  customCode?: string;
}

interface Condition {
  indicator: string;
  comparator: string;
  value: number;
  operator?: string;
}

interface Action {
  type: string;
  amount: number;
  amountType: string;
}

const StrategyBuilder: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formValues, setFormValues] = useState<StrategyFormValues | null>(null);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);
  const [previewStrategy, setPreviewStrategy] = useState<boolean>(false);
  
  // Listen for advanced mode changes
  useEffect(() => {
    form.setFieldsValue({ advancedMode });
  }, [advancedMode, form]);
  
  // Form submission handler
  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: values.isActive ? 'active' : 'inactive',
      executionCount: 0,
      successCount: 0,
      failureCount: 0
    };
    
    setFormValues(values);
    
    // Here would interact with backend API to save the strategy
    console.log('Saving strategy:', formattedValues);
    message.success('Strategy saved successfully');
  };
  
  // Handle step change
  const handleStepChange = (step: number) => {
    // Validate current step form
    form.validateFields()
      .then(() => {
        setCurrentStep(step);
      })
      .catch(error => {
        // Form validation failed, don't switch steps
        console.log('Form validation error:', error);
      });
  };
  
  const next = () => {
    handleStepChange(currentStep + 1);
  };
  
  const prev = () => {
    handleStepChange(currentStep - 1);
  };
  
  // Strategy type corresponding indicators
  const indicatorsByType: Record<string, string[]> = {
    'price': ['price', 'volume', 'market_cap', 'price_change_24h', 'volume_change_24h'],
    'technical': ['sma', 'ema', 'rsi', 'macd', 'bollinger_bands', 'stochastic', 'obv'],
    'pattern': ['double_top', 'double_bottom', 'head_shoulders', 'triangle', 'wedge', 'channel'],
    'sentiment': ['social_sentiment', 'news_sentiment', 'fear_greed_index', 'google_trends', 'twitter_mentions'],
    'fundamental': ['pe_ratio', 'market_dominance', 'supply_distribution', 'active_addresses', 'transaction_volume'],
    'custom': []
  };
  
  // Get available indicators based on strategy type
  const getAvailableIndicators = () => {
    const strategyType = form.getFieldValue('type');
    return strategyType ? indicatorsByType[strategyType] || [] : [];
  };
  
  // Render basic info form
  const renderBasicInfoForm = () => (
    <Card title="Basic Information">
      <Form.Item
        name="name"
        label="Strategy Name"
        rules={[{ required: true, message: 'Please enter a strategy name' }]}
      >
        <Input placeholder="e.g. BTC Breakout Trading Strategy" />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="Strategy Description"
      >
        <TextArea 
          placeholder="Describe the goal and mechanism of this strategy..." 
          rows={4} 
        />
      </Form.Item>
      
      <Form.Item
        name="type"
        label={
          <span>
            Strategy Type
            <Tooltip title="Choose a basic strategy type as a starting point">
              <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
            </Tooltip>
          </span>
        }
        rules={[{ required: true, message: 'Please select a strategy type' }]}
      >
        <Select placeholder="Select strategy type">
          <Option value="price">Price Strategy</Option>
          <Option value="technical">Technical Indicator Strategy</Option>
          <Option value="pattern">Chart Pattern Strategy</Option>
          <Option value="sentiment">Sentiment Analysis Strategy</Option>
          <Option value="fundamental">Fundamental Strategy</Option>
          <Option value="custom">Custom Strategy</Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        name="asset"
        label="Trading Asset"
        rules={[{ required: true, message: 'Please select a trading asset' }]}
      >
        <Select 
          placeholder="Select asset"
          showSearch
          optionFilterProp="children"
        >
          <Option value="BTC">Bitcoin (BTC)</Option>
          <Option value="ETH">Ethereum (ETH)</Option>
          <Option value="SOL">Solana (SOL)</Option>
          <Option value="BNB">Binance Coin (BNB)</Option>
          <Option value="ADA">Cardano (ADA)</Option>
          <Option value="XRP">Ripple (XRP)</Option>
          <Option value="DOT">Polkadot (DOT)</Option>
          <Option value="AVAX">Avalanche (AVAX)</Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        name="timeframe"
        label={
          <span>
            Timeframe
            <Tooltip title="The time interval for strategy analysis and execution">
              <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
            </Tooltip>
          </span>
        }
        rules={[{ required: true, message: 'Please select a timeframe' }]}
      >
        <Select placeholder="Select timeframe">
          <Option value="1m">1 minute</Option>
          <Option value="5m">5 minutes</Option>
          <Option value="15m">15 minutes</Option>
          <Option value="30m">30 minutes</Option>
          <Option value="1h">1 hour</Option>
          <Option value="4h">4 hours</Option>
          <Option value="1d">1 day</Option>
          <Option value="1w">1 week</Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        name="advancedMode"
        valuePropName="checked"
        label={
          <span>
            Advanced Mode
            <Tooltip title="Use code editor to customize strategy logic">
              <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
            </Tooltip>
          </span>
        }
      >
        <Switch onChange={setAdvancedMode} />
      </Form.Item>
    </Card>
  );
  
  // Render conditions form
  const renderConditionsForm = () => {
    const selectedType = form.getFieldValue('type');
    
    if (advancedMode) {
      return (
        <Card title="Custom Strategy Logic">
          <Alert
            message="Advanced Mode Enabled"
            description="You can use the code editor to write your strategy logic directly. Ensure your code returns a boolean value to determine if a trade should be executed."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Form.Item
            name="customCode"
            rules={[{ required: true, message: 'Please enter custom code' }]}
          >
            <TextArea 
              rows={15} 
              placeholder="// Use JavaScript to write your strategy logic
function executeStrategy(data) {
  // data contains market data, indicators, and price history
  // Example: Buy when price is above 50-day moving average
  const price = data.price;
  const sma50 = data.indicators.sma(50);
  
  if (price > sma50) {
    return { execute: true, action: 'buy', amount: '10%' };
  }
  
  return { execute: false };
}" 
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
          
          <div style={{ marginTop: '16px' }}>
            <Tooltip title="View available APIs and examples">
              <Button icon={<CodeOutlined />} style={{ marginRight: '8px' }}>
                Code Documentation
              </Button>
            </Tooltip>
            <Tooltip title="Test your code">
              <Button icon={<PlayCircleOutlined />}>
                Test Code
              </Button>
            </Tooltip>
          </div>
        </Card>
      );
    }
    
    return (
      <Card title="Strategy Conditions">
        <Alert
          message="Tip"
          description={
            <div>
              <p>Configure conditions that will trigger strategy execution. You can add multiple conditions and combine them.</p>
              <p>When all conditions are met, the strategy will execute the specified actions.</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <Form.Item
          name="indicators"
          label={
            <span>
              Select Indicators
              <Tooltip title="Choose technical indicators to build trading conditions">
                <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
              </Tooltip>
            </span>
          }
          rules={[{ required: !advancedMode, message: 'Please select at least one indicator' }]}
        >
          <Select 
            mode="multiple" 
            placeholder="Select indicators"
            disabled={!selectedType}
          >
            {getAvailableIndicators().map(indicator => (
              <Option key={indicator} value={indicator}>
                {indicator === 'price' ? 'Price' : 
                 indicator === 'volume' ? 'Volume' : 
                 indicator === 'market_cap' ? 'Market Cap' :
                 indicator === 'price_change_24h' ? '24h Price Change' :
                 indicator === 'volume_change_24h' ? '24h Volume Change' :
                 indicator === 'sma' ? 'Simple Moving Average (SMA)' :
                 indicator === 'ema' ? 'Exponential Moving Average (EMA)' :
                 indicator === 'rsi' ? 'Relative Strength Index (RSI)' :
                 indicator === 'macd' ? 'MACD' :
                 indicator === 'bollinger_bands' ? 'Bollinger Bands' :
                 indicator === 'stochastic' ? 'Stochastic Oscillator' :
                 indicator === 'obv' ? 'On-Balance Volume (OBV)' :
                 indicator === 'social_sentiment' ? 'Social Media Sentiment' :
                 indicator === 'news_sentiment' ? 'News Sentiment' :
                 indicator === 'fear_greed_index' ? 'Fear & Greed Index' :
                 indicator}
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.List
          name="conditions"
          rules={[
            {
              validator: async (_, conditions) => {
                if (!advancedMode && (!conditions || conditions.length < 1)) {
                  return Promise.reject(new Error('Please add at least one condition'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map((field, index) => (
                <div key={field.key} style={{ border: '1px dashed #d9d9d9', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
                  <Row gutter={8}>
                    <Col span={7}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'indicator']}
                        fieldKey={[field.fieldKey, 'indicator']}
                        label="Indicator"
                        rules={[{ required: true, message: 'Please select an indicator' }]}
                      >
                        <Select placeholder="Select indicator">
                          {(form.getFieldValue('indicators') || []).map((indicator: string) => (
                            <Option key={indicator} value={indicator}>
                              {indicator === 'price' ? 'Price' : 
                               indicator === 'volume' ? 'Volume' : 
                               indicator === 'market_cap' ? 'Market Cap' :
                               indicator === 'price_change_24h' ? '24h Price Change' :
                               indicator === 'volume_change_24h' ? '24h Volume Change' :
                               indicator === 'sma' ? 'Simple Moving Average (SMA)' :
                               indicator === 'ema' ? 'Exponential Moving Average (EMA)' :
                               indicator === 'rsi' ? 'Relative Strength Index (RSI)' :
                               indicator === 'macd' ? 'MACD' :
                               indicator === 'bollinger_bands' ? 'Bollinger Bands' :
                               indicator === 'stochastic' ? 'Stochastic Oscillator' :
                               indicator === 'obv' ? 'On-Balance Volume (OBV)' :
                               indicator === 'social_sentiment' ? 'Social Media Sentiment' :
                               indicator === 'news_sentiment' ? 'News Sentiment' :
                               indicator === 'fear_greed_index' ? 'Fear & Greed Index' :
                               indicator}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={5}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'comparator']}
                        fieldKey={[field.fieldKey, 'comparator']}
                        label="Comparator"
                        rules={[{ required: true, message: 'Please select a comparator' }]}
                      >
                        <Select placeholder="Select comparator">
                          <Option value="gt">Greater Than (&gt;)</Option>
                          <Option value="lt">Less Than (&lt;)</Option>
                          <Option value="gte">Greater Than or Equal (&gt;=)</Option>
                          <Option value="lte">Less Than or Equal (&lt;=)</Option>
                          <Option value="eq">Equal (=)</Option>
                          <Option value="cross_above">Crosses Above</Option>
                          <Option value="cross_below">Crosses Below</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={8}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        fieldKey={[field.fieldKey, 'value']}
                        label="Value"
                        rules={[{ required: true, message: 'Please enter a value' }]}
                      >
                        <InputNumber style={{ width: '100%' }} placeholder="Enter a specific value" />
                      </Form.Item>
                    </Col>
                    
                    {index > 0 && (
                      <Col span={4}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'operator']}
                          fieldKey={[field.fieldKey, 'operator']}
                          label="Logical Operator"
                          rules={[{ required: true, message: 'Please select an operator' }]}
                        >
                          <Select placeholder="AND/OR">
                            <Option value="and">AND</Option>
                            <Option value="or">OR</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    )}
                    
                    <Col flex="none" style={{ marginTop: '29px', marginLeft: '8px' }}>
                      <Button 
                        type="text" 
                        danger 
                        onClick={() => remove(field.name)}
                        icon={<span>×</span>}
                      />
                    </Col>
                  </Row>
                </div>
              ))}
              
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<span>+</span>}
                >
                  Add Condition
                </Button>
              </Form.Item>
              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
      </Card>
    );
  };
  
  // Render actions form
  const renderActionsForm = () => (
    <Card title="Execution Actions">
      <Alert
        message="Tip"
        description={
          <div>
            <p>Configure actions to be executed when strategy conditions are met. You can set the buy or sell amount and trigger methods.</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: '16px' }}
      />
      
      <Form.List
        name="actions"
        rules={[
          {
            validator: async (_, actions) => {
              if (!actions || actions.length < 1) {
                return Promise.reject(new Error('Please add at least one action'));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field) => (
              <div key={field.key} style={{ border: '1px dashed #d9d9d9', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'type']}
                      fieldKey={[field.fieldKey, 'type']}
                      label="Action Type"
                      rules={[{ required: true, message: 'Please select an action type' }]}
                    >
                      <Select placeholder="Select action">
                        <Option value="buy">Buy</Option>
                        <Option value="sell">Sell</Option>
                        <Option value="hold">Hold</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={8}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'amount']}
                      fieldKey={[field.fieldKey, 'amount']}
                      label="Amount"
                      rules={[{ required: true, message: 'Please enter an amount' }]}
                    >
                      <InputNumber 
                        style={{ width: '100%' }} 
                        min={0} 
                        precision={2} 
                        placeholder="Enter amount" 
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={7}>
                    <Form.Item
                      {...field}
                      name={[field.name, 'amountType']}
                      fieldKey={[field.fieldKey, 'amountType']}
                      label="Amount Type"
                      rules={[{ required: true, message: 'Please select an amount type' }]}
                      initialValue="percentage"
                    >
                      <Select placeholder="Select type">
                        <Option value="percentage">Percentage (%)</Option>
                        <Option value="fixed">Fixed Amount</Option>
                        <Option value="fiat">Fiat Value</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col flex="none" style={{ marginTop: '29px', marginLeft: '8px' }}>
                    <Button 
                      type="text" 
                      danger 
                      onClick={() => remove(field.name)}
                      icon={<span>×</span>}
                    />
                  </Col>
                </Row>
              </div>
            ))}
            
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<span>+</span>}
              >
                Add Action
              </Button>
            </Form.Item>
            <Form.ErrorList errors={errors} />
          </>
        )}
      </Form.List>
    </Card>
  );
  
  // Render advanced settings form
  const renderAdvancedSettings = () => (
    <Card title="Advanced Settings">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="maxExecutions"
            label={
              <span>
                Maximum Executions
                <Tooltip title="Set the maximum number of times this strategy can execute, 0 means unlimited">
                  <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                </Tooltip>
              </span>
            }
            initialValue={0}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="expiryDate"
            label={
              <span>
                Strategy Expiry Date
                <Tooltip title="Set a date when the strategy will automatically stop, leave blank for no expiry">
                  <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                </Tooltip>
              </span>
            }
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="riskLevel"
            label={
              <span>
                Risk Level
                <Tooltip title="Set the risk level for this strategy">
                  <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                </Tooltip>
              </span>
            }
            initialValue={50}
          >
            <Slider
              marks={{
                0: 'Very Low',
                25: 'Low',
                50: 'Medium',
                75: 'High',
                100: 'Very High'
              }}
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="maxLossPercentage"
            label={
              <span>
                Maximum Loss Percentage
                <Tooltip title="The strategy will automatically stop when loss reaches this percentage">
                  <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                </Tooltip>
              </span>
            }
            initialValue={10}
          >
            <InputNumber 
              min={0} 
              max={100} 
              formatter={value => `${value}%`}
              parser={value => value!.replace('%', '')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Form.Item
        name="isActive"
        valuePropName="checked"
        label="Activate Strategy Immediately"
        initialValue={true}
      >
        <Switch />
      </Form.Item>
    </Card>
  );
  
  // Render strategy preview
  const renderStrategyPreview = () => {
    if (!formValues) {
      return null;
    }
    
    const { type, asset, timeframe, indicators, conditions, actions, maxExecutions, expiryDate, isActive, riskLevel } = formValues;
    
    const getConditionText = (condition: Condition) => {
      const comparators: Record<string, string> = {
        'gt': 'greater than',
        'lt': 'less than',
        'gte': 'greater than or equal to',
        'lte': 'less than or equal to',
        'eq': 'equal to',
        'cross_above': 'crosses above',
        'cross_below': 'crosses below'
      };
      
      return `${condition.indicator} ${comparators[condition.comparator]} ${condition.value}`;
    };
    
    const getActionText = (action: Action) => {
      const types: Record<string, string> = {
        'buy': 'Buy',
        'sell': 'Sell',
        'hold': 'Hold'
      };
      
      const amountTypes: Record<string, string> = {
        'percentage': '%',
        'fixed': 'units',
        'fiat': 'USDC'
      };
      
      return `${types[action.type]} ${action.amount} ${amountTypes[action.amountType]}`;
    };
    
    return (
      <Card title="Strategy Preview">
        <Alert
          message="Strategy Summary"
          description={
            <div>
              <p>
                This strategy will monitor <Text strong>{asset}</Text> on the <Text strong>{timeframe}</Text> timeframe.
              </p>
              <p>
                When the following conditions are met:
                <ul>
                  {conditions?.map((condition, index) => (
                    <li key={index}>
                      {index > 0 && condition.operator && <Text strong>{condition.operator === 'and' ? 'AND' : 'OR'}</Text>}{' '}
                      {getConditionText(condition)}
                    </li>
                  ))}
                </ul>
              </p>
              <p>
                The following actions will be executed:
                <ul>
                  {actions?.map((action, index) => (
                    <li key={index}>{getActionText(action)}</li>
                  ))}
                </ul>
              </p>
              <Divider />
              <p>
                Risk Level: <Text strong>{riskLevel || 50}</Text>
              </p>
              {maxExecutions > 0 && (
                <p>
                  Maximum Executions: <Text strong>{maxExecutions}</Text>
                </p>
              )}
              {expiryDate && (
                <p>
                  Strategy Expiry Date: <Text strong>{expiryDate.format('YYYY-MM-DD')}</Text>
                </p>
              )}
              <p>
                Strategy Status: <Text strong>{isActive ? 'Active' : 'Inactive'}</Text>
              </p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>
    );
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfoForm();
      case 1:
        return renderConditionsForm();
      case 2:
        return renderActionsForm();
      case 3:
        return renderAdvancedSettings();
      case 4:
        return renderStrategyPreview();
      default:
        return null;
    }
  };
  
  // Steps navigation
  const steps = [
    {
      title: 'Basic Info',
      icon: <FormOutlined />
    },
    {
      title: 'Conditions',
      icon: <BulbOutlined />
    },
    {
      title: 'Actions',
      icon: <PlayCircleOutlined />
    },
    {
      title: 'Advanced',
      icon: <SettingOutlined />
    },
    {
      title: 'Preview',
      icon: <RobotOutlined />
    }
  ];
  
  return (
    <div className="strategy-builder">
      <Card title="Algorithmic Trading Strategy Builder">
        <Steps current={currentStep} onChange={handleStepChange}>
          {steps.map(step => (
            <Step key={step.title} title={step.title} icon={step.icon} />
          ))}
        </Steps>
        
        <div style={{ marginTop: '24px' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              isActive: true,
              riskLevel: 50,
              maxLossPercentage: 10,
              maxExecutions: 0,
              advancedMode: false
            }}
          >
            {renderStepContent()}
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
              {currentStep > 0 && (
                <Button onClick={prev}>
                  Previous
                </Button>
              )}
              
              <div style={{ marginLeft: 'auto' }}>
                {currentStep < steps.length - 1 && (
                  <Button type="primary" onClick={next}>
                    Next
                  </Button>
                )}
                
                {currentStep === steps.length - 1 && (
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    Save Strategy
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default StrategyBuilder; 