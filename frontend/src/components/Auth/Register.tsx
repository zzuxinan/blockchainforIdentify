import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../../config/contract'
import { type BaseError } from 'viem'

type RegistrationState = 'idle' | 'signing' | 'confirming' | 'success' | 'error'

export default function Register() {
  const [email, setEmail] = useState('')
  const [personalInfo, setPersonalInfo] = useState('')
  const [phone, setPhone] = useState('')
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<RegistrationState>('idle')

  const { address } = useAccount()
  const { writeContract, isPending: isSigning } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isConfirmingError } = useWaitForTransactionReceipt({
    hash: transactionHash,
  })

  // 重置表单状态
  const resetState = () => {
    setError(null)
    setTransactionHash(undefined)
    setState('idle')
    // 不清除输入框，除非成功
  }

  // 处理错误
  const handleError = (err: unknown) => {
    const error = err as BaseError
    let errorMessage = '注册失败，请稍后重试'

    if (error.message.includes('User already registered')) {
      errorMessage = '该钱包地址已经注册'
    } else if (error.message.includes('rejected') || error.message.includes('denied')) {
      errorMessage = '您已拒绝交易签名'
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = '余额不足，无法完成交易'
    } else {
      // 对于其他未知错误，可以记录更详细的信息
      console.error("Registration Error:", error)
      errorMessage = `注册失败: ${error.shortMessage || error.message}`
    }
    setError(errorMessage)
    setState('error')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    resetState()

    if (!address) {
      setError('请先连接钱包')
      setState('error')
      return
    }

    if (!email || !personalInfo) {
      setError('请填写邮箱和个人信息')
      setState('error')
      return
    }

    setState('signing')
    const combinedInfo = phone ? `${personalInfo} (Phone: ${phone})` : personalInfo;

    try {
      const tx = await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'register',
        args: [email.toLowerCase().trim(), combinedInfo.trim()]
      })
      
      // 检查 tx 是否有效 (有些情况下 writeContract 可能不返回或返回 void?)
      if (tx) {
        setTransactionHash(tx)
        setState('confirming')
      } else {
          throw new Error('未能获取交易哈希')
      }

    } catch (err) {
      handleError(err)
      // 如果签名被拒绝，状态已经设置为 error，无需再次设置
      if (state !== 'error') {
          setState('idle') // 如果不是签名拒绝错误，则返回 idle
      }
    }
  }

  // 监听交易确认状态
  useEffect(() => {
    if (isConfirmed) {
      setState('success')
      // 成功后清空表单
      setEmail('')
      setPersonalInfo('')
      setPhone('')
    }
    if (isConfirmingError) {
        setError('交易确认失败，请检查区块链浏览器获取详情')
        setState('error')
    }
  }, [isConfirmed, isConfirmingError])

  const isLoading = state === 'signing' || state === 'confirming'

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">用户注册</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="请输入邮箱"
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">手机号 (可选)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="请输入手机号"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">个人信息</label>
          <textarea
            value={personalInfo}
            onChange={(e) => setPersonalInfo(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="请输入个人信息"
            disabled={isLoading}
            required
          />
        </div>

        {state === 'error' && error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {state === 'success' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  注册成功！您的申请已提交审核。
                  {transactionHash && (
                    <a 
                      href={`YOUR_BLOCK_EXPLORER_URL/tx/${transactionHash}`} // TODO: Replace with actual explorer URL if needed
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 font-medium text-green-600 hover:text-green-800 underline"
                    >
                      查看详情
                    </a>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {state === 'confirming' && (
           <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                 <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
               </div>
               <div className="ml-3">
                 <p className="text-sm text-blue-700">
                   交易已发送，正在等待区块链确认...
                    {transactionHash && (
                     <a 
                       href={`YOUR_BLOCK_EXPLORER_URL/tx/${transactionHash}`} // TODO: Replace with actual explorer URL if needed
                       target="_blank"
                       rel="noopener noreferrer"
                       className="ml-2 font-medium text-blue-600 hover:text-blue-800 underline"
                     >
                       查看详情
                     </a>
                   )}
                 </p>
               </div>
             </div>
           </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {state === 'signing' && '请在钱包中确认...'}
          {state === 'confirming' && '交易确认中...'}
          {(state === 'idle' || state === 'error' || state === 'success') && '注册'}
        </button>
      </form>
    </div>
  )
} 