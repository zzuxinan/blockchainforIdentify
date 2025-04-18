import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connectors, connect, error } = useConnect()
  const { disconnect } = useDisconnect()

  const handleConnect = () => {
    // 通常只使用第一个可用的 connector，一般是 MetaMask/Injected
    if (connectors[0]) {
      connect({ connector: connectors[0] })
    }
  }

  if (isConnected) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-sm text-gray-600">已连接: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}</div>
        <button 
          onClick={() => disconnect()} 
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          断开钱包
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button 
        onClick={handleConnect} // 使用 handleConnect
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
      >
        连接钱包
      </button>
      {error && <div className="text-red-500 text-xs mt-1">连接失败: {error.message}</div>}
    </div>
  )
} 