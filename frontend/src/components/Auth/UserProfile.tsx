import { useEffect } from 'react'
import { useContractRead } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract'

interface UserProfileProps {
  account: string
}

const UserProfile = ({ account }: UserProfileProps) => {
  // 获取用户信息
  const { data: userInfo, isLoading: isLoadingInfo } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getUserInfo',
    args: [account as `0x${string}`],
  })

  // 获取验证历史
  const { data: verificationHistory, isLoading: isLoadingHistory } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getVerificationHistory',
    args: [account as `0x${string}`],
  })

  if (isLoadingInfo || isLoadingHistory) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // 解构用户信息，处理返回值类型
  const [info, verified] = (userInfo as [string, boolean]) || ['', false]
  const history = (verificationHistory as Array<{ timestamp: bigint; verifier: string; result: boolean }>) || []

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-center">个人信息</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">验证状态</span>
          <span className={`px-3 py-1 rounded-full text-sm ${verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {verified ? '已验证' : '未验证'}
          </span>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">钱包地址</h3>
          <p className="text-sm text-gray-600 break-all">{account}</p>
        </div>

        {!verified && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">待验证提示</h3>
            <p className="text-sm text-blue-600">
              您的身份信息尚未验证，请等待管理员进行验证。验证通过后您将获得完整的平台访问权限。
            </p>
          </div>
        )}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">验证历史记录</h3>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((record, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{record.verifier}</span>
                  <span className={`px-2 py-1 rounded text-xs ${record.result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {record.result ? '验证通过' : '验证失败'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(Number(record.timestamp) * 1000).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">暂无验证记录</p>
            {!verified && (
              <p className="text-sm text-gray-400 mt-2">
                验证记录将在管理员审核后显示
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile 