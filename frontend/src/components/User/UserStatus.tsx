import { useAccount } from 'wagmi'
import { Address } from 'viem'

// Define props interface
interface UserStatusProps {
  userStatus: number | null;
  refetchStatus: () => void;
}

export default function UserStatus({ userStatus, refetchStatus }: UserStatusProps) {
  const { isConnected } = useAccount()

  // Status mapping (0: NotRegistered, 1: Pending, 2: Approved, 3: Rejected)
  const statusMap: { [key: number]: { text: string; color: string } } = {
    0: { text: '您尚未注册，请填写注册表单。', color: 'text-blue-500' },
    1: { text: '您的注册申请正在等待管理员审核。', color: 'text-yellow-600' },
    2: { text: '您的身份已通过认证！', color: 'text-green-600' },
    3: { text: '您的注册申请已被拒绝，请重新注册。', color: 'text-red-600' },
  }

  const renderStatus = () => {
    if (!isConnected) {
      return <p className="text-gray-500">请先连接钱包查看状态。</p>
    }
    
    if (userStatus === null) {
      return <p className="text-gray-500">正在加载状态...</p>
    }

    const statusInfo = statusMap[userStatus];
    if (statusInfo) {
      return <p className={statusInfo.color}>{statusInfo.text}</p>
    }
    
    return <p className="text-gray-500">未知状态，请刷新页面重试。</p>
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">注册状态</h3>
      {renderStatus()}
       
      {/* Show refresh button except when approved */}
      {isConnected && userStatus !== null && userStatus !== 2 && (
        <button 
          onClick={refetchStatus}
          className="mt-3 text-sm text-blue-500 hover:text-blue-600 hover:underline"
        >
          刷新状态
        </button>
      )}
    </div>
  )
} 