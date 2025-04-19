import { useAccount, useContractRead } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract'
import { formatDate } from '../../utils/date'

interface UserInfo {
  email: string
  personalInfo: string
  registrationTime: bigint
  isVerified: boolean
}

export function UserProfile() {
  const { address, isConnected } = useAccount()

  const { data: userInfo, isError, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'users',
    args: address ? [address] : undefined,
  })

  if (!isConnected) {
    return <div className="text-center mt-4">请先连接钱包</div>
  }

  if (isLoading) {
    return <div className="text-center mt-4">加载中...</div>
  }

  if (isError || !userInfo) {
    return <div className="text-center mt-4">未找到用户信息</div>
  }

  const typedUserInfo = userInfo as unknown as UserInfo

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">用户信息</h2>
      <div className="space-y-4">
        <div>
          <label className="font-medium text-gray-700">钱包地址：</label>
          <p className="mt-1">{address}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">邮箱：</label>
          <p className="mt-1">{typedUserInfo.email}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">个人信息：</label>
          <p className="mt-1">{typedUserInfo.personalInfo}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">注册时间：</label>
          <p className="mt-1">{formatDate(Number(typedUserInfo.registrationTime))}</p>
        </div>
        <div>
          <label className="font-medium text-gray-700">验证状态：</label>
          <p className="mt-1">{typedUserInfo.isVerified ? '已验证' : '未验证'}</p>
        </div>
      </div>
    </div>
  )
} 