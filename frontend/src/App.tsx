import { useState, useEffect } from 'react';
import { WagmiConfig, useContractRead, useAccount } from 'wagmi'; // 引入 useAccount
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi.config';
import WalletConnect from './components/Wallet/WalletConnect'; // 确保这个组件现在不接受 props
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserStatus from './components/User/UserStatus'; // 取消注释
import Layout from './components/Layout/Layout'; // 导入布局组件
import './App.css';

// 创建React Query客户端
const queryClient = new QueryClient();

function AppContent() {
  const { address, isConnected } = useAccount(); // 使用 useAccount 获取地址和连接状态
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查是否是管理员 - 注意：需要确保 CONTRACT_ADDRESS 和 CONTRACT_ABI 导入正确
  // 并且 useContractRead 能正确工作。为了简化，暂时移除。
  // const { data: adminStatus } = useContractRead({
  //   address: CONTRACT_ADDRESS as `0x${string}`,
  //   abi: CONTRACT_ABI,
  //   functionName: 'isAdmin',
  //   args: address ? [address as `0x${string}`] : undefined,
  //   enabled: !!address // 仅当地址存在时启用
  // });

  // // 监听管理员状态
  // useEffect(() => {
  //   if (adminStatus !== undefined) {
  //     setIsAdmin(adminStatus as boolean);
  //   } else if (!address) {
  //     setIsAdmin(false); // 断开连接时重置管理员状态
  //   }
  // }, [adminStatus, address]);

  // 简化：直接使用第一个 Ganache 账户作为管理员判断依据
  useEffect(() => {
    // 更新为当前 Ganache 的第一个账户地址
    if (address?.toLowerCase() === '0xe9f9318250391d7312b8cd8fde0b31c176b7f9f2') { 
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [address]);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000); // 错误显示时间延长
  };

  return (
    <Layout> {/* 使用布局组件包裹 */} 
      <div className="min-h-screen bg-gray-100 py-8"> 
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">去中心化身份认证平台</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* WalletConnect 不再需要 props */}
              <WalletConnect /> 
            </div>

            {isConnected && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 管理员面板 */} 
                {isAdmin && (
                  <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
                    <AdminDashboard />
                  </div>
                )}
                
                {/* 用户注册/状态 (非管理员) */} 
                {!isAdmin && (
                  <>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <Register />
                    </div>
                    {/* UserStatus 区域取消注释 */} 
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <UserStatus />
                    </div> 
                  </>
                )}
              </div>
            )}

            {!isConnected && (
              <div className="text-center py-8 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  欢迎使用区块链身份认证平台
                </h3>
                <p className="text-gray-500">
                  请连接您的钱包以开始使用平台功能
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
