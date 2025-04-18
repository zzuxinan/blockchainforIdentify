import { useState, useEffect } from 'react'
import { useAccount, useContractRead, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract'
import { type BaseError } from 'viem'

interface PendingUser {
  address: string;
  email: string;
  personalInfo: string;
  registrationTime: number;
}

export default function AdminDashboard() {
  const { address } = useAccount()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  // 检查是否是管理员
  const { data: isAdmin, isError: isAdminError } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'isAdmin',
    args: [address as `0x${string}`]
  })

  // 获取待审核用户列表
  const { data: pendingUsersData, refetch: refetchPendingUsers } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPendingUsers'
  })

  const { writeContract } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: transactionHash,
  })

  // 更新待审核用户列表
  useEffect(() => {
    if (pendingUsersData) {
      try {
        const data = pendingUsersData as unknown as [string[], string[], string[], bigint[]]
        const [addresses, emails, personalInfos, registrationTimes] = data
        const users: PendingUser[] = addresses.map((addr, index) => ({
          address: addr,
          email: '[Hidden]',
          personalInfo: '[Hidden]',
          registrationTime: Number(registrationTimes[index])
        }))
        setPendingUsers(users)
      } catch (err) {
        console.error('解析待审核用户数据失败:', err)
        setPendingUsers([])
      }
      setIsLoading(false)
    }
  }, [pendingUsersData])

  const handleApprove = async (userAddress: string) => {
    try {
      setError('')
      setSuccess('')
      setProcessingUser(userAddress)

      const tx = await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'approveUser',
        args: [userAddress as `0x${string}`]
      })

      setTransactionHash(tx)
      setSuccess(`已通过用户 ${userAddress} 的注册申请`)
      await refetchPendingUsers()
    } catch (err) {
      const error = err as BaseError
      setError(`审核失败: ${error.message}`)
    } finally {
      setProcessingUser(null)
    }
  }

  const handleReject = async (userAddress: string) => {
    try {
      setError('')
      setSuccess('')
      setProcessingUser(userAddress)

      const tx = await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'rejectUser',
        args: [userAddress as `0x${string}`, '管理员拒绝']
      })

      setTransactionHash(tx)
      setSuccess(`已拒绝用户 ${userAddress} 的注册申请`)
      await refetchPendingUsers()
    } catch (err) {
      const error = err as BaseError
      setError(`拒绝失败: ${error.message}`)
    } finally {
      setProcessingUser(null)
    }
  }

  if (!address) {
    return <div className="p-4 text-center">请先连接钱包</div>
  }

  if (isAdminError) {
    return <div className="p-4 text-center text-red-600">检查管理员权限时出错</div>
  }

  if (!isAdmin) {
    return <div className="p-4 text-center text-yellow-600">您不是管理员</div>
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">管理员面板</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-4">待审核用户列表</h3>
        
        {isLoading ? (
          <div className="text-center py-4">加载中...</div>
        ) : pendingUsers.length === 0 ? (
          <div className="text-center py-4 text-gray-500">暂无待审核用户</div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.address} className="border rounded-lg p-4 bg-white shadow">
                <div className="mb-2">
                  <strong className="text-gray-700">钱包地址：</strong>
                  <div className="break-all text-sm">{user.address}</div>
                </div>
                <div className="mb-4">
                  <strong className="text-gray-700">注册时间：</strong>
                  <div className="text-sm">{new Date(user.registrationTime * 1000).toLocaleString()}</div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleApprove(user.address)}
                    disabled={isConfirming || processingUser === user.address}
                    className={`px-4 py-2 rounded ${
                      isConfirming || processingUser === user.address
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {isConfirming && processingUser === user.address ? '处理中...' : '通过'}
                  </button>
                  <button
                    onClick={() => handleReject(user.address)}
                    disabled={isConfirming || processingUser === user.address}
                    className={`px-4 py-2 rounded ${
                      isConfirming || processingUser === user.address
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {isConfirming && processingUser === user.address ? '处理中...' : '拒绝'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 