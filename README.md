# 基于区块链的身份认证平台

本项目旨在构建一个基于区块链技术的去中心化身份认证平台，为用户提供安全、透明且不可篡改的身份验证服务。平台利用智能合约管理用户注册和身份状态，管理员可以审核注册请求。

## 技术栈

*   **区块链:** Solidity, Truffle, Ganache
*   **前端:** React, TypeScript, Vite, Tailwind CSS, wagmi, Viem
*   **钱包:** MetaMask

## 核心功能

*   **用户注册:** 通过连接 MetaMask 钱包，提交邮箱和个人信息（电话号码可选）进行注册。信息存储在链上。
*   **管理员审核:** 管理员账户可以查看待审核的用户列表（仅显示钱包地址和注册时间），并批准或拒绝注册请求。
*   **用户状态查看:** 用户可以查看自己的注册状态（待审核、已批准、已拒绝）。

## 项目结构

```
.
├── contracts/           # 智能合约 (IdentityRegistry.sol)
├── frontend/            # 前端 React 应用 (Vite + TypeScript)
│   ├── public/
│   │   └── assets/      # 静态资源 (占位符 logo)
│   ├── src/
│   │   ├── components/  # UI 组件 (Admin, Auth, Layout, User, Wallet)
│   │   ├── config/      # 合约配置 (地址, ABI)
│   │   ├── App.tsx      # 主应用组件
│   │   ├── index.css    # 全局 CSS (Tailwind)
│   │   ├── main.tsx     # 应用入口
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── migrations/          # Truffle 部署脚本
├── test/                # 合约测试 (待完善)
├── package.json
├── README.md            # 项目说明文档
└── truffle-config.js    # Truffle 配置文件
```

## 安装与运行

**环境要求:**

*   Node.js >= 18.0.0
*   npm or yarn
*   MetaMask 浏览器插件

**步骤:**

1.  **克隆项目:**
    ```bash
    git clone <your-repo-url>
    cd <project-directory>
    ```

2.  **安装根目录依赖:**
    ```bash
    npm install
    # 或者
    # yarn install
    ```

3.  **安装前端依赖:**
    ```bash
    cd frontend
    npm install
    # 或者
    # yarn install
    cd .. 
    ```

4.  **启动本地区块链 (Ganache):**
    在一个终端窗口运行:
    ```bash
    npx ganache
    ```
    *   记下 Ganache 提供的 RPC URL (例如 `http://127.0.0.1:8545`) 和助记词/私钥。

5.  **配置 MetaMask:**
    *   添加一个新的网络，使用 Ganache 提供的 RPC URL。
    *   导入 Ganache 提供的账户（至少需要两个：一个管理员，一个普通用户）。将第一个账户作为管理员（默认由合约构造函数设置）。

6.  **部署/迁移智能合约:**
    在一个新的终端窗口运行:
    ```bash
    npx truffle migrate --reset
    ```
    *   记下部署后的 `IdentityRegistry` 合约地址。

7.  **更新前端合约配置:**
    *   编辑 `frontend/src/config/contract.ts` 文件。
    *   将 `CONTRACT_ADDRESS` 更新为第 6 步中部署的合约地址。
    *   `CONTRACT_ABI` 会在编译后自动生成在 `frontend/src/config/contract.ts` (如果配置了 `wagmi generate`) 或需要手动从 `contracts/build/contracts/IdentityRegistry.json` 复制 ABI 部分。确保 ABI 是最新的。

8.  **启动前端开发服务器:**
    在一个新的终端窗口运行:
    ```bash
    cd frontend
    npm run dev
    ```
    *   在浏览器中打开提供的本地 URL (例如 `http://localhost:5173`)。

## 使用说明

*   **用户注册:** 连接普通用户钱包，填写邮箱、个人信息（和可选的电话号码），点击注册。
*   **管理员审核:** 连接管理员钱包，访问管理员面板，查看待审核用户，点击"通过"或"拒绝"。

## 未来计划

*   实现邮箱验证码功能。
*   完善用户状态显示页面。
*   增强管理员功能（例如搜索、筛选）。
*   优化链下数据存储方案（如果需要存储更敏感的信息）。
*   添加更全面的合约和前端测试。
*   改进 UI/UX 设计。

## 贡献指南

欢迎贡献！请遵循标准的 Git 工作流（Fork -> Branch -> PR）。

## 许可证

[MIT](./LICENSE) (如果需要，请添加 LICENSE 文件) 