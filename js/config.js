// 合约配置
const CONTRACT_CONFIG = {
    address: '0x7b08168685DBd92797CC9b72a8dc62C1976e493C', // 这里填入已部署的合约地址
    abi: [
        // 用户注册
        "function register(string email, string personalInfo) external",
        
        // 用户信息查询
        "function users(address user) external view returns (string email, string personalInfo, uint256 registrationTime, bool isVerified)",
        
        // 用户状态查询
        "function getUserStatus(address user) external view returns (bool exists, bool isVerified, bool isPending)",
        
        // 管理员功能
        "function isAdmin(address user) external view returns (bool)",
        "function getPendingUsers() external view returns (address[] memory)",
        "function approveUser(address user) external",
        "function rejectUser(address user) external"
    ]
};

// 网络配置
const NETWORK_CONFIG = {
    chainId: '0x539', // 对应十进制 1337，即 Ganache 默认链ID
    chainName: 'Ganache Local',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['http://localhost:8545'],
}; 