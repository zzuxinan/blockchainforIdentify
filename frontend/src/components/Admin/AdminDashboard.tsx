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
  const [lastTxHash, setLastTxHash] = useState<`0x${string}` | undefined>()

  // Get error and loading states from the hook
  const { 
    data: pendingUsersData, 
    refetch: refetchPendingUsers, 
    error: pendingUsersError, 
    isLoading: isPendingUsersLoading 
  } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getPendingUsers'
  })

  const { writeContract, data: writeContractResultHash, isPending: isWritePending, isSuccess: isWriteSuccess, error: writeError } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: lastTxHash,
  })

  // Update待审核用户列表
  useEffect(() => {
    // Log raw data before parsing
    console.log('AdminDashboard: raw pendingUsersData:', pendingUsersData);
    if (pendingUsersData) {
      try {
        console.log('AdminDashboard: Attempting to parse pendingUsersData...');
        const data = pendingUsersData as unknown as [string[], string[], string[], bigint[]]
        // Add check for array structure
        if (!Array.isArray(data) || data.length < 4 || !Array.isArray(data[0])) {
          console.error('AdminDashboard: Unexpected data structure received:', data);
          throw new Error('Unexpected data structure for pending users.');
        }
        const [addresses, emails, personalInfos, registrationTimes] = data
        console.log('AdminDashboard: Mapped users:', addresses.map((addr, index) => ({ address: addr, registrationTime: Number(registrationTimes[index]) }))); // Log mapped data
        const users: PendingUser[] = addresses.map((addr, index) => ({
          address: addr,
          email: '[Hidden]', // Keep hidden for now
          personalInfo: '[Hidden]', // Keep hidden for now
          registrationTime: Number(registrationTimes[index])
        }))
        setPendingUsers(users)
      } catch (err) {
        console.error('AdminDashboard: 解析待审核用户数据失败 (Error during parsing):', err)
        // Display parsing error in the UI
        setError(`Failed to parse pending user data: ${err instanceof Error ? err.message : String(err)}`);
        setPendingUsers([]) // Clear users on parsing error
      }
    } else if (!isPendingUsersLoading && !pendingUsersError) {
        // Handle case where data is null/undefined after loading finishes without error
        console.log('AdminDashboard: pendingUsersData is null or undefined after loading.');
        setPendingUsers([]);
    }
  }, [pendingUsersData, isPendingUsersLoading, pendingUsersError]) // Add hook state dependencies

  // Effect to handle read errors
  useEffect(() => {
    if (pendingUsersError) {
      console.error("AdminDashboard: Error fetching pending users:", pendingUsersError);
      setError(`Error fetching pending users list: ${pendingUsersError.shortMessage || pendingUsersError.message}`);
      setPendingUsers([]); // Clear users on fetch error
    }
  }, [pendingUsersError]);

  useEffect(() => {
    if (isWriteSuccess && writeContractResultHash) {
        setLastTxHash(writeContractResultHash);
    }
    if (writeError) {
      setError(`Transaction Error: ${(writeError as BaseError).shortMessage || writeError.message}`);
      setProcessingUser(null);
    }
  }, [isWriteSuccess, writeContractResultHash, writeError]);

  useEffect(() => {
    if (isTxSuccess) {
      setSuccess(`User action confirmed for hash: ${lastTxHash}`);
      refetchPendingUsers();
      setProcessingUser(null);
      setLastTxHash(undefined);
    }
  }, [isTxSuccess, lastTxHash, refetchPendingUsers]);

  const handleApprove = (userAddress: string) => {
    setError('')
    setSuccess('')
    setProcessingUser(userAddress)
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'approveUser',
      args: [userAddress as `0x${string}`]
    })
  }

  const handleReject = (userAddress: string) => {
    setError('')
    setSuccess('')
    setProcessingUser(userAddress)
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'rejectUser',
      args: [userAddress as `0x${string}`, '管理员拒绝']
    })
  }

  if (!address) {
    return <div className="p-4 text-center">请先连接钱包</div>
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
        
        {/* Use isPendingUsersLoading directly for the loading indicator */} 
        {isPendingUsersLoading ? (
          <div className="text-center py-4">加载中...</div>
        // Show error ONLY if not loading and there is an error message set
        ) : error && pendingUsers.length === 0 ? ( 
          <div className="text-center py-4 text-red-500">加载待审核用户列表失败</div>
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
                    disabled={isWritePending || isConfirming}
                    className={`px-4 py-2 rounded ${
                      (isWritePending || isConfirming) && processingUser === user.address
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    {(isWritePending || isConfirming) && processingUser === user.address ? '处理中...' : '通过'}
                  </button>
                  <button
                    onClick={() => handleReject(user.address)}
                    disabled={isWritePending || isConfirming}
                    className={`px-4 py-2 rounded ${
                      (isWritePending || isConfirming) && processingUser === user.address
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {(isWritePending || isConfirming) && processingUser === user.address ? '处理中...' : '拒绝'}
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