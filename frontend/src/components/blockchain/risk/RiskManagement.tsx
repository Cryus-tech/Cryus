import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import PortfolioAnalyzer from './PortfolioAnalyzer';
import RiskMonitor from './RiskMonitor';
import RiskPreferences from './RiskPreferences';

const { TabPane } = Tabs;

const RiskManagement: React.FC = () => {
  return (
    <div className="risk-management">
      <Card>
        <Tabs defaultActiveKey="portfolio">
          <TabPane tab="Portfolio Analysis" key="portfolio">
            <PortfolioAnalyzer />
          </TabPane>
          <TabPane tab="Risk Monitoring" key="monitor">
            <RiskMonitor />
          </TabPane>
          <TabPane tab="Risk Preferences" key="preferences">
            <RiskPreferences />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default RiskManagement; 