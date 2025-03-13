#!/bin/bash

echo "安装区块链前端组件所需依赖..."

# 安装核心依赖
npm install --save react react-dom react-router-dom

# 安装类型定义
npm install --save-dev @types/react @types/react-dom @types/react-router-dom @types/node

# 安装UI组件库
npm install --save antd @ant-design/icons

# 安装HTTP客户端
npm install --save axios

# 安装图表库
npm install --save recharts

# 安装日期处理库
npm install --save dayjs

# 安装钱包适配器（可根据需要调整）
npm install --save @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-base @solana/wallet-adapter-wallets

echo "依赖安装完成！" 