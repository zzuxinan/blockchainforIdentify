import { useAccount, useContractRead } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract'
import { Address } from 'viem'

export default function UserStatus() {
  const { address, isConnected } = useAccount()

  const { data: statusData, isLoading, error, refetch } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserStatus',
    args: address ? [address] : undefined,
    query: {
        enabled: isConnected && !!address,
    }
  })

  const renderStatus = () => {
    if (!isConnected) {
      return <p className="text-gray-500">请先连接钱包查看状态。</p>
    }
    if (isLoading) {
      return <p className="text-gray-500">正在加载状态...</p>
    }
    if (error) {
      if (error.message.includes('ContractFunctionExecutionError') && error.message.includes('function \"getUserStatus\"')) {
          return <p className="text-red-500">加载状态失败：合约 ABI 可能未更新或函数不存在。</p>
      }
      return <p className="text-red-500">加载状态失败: {error.shortMessage || error.message}</p>
    }
    
    const typedStatusData = statusData as unknown as readonly [boolean, boolean, boolean, bigint] | undefined | null;
    if (!typedStatusData || !Array.isArray(typedStatusData) || typedStatusData.length < 3) {
        return <p className="text-gray-500">未能获取到有效的状态信息。</p>
    }

    const [exists, isVerified, isPending] = typedStatusData;

    if (!exists) {
      return <p className="text-blue-500">您尚未注册。</p>
    }
    if (isPending) {
      return <p className="text-yellow-600">您的注册申请正在等待管理员审核。</p>
    }
    if (isVerified) {
      return <p className="text-green-600">您的注册已通过审核！</p>
    }
    
    return <p className="text-red-600">您的注册申请已被拒绝。</p>

  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">注册状态</h3>
      {renderStatus()}
       
      {isConnected && (
          <button 
            onClick={() => refetch()} 
            className="mt-3 text-xs text-blue-500 hover:underline"
          >
              刷新状态
          </button>
      )}
    </div>
  )
} 