import React, { useState, useEffect } from 'react';
import { Card, Form, Slider, Radio, Select, Button, Space, Divider, Switch, Alert, Typography, Row, Col, Tooltip, message } from 'antd';
import { QuestionCircleOutlined, SaveOutlined, UndoOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface RiskPreference {
  riskTolerance: number;
  investmentHorizon: string;
  rebalancingFrequency: string;
  maxLossPercentage: number;
  autoRebalancing: boolean;
  stopLossEnabled: boolean;
  notificationsEnabled: boolean;
  riskProtectionLevel: 'conservative' | 'moderate' | 'aggressive';
}

const RiskPreferences: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<RiskPreference>({
    riskTolerance: 50,
    investmentHorizon: 'medium',
    rebalancingFrequency: 'monthly',
    maxLossPercentage: 10,
    autoRebalancing: false,
    stopLossEnabled: true,
    notificationsEnabled: true,
    riskProtectionLevel: 'moderate'
  });
  
  useEffect(() => {
    // Simulate loading user risk preferences
    setTimeout(() => {
      form.setFieldsValue(preferences);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleReset = () => {
    form.setFieldsValue(preferences);
  };
  
  const handleSave = (values: any) => {
    setPreferences(values);
    message.success('Risk preferences saved successfully');
  };
  
  const getRiskToleranceDescription = (value: number) => {
    if (value < 30) return { text: 'Conservative', color: '#52c41a' };
    if (value < 70) return { text: 'Balanced', color: '#faad14' };
    return { text: 'Aggressive', color: '#f5222d' };
  };
  
  const getInvestmentHorizonText = (horizon: string) => {
    const horizons: Record<string, string> = {
      'short': 'Short-term (< 1 year)',
      'medium': 'Medium-term (1-5 years)',
      'long': 'Long-term (> 5 years)'
    };
    return horizons[horizon] || horizon;
  };
  
  const getRebalancingFrequencyText = (frequency: string) => {
    const frequencies: Record<string, string> = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'annually': 'Annually',
      'manual': 'Manual'
    };
    return frequencies[frequency] || frequency;
  };
  
  return (
    <div className="risk-preferences">
      <Card title="Risk Preference Settings" loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={preferences}
        >
          <div style={{ marginBottom: '24px' }}>
            <Paragraph>
              Customize risk management settings based on your risk tolerance and investment goals. These settings will be used for risk assessment and personalized recommendations.
            </Paragraph>
          </div>
          
          <Title level={4}>Risk Profile</Title>
          
          <Form.Item
            name="riskTolerance"
            label={
              <span>
                Risk Tolerance
                <Tooltip title="How much risk and volatility you're willing to accept in your investments">
                  <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                </Tooltip>
              </span>
            }
          >
            <Slider
              marks={{
                0: 'Conservative',
                50: 'Balanced',
                100: 'Aggressive'
              }}
              step={5}
            />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="investmentHorizon"
                label={
                  <span>
                    Investment Timeframe
                    <Tooltip title="The length of time you plan to hold your investments">
                      <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                    </Tooltip>
                  </span>
                }
              >
                <Radio.Group>
                  <Radio.Button value="short">Short-term</Radio.Button>
                  <Radio.Button value="medium">Medium-term</Radio.Button>
                  <Radio.Button value="long">Long-term</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="maxLossPercentage"
                label={
                  <span>
                    Maximum Acceptable Loss (%)
                    <Tooltip title="The maximum percentage loss you can tolerate in your investment at any point in time">
                      <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                    </Tooltip>
                  </span>
                }
              >
                <Slider
                  min={5}
                  max={50}
                  step={5}
                  marks={{
                    5: '5%',
                    25: '25%',
                    50: '50%'
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <Title level={4}>Automated Risk Management</Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="rebalancingFrequency"
                label={
                  <span>
                    Rebalancing Frequency
                    <Tooltip title="How often to rebalance your portfolio to maintain target asset allocations">
                      <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                    </Tooltip>
                  </span>
                }
              >
                <Select placeholder="Select frequency">
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="annually">Annually</Option>
                  <Option value="manual">Manual</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="riskProtectionLevel"
                label={
                  <span>
                    Risk Protection Level
                    <Tooltip title="Determines the sensitivity and aggressiveness of automated risk management features">
                      <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                    </Tooltip>
                  </span>
                }
              >
                <Radio.Group>
                  <Radio.Button value="conservative">Conservative</Radio.Button>
                  <Radio.Button value="moderate">Moderate</Radio.Button>
                  <Radio.Button value="aggressive">Aggressive</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="autoRebalancing"
            valuePropName="checked"
            label={
              <span>
                Enable Auto-Rebalancing
                <Tooltip title="Automatically adjust your portfolio to maintain target asset allocations">
                  <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                </Tooltip>
              </span>
            }
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="stopLossEnabled"
            valuePropName="checked"
            label={
              <span>
                Enable Stop Loss
                <Tooltip title="Automatically sell assets when their value drops to a specified threshold">
                  <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                </Tooltip>
              </span>
            }
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="notificationsEnabled"
            valuePropName="checked"
            label="Enable Risk Alert Notifications"
          >
            <Switch />
          </Form.Item>
          
          <Divider />
          
          <Alert
            message="Risk Preference Summary"
            description={
              <div>
                <p>
                  Based on your settings, your risk profile is:
                  <Text strong style={{ color: getRiskToleranceDescription(form.getFieldValue('riskTolerance')).color }}>
                    {getRiskToleranceDescription(form.getFieldValue('riskTolerance')).text}
                  </Text>
                </p>
                <p>Investment Timeframe: {getInvestmentHorizonText(form.getFieldValue('investmentHorizon'))}</p>
                <p>Rebalancing Frequency: {getRebalancingFrequencyText(form.getFieldValue('rebalancingFrequency'))}</p>
                <p>Maximum Acceptable Loss: {form.getFieldValue('maxLossPercentage')}%</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: '24px' }}
          />
          
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SaveOutlined />}
              >
                Save Settings
              </Button>
              <Button 
                onClick={handleReset}
                icon={<UndoOutlined />}
              >
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RiskPreferences; 