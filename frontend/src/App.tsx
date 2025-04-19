import { useState, useEffect } from 'react';
import { WagmiConfig, useContractRead, useAccount } from 'wagmi'; // 引入 useAccount
import { QueryClient, QueryClientProvider, QueryObserverResult, ReadContractErrorType, RefetchOptions } from '@tanstack/react-query'; // 引入 QueryObserverResult 等类型
import { config } from './wagmi.config';
// Import contract details
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config/contract'; 
import WalletConnect from './components/Wallet/WalletConnect'; // 确保这个组件现在不接受 props
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import UserStatus from './components/User/UserStatus'; // 取消注释
import Layout from './components/Layout/Layout'; // 导入布局组件
// 使用正确的 UserProfile 导入路径
import { UserProfile } from './components/Auth/UserProfile'; // 注意这里改成了 Auth 目录下的 UserProfile
import './App.css';

// 创建React Query客户端
const queryClient = new QueryClient();

function AppContent() {
  const { address, isConnected } = useAccount(); // 使用 useAccount 获取地址和连接状态
  const [error, setError] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  // Add state for user status
  const [userStatus, setUserStatus] = useState<number | null>(null); 

  // Read admin status - 移除 enabled 属性
  const { data: isAdminResult } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isAdmin',
    args: address ? [address] : undefined,
  });

  // Read user status - 移除 enabled 属性，添加 watch: true 确保状态更新
  const { 
    data: fetchedUserStatus, 
    isLoading: isUserStatusLoading, 
    error: userStatusError,
    refetch: refetchUserStatus 
  } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserStatus',
    args: address ? [address] : undefined,
    // 移除 enabled, 如果需要实时更新，可以考虑 watch
    // watch: true, // 如果需要实时监听状态变化，可以取消注释这个
  });

  // Update admin status
  useEffect(() => {
    // 确保 isAdminResult 不是 undefined 才进行转换
    if (isAdminResult !== undefined) {
      setIsAdmin(Boolean(isAdminResult));
    }
  }, [isAdminResult]);

  // Update user status
  useEffect(() => {
    console.log('App.tsx: fetchedUserStatus raw:', fetchedUserStatus, 'isLoading:', isUserStatusLoading, 'error:', userStatusError);
    
    if (!isUserStatusLoading && !userStatusError && fetchedUserStatus !== undefined && fetchedUserStatus !== null) {
      try {
        // 正确解构返回值
        const [exists, isVerified, isPending] = fetchedUserStatus as unknown as readonly [boolean, boolean, boolean]; // 移除多余的 bigint
        console.log('App.tsx: Status parsed:', { exists, isVerified, isPending });
        
        let statusCode: number;
        if (!exists) {
          statusCode = 0; // NotRegistered
        } else if (isPending) {
          statusCode = 1; // Pending
        } else if (isVerified) {
          statusCode = 2; // Approved
        } else {
          // 如果存在但未验证且不处于pending，则视为拒绝
          statusCode = 3; // Rejected
        }
        
        console.log('App.tsx: Mapped status code:', statusCode);
        setUserStatus(statusCode);
      } catch (error) {
        console.error('App.tsx: Error parsing user status:', error);
        setUserStatus(null); // 解析出错时重置状态
      }
    } else if (!isUserStatusLoading && isConnected && address && !isAdmin) {
      // 如果加载完成但没有有效数据或出错，且用户已连接且不是管理员，则认为用户未注册
      console.log('App.tsx: Resetting userStatus to 0 (NotRegistered) due to lack of data/error');
      setUserStatus(0);
    } else if (!isConnected) {
      // 如果未连接钱包，重置状态
      console.log('App.tsx: Resetting userStatus due to disconnection');
      setUserStatus(null);
    }
    // 依赖项应包含所有可能影响状态的变量
  }, [fetchedUserStatus, isUserStatusLoading, userStatusError, isConnected, address, isAdmin]);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000); // 错误显示时间延长
  };

  // 定义 refetch 函数的类型
  const typedRefetchUserStatus: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<readonly [boolean, boolean, boolean], ReadContractErrorType>> = refetchUserStatus as any;

  // Render content based on connection and status
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">去中心化身份认证平台</h2>
          <p className="text-gray-600">请连接您的钱包以继续</p>
        </div>
      );
    }

    if (isAdmin) {
      return <AdminDashboard />;
    }

    // Show different content based on user status
    switch (userStatus) {
      case 0: // NotRegistered
        return (
          <div className="space-y-6">
            {/* 传递类型修正后的 refetch 函数 */} 
            <UserStatus userStatus={userStatus} refetchStatus={typedRefetchUserStatus} />
            <Register onSuccess={typedRefetchUserStatus} />
          </div>
        );
      case 1: // Pending
      case 3: // Rejected
        return <UserStatus userStatus={userStatus} refetchStatus={typedRefetchUserStatus} />;
      case 2: // Approved
        return <UserProfile />;
      default:
        // 改进加载状态显示
        return (
          <div className="text-center p-8">
            {/* 添加一个简单的加载动画或图标 */} 
            <svg className="animate-spin h-5 w-5 text-blue-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">正在加载用户状态...</p>
          </div>
        );
    }
  };

  return (
    <Layout> {/* 使用布局组件包裹 */} 
      <div className="min-h-screen bg-gray-100 py-8"> 
        <div className="max-w-4xl mx-auto px-4">
          {/* 移除顶层标题，因为布局组件可能已经包含 */} 
          {/* <h1 className="text-3xl font-bold text-center mb-8">去中心化身份认证平台</h1> */}

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

            {/* 条件渲染整个内容区域 */} 
            {isConnected ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                 {renderContent()} 
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">欢迎来到去中心化身份认证平台</h2>
                <p className="text-gray-600">请连接您的钱包以继续。</p>
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
