import { useContractRead } from 'wagmi'
import { parseAbi } from 'viem'
import { CONTRACT_ADDRESS } from '../../config/contract'

interface VerificationHistoryProps {
  account: string
  onError: (error: string) => void
}

interface VerificationRecord {
  timestamp: bigint
  verifier: string
  result: boolean
}

const contractABI = [
  {
    name: 'getVerificationHistory',
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
        name: '',
        type: 'tuple[]',
        components: [
          {
            name: 'timestamp',
            type: 'uint256'
          },
          {
            name: 'verifier',
            type: 'string'
          },
          {
            name: 'result',
            type: 'bool'
          }
        ]
      }
    ]
  }
] as const

const VerificationHistory = ({ account, onError }: VerificationHistoryProps) => {
  const { data: history, isLoading } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: contractABI,
    functionName: 'getVerificationHistory',
    args: [account as `0x${string}`],
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          验证历史
        </h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const verificationHistory = (history || []) as VerificationRecord[]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">
        验证历史
      </h2>

      {verificationHistory.length > 0 ? (
        <div className="space-y-4">
          {verificationHistory.map((record, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(Number(record.timestamp) * 1000).toLocaleString()}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  record.result
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {record.result ? '验证通过' : '验证失败'}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                验证机构：{record.verifier}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">
            暂无验证历史记录
          </p>
        </div>
      )}
    </div>
  )
}

export default VerificationHistory 