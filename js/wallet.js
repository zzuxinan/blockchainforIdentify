// 钱包状态
let currentAccount = null;
let provider = null;
let signer = null;

// 初始化钱包
async function initWallet() {
    try {
        console.log('初始化钱包...');
        if (typeof window.ethereum === 'undefined') {
            showMessage('请安装MetaMask钱包', 'error');
            return false;
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        
        // 检查是否已连接
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            await handleAccountsChanged(accounts[0].address);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('初始化钱包失败:', error);
        showMessage('初始化钱包失败', 'error');
        return false;
    }
}

// 连接钱包
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            showMessage('请安装MetaMask钱包', 'error');
            return false;
        }

        updateConnectButtonState('connecting');
        
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        if (accounts && accounts.length > 0) {
            await handleAccountsChanged(accounts[0]);
            
            // 添加账户变化事件监听
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    handleDisconnect();
                } else {
                    handleAccountsChanged(accounts[0]);
                }
            });
            
            // 添加链变化事件监听
            window.ethereum.on('chainChanged', () => {
                console.log('网络已更改，刷新页面');
                window.location.reload();
            });
            
            return true;
        } else {
            updateConnectButtonState('disconnected');
            return false;
        }
    } catch (error) {
        console.error('连接钱包失败:', error);
        
        if (error.code === 4001) {
            showMessage('用户拒绝了连接请求', 'error');
        } else {
            showMessage('连接钱包失败: ' + error.message, 'error');
        }
        
        updateConnectButtonState('disconnected');
        return false;
    }
}

// 切换到正确的网络
async function switchToCorrectNetwork() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CONFIG.chainId }],
        });
    } catch (switchError) {
        // 如果网络不存在，则添加网络
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [NETWORK_CONFIG],
                });
            } catch (addError) {
                throw new Error('无法添加或切换网络');
            }
        } else {
            throw switchError;
        }
    }
}

// 处理账户变化
async function handleAccountsChanged(account) {
    try {
        if (!account) {
            handleDisconnect();
            return;
        }
        
        currentAccount = account;
        console.log('当前连接账户:', currentAccount);
        
        // 获取签名者
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        
        // 更新UI
        updateWalletUI(true);
        
        // 初始化合约
        await initContract();
        
        // 更新用户信息
        updateUserUI();
        
        return true;
    } catch (error) {
        console.error('处理账户变更时出错:', error);
        showMessage('钱包连接出错', 'error');
        return false;
    }
}

// 处理断开连接
function handleDisconnect() {
    currentAccount = null;
    provider = null;
    signer = null;
    updateWalletUI(false);
    showMessage('已断开钱包连接', 'info');
}

// 更新钱包UI
function updateWalletUI(isConnected) {
    const accountDisplay = document.getElementById('accountDisplay');
    const connectButton = document.getElementById('connectWallet');
    const userStatus = document.getElementById('userStatus');
    const registerForm = document.getElementById('registerForm');
    const userProfile = document.getElementById('userProfile');
    const adminPanel = document.getElementById('adminPanel');
    
    if (!accountDisplay || !connectButton) {
        console.warn('未找到钱包UI元素（accountDisplay 或 connectWallet）');
        return;
    }
    
    if (isConnected && currentAccount) {
        // 显示钱包地址
        accountDisplay.textContent = formatAddress(currentAccount);
        updateConnectButtonState('connected');
        
        // 显示用户状态区域
        if (userStatus) userStatus.classList.remove('hidden');
    } else {
        // 重置状态
        accountDisplay.textContent = '未连接钱包';
        updateConnectButtonState('disconnected');
        
        // 隐藏所有需要登录的界面
        if (userStatus) userStatus.classList.add('hidden');
        if (registerForm) registerForm.classList.add('hidden');
        if (userProfile) userProfile.classList.add('hidden');
        if (adminPanel) adminPanel.classList.add('hidden');
    }
}

// 更新连接按钮状态
function updateConnectButtonState(state) {
    const connectButton = document.getElementById('connectWallet');
    if (!connectButton) return;
    
    switch(state) {
        case 'connecting':
            connectButton.textContent = '连接中...';
            connectButton.disabled = true;
            connectButton.classList.add('opacity-75', 'cursor-not-allowed');
            break;
        case 'connected':
            connectButton.textContent = '已连接';
            connectButton.disabled = true;
            connectButton.classList.add('opacity-75', 'cursor-not-allowed');
            connectButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            connectButton.classList.add('bg-green-500', 'hover:bg-green-600');
            break;
        case 'disconnected':
        default:
            connectButton.textContent = '连接钱包';
            connectButton.disabled = false;
            connectButton.classList.remove('opacity-75', 'cursor-not-allowed');
            connectButton.classList.remove('bg-green-500', 'hover:bg-green-600');
            connectButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
            break;
    }
}

// 获取当前账户
function getCurrentAccount() {
    return currentAccount;
}

// 获取签名者
function getSigner() {
    return signer;
}

// 获取提供者
function getProvider() {
    return provider;
}

// 添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    const connectButton = document.getElementById('connectWallet');
    if (connectButton) {
        connectButton.addEventListener('click', connectWallet);
    } else {
        console.warn('未找到连接钱包按钮');
    }
}); 