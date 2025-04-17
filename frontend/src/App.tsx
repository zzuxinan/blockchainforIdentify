import { useState, useEffect } from 'react'
import { WagmiConfig, useContractRead } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi.config'
import WalletConnect from './components/Wallet/WalletConnect'
import Register from './components/Auth/Register'
import UserProfile from './components/Auth/UserProfile'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config/contract'

// 创建React Query客户端
const queryClient = new QueryClient()

function AppContent() {
  const [account, setAccount] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [showProfile, setShowProfile] = useState(false)

  // 获取用户信息
  const { data: userInfo } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getUserInfo',
    args: account ? [account as `0x${string}`] : undefined,
  })

  // 监听用户信息变化
  useEffect(() => {
    if (account && userInfo) {
      const [_, verified] = userInfo as [string, boolean]
      setShowProfile(verified)
    }
  }, [account, userInfo])

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setTimeout(() => setError(''), 3000)
  }

  const handleRegistrationSuccess = () => {
    setShowProfile(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">区块链身份认证平台</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <WalletConnect 
              onAccountChange={(newAccount: string) => {
                setAccount(newAccount)
                if (!newAccount) {
                  setShowProfile(false)
                }
              }}
              onError={handleError}
            />
          </div>

          {account && (
            <div className="bg-white rounded-lg shadow-md">
              {showProfile ? (
                <UserProfile account={account} />
              ) : (
                <Register 
                  onError={handleError}
                  onSuccess={handleRegistrationSuccess}
                />
              )}
            </div>
          )}

          {!account && (
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

      <footer className="mt-12 py-6 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
          <p>© dth 区块链身份认证平台</p>
          <p className="mt-2 text-sm">基于区块链技术的去中心化身份认证解决方案</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </WagmiConfig>
  )
}

export default App
