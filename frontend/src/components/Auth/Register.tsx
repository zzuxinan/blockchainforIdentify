import { useState } from 'react'
import { useAccount, useContractWrite } from 'wagmi'
import { type Address } from 'viem'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract'

interface RegisterProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function Register({ onSuccess, onError }: RegisterProps) {
  const [email, setEmail] = useState('')
  const [personalInfo, setPersonalInfo] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { address } = useAccount()
  
  const { 
    writeContract: register,
    isPending,
    isSuccess,
    isError,
    error: writeError 
  } = useContractWrite()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // 输入验证
    if (!email || !personalInfo) {
      setError('请填写所有必填字段')
      return
    }

    if (!email.includes('@')) {
      setError('请输入有效的邮箱地址')
      return
    }

    if (personalInfo.length < 10) {
      setError('个人信息至少需要10个字符')
      return
    }

    try {
      await register({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'register',
        args: [email.toLowerCase().trim(), personalInfo.trim()]
      })
      
      if (isSuccess) {
        setSuccess(true)
        setEmail('')
        setPersonalInfo('')
        onSuccess?.()
      }
    } catch (err) {
      const errorMessage = writeError?.message || '注册失败，请重试'
      console.error('注册失败:', err)
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">用户注册</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          注册成功！
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="请输入邮箱"
            required
            disabled={isPending}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            个人信息
          </label>
          <textarea
            value={personalInfo}
            onChange={(e) => setPersonalInfo(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="请输入个人信息（至少10个字符）"
            required
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          disabled={isPending || !address}
          className={`w-full p-2 rounded text-white ${
            isPending || !address
              ? 'bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isPending ? '处理中...' : '注册'}
        </button>

        {!address && (
          <p className="mt-2 text-sm text-gray-500 text-center">
            请先连接钱包后再进行注册
          </p>
        )}
      </form>
    </div>
  )
} 