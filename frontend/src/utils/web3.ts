import { Hash, keccak256, toBytes } from 'viem'

export const hashData = (data: string): Hash => {
  const bytes = toBytes(data.toLowerCase().trim())
  return keccak256(bytes)
}

export const shortenAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validatePersonalInfo = (info: string): boolean => {
  return info.length >= 10
} 