import React from 'react';
import { Tabs, Card } from 'antd';
import StrategyBuilder from './StrategyBuilder';
import StrategyManager from './StrategyManager';
import StrategyBacktest from './StrategyBacktest';
import MarketAnalyzer from './MarketAnalyzer';

const { TabPane } = Tabs;

const AlgorithmicTrading: React.FC = () => {
  return (
    <div className="algorithmic-trading">
      <Card>
        <Tabs defaultActiveKey="manager">
          <TabPane tab="Strategy Manager" key="manager">
            <StrategyManager />
          </TabPane>
          <TabPane tab="Strategy Builder" key="builder">
            <StrategyBuilder />
          </TabPane>
          <TabPane tab="Strategy Backtest" key="backtest">
            <StrategyBacktest />
          </TabPane>
          <TabPane tab="Market Analyzer" key="market">
            <MarketAnalyzer />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AlgorithmicTrading; 