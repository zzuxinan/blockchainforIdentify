import { useState } from 'react'
import { useContractRead } from 'wagmi'
import { parseAbi } from 'viem'
import { CONTRACT_ADDRESS } from '../../config/contract'
import { shortenAddress } from '../../utils/web3'

interface PersonalCenterProps {
  account: string
  onError: (error: string) => void
}

// 修复ABI定义格式
const contractABI = [
  {
    name: 'getUserInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      {
        name: 'user',
        type: 'address'
      }
    ],
    outputs: [
      {
        name: 'info',
        type: 'string'
      },
      {
        name: 'verified',
        type: 'bool'
      }
    ]
  }
] as const

const PersonalCenter = ({ account, onError }: PersonalCenterProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newInfo, setNewInfo] = useState('')

  const { data: userInfo, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: contractABI,
    functionName: 'getUserInfo',
    args: [account as `0x${string}`],
  })

  const handleUpdateInfo = async () => {
    // TODO: 实现更新个人信息的功能
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          个人中心
        </h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">
        个人中心
      </h2>

      <div className="space-y-6">
        {/* 钱包地址 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            钱包地址
          </label>
          <div className="mt-1 p-3 bg-gray-50 rounded-lg">
            <code className="text-sm break-all">
              {account}
            </code>
          </div>
        </div>

        {/* 验证状态 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            验证状态
          </label>
          <div className="mt-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              userInfo?.[1] ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {userInfo?.[1] ? '已验证' : '未验证'}
            </span>
          </div>
        </div>

        {/* 个人信息 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            个人信息
          </label>
          {isEditing ? (
            <div className="mt-1 space-y-4">
              <textarea
                value={newInfo}
                onChange={(e) => setNewInfo(e.target.value)}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="请输入新的个人信息"
              />
              <div className="flex space-x-4">
                <button
                  onClick={handleUpdateInfo}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  保存
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 space-y-4">
              <p className="text-gray-700">
                {userInfo?.[0] || '暂无个人信息'}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-600"
              >
                编辑信息
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PersonalCenter 