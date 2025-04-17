# 基于区块链的身份认证平台

## 目录
- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [核心功能](#核心功能)
- [系统设计](#系统设计)
  - [身份认证流程](#身份认证流程)
  - [权限管理](#权限管理)
- [项目结构](#项目结构)
- [开发计划](#开发计划)
- [环境要求](#环境要求)
- [安装与运行](#安装与运行)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 项目概述
本项目旨在构建一个基于区块链技术的去中心化身份认证平台，为用户提供安全、透明且不可篡改的身份验证服务。该平台将利用智能合约来管理身份验证流程，确保数据的安全性和可追溯性。

## 技术栈
### 区块链开发
- Solidity：智能合约开发
- Truffle：开发框架
- Ganache：本地测试网络
- Web3.js：与区块链交互
- MetaMask：钱包集成

### 前端开发
- React：用户界面
- TypeScript：类型安全
- Tailwind CSS：样式设计
- Web3.js：区块链交互

### 测试与安全
- MythX：智能合约安全分析
- Jest：测试框架
- Mocha：智能合约测试

## 核心功能
### 用户视角功能
1. **用户注册与身份认证**
   - 创建/连接数字钱包
   - 填写基本身份信息
   - 上传身份证明文件
   - 完成身份验证流程

2. **个人中心功能**
   - 查看个人身份信息
   - 管理身份证明文件
   - 查看身份验证状态
   - 查看历史验证记录
   - 更新个人信息

3. **身份验证服务**
   - 发起身份验证请求
   - 查看验证进度
   - 接收验证结果通知
   - 查看验证历史记录
   - 下载验证证明文件

4. **安全与隐私**
   - 设置隐私权限
   - 管理数据访问权限
   - 查看数据使用记录
   - 撤销数据访问权限
   - 导出个人数据

## 系统设计
### 身份认证流程
1. **注册流程**
   ```
   用户 -> 连接钱包 -> 邮箱验证 -> 填写信息 -> 身份确认 -> 生成身份凭证
   ```

2. **具体实现步骤**
   - **钱包连接**
     - 用户连接 MetaMask 钱包
     - 钱包地址作为唯一标识
     - 智能合约检查钱包地址唯一性

   - **邮箱验证**
     - 用户输入邮箱地址
     - 系统检查邮箱唯一性
     - 发送验证码（使用第三方邮件服务）
     - 验证码有效期：10分钟
     - 邮箱与钱包地址绑定

   - **信息存储方案**
     - **链上存储（加密）**：
       - 钱包地址
       - 邮箱地址哈希值
       - 身份凭证哈希
       - 验证状态
     
     - **链下存储（加密）**：
       - 用户详细信息
       - 邮箱地址
       - 证件照片
       - 其他敏感信息

3. **防重复机制**
   ```solidity
   mapping(address => bool) public registeredWallets;
   mapping(bytes32 => bool) public registeredEmailHashes;
   ```

4. **数据安全方案**
   - **加密存储**：
     - 使用非对称加密存储用户信息
     - 用户持有私钥
     - 验证机构使用公钥验证

   - **数据分离**：
     - **链上数据（智能合约）**：
       - 身份标识符（DID）
       - 数据哈希值
       - 验证状态
     
     - **链下数据（加密数据库）**：
       - 个人详细信息
       - 证件信息
       - 验证历史

### 权限管理
1. **角色设计**
   - **普通用户（User）**
     - 基本权限：
       - 注册和验证身份
       - 管理个人信息
       - 查看自己的验证记录
       - 控制数据访问权限

   - **验证机构（Verifier）**
     - 权限：
       - 验证用户身份
       - 查看必要的用户信息
       - 更新验证状态
     - 限制：
       - 不能修改用户原始数据
       - 只能查看授权范围内的信息

   - **管理员（Admin）**
     - 权限：
       - 管理验证机构
       - 处理用户投诉
       - 查看系统运行状态
     - 限制：
       - 不能直接访问用户数据
       - 所有操作需要记录在链上

2. **智能合约设计**
   ```solidity
   contract PermissionManager {
       enum Role {
           USER,
           VERIFIER,
           ADMIN
       }

       struct UserRole {
           Role role;
           bool isActive;
       }

       mapping(address => UserRole) public userRoles;
       mapping(address => bool) public isVerifier;
       mapping(address => bool) public isAdmin;

       // 权限检查修饰器
       modifier onlyRole(Role role) {
           require(userRoles[msg.sender].role == role, "Unauthorized");
           require(userRoles[msg.sender].isActive, "Role inactive");
           _;
       }

       // 事件记录
       event RoleAssigned(address indexed user, Role role);
       event RoleRevoked(address indexed user, Role role);
   }
   ```

3. **权限管理特点**
   - 最小权限原则
   - 权限分离
   - 透明性（所有权限变更记录在链上）
   - 安全性（权限操作可追溯）

## 项目结构
```
├── contracts/           # 智能合约代码
├── migrations/          # 合约部署脚本
├── test/               # 测试文件
├── src/                # 前端源代码
│   ├── components/     # React组件
│   ├── pages/         # 页面组件
│   ├── utils/         # 工具函数
│   └── hooks/         # 自定义Hooks
├── public/             # 静态资源
└── docs/              # 项目文档
```

## 开发计划
1. **第一阶段：智能合约开发**
   - 设计并实现身份注册合约
   - 实现身份验证逻辑
   - 编写单元测试
   - 使用Ganache进行本地测试

2. **第二阶段：前端开发**
   - 搭建React项目框架
   - 实现用户界面组件
   - 集成Web3.js和MetaMask
   - 实现与智能合约的交互

3. **第三阶段：测试与优化**
   - 进行智能合约安全审计
   - 优化合约Gas消耗
   - 进行前端性能优化
   - 完善错误处理机制

4. **第四阶段：部署上线**
   - 部署智能合约到测试网络
   - 进行完整测试
   - 部署到主网
   - 部署前端到Vercel

## 环境要求
- Node.js >= 16.0.0
- npm >= 7.0.0
- Truffle >= 5.0.0
- MetaMask浏览器插件

## 安装与运行
1. 克隆项目
```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖
```bash
npm install
```

3. 启动本地开发环境
```bash
npm run start
```

## 贡献指南
欢迎提交Issue和Pull Request。在提交代码前，请确保：
1. 代码符合项目规范
2. 已通过所有测试
3. 更新了相关文档

## 许可证
MIT License 