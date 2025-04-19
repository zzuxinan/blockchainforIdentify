/**
 * 将时间戳格式化为本地日期时间字符串
 * @param timestamp 时间戳（秒）
 * @returns 格式化后的日期时间字符串
 */
export function formatDate(timestamp: number): string {
  // 将秒转换为毫秒
  const date = new Date(timestamp * 1000);
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
} 