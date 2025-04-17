import { http, createConfig } from 'wagmi'
import { type Chain } from 'viem'

// 定义本地开发网络
export const localhost: Chain = {
  id: 1337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Local Explorer', url: 'http://localhost:8545' },
  },
  testnet: true
}

// 配置wagmi客户端
export const config = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
})

// 导出类型
export type Config = typeof config 