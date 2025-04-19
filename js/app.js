// 页面状态管理
let userStatus = null;
let isAdminUser = false;

// 应用主入口
async function initApp() {
    try {
        console.log('初始化应用...');
        
        // 检查是否安装了 MetaMask
        if (typeof window.ethereum === 'undefined') {
            showMessage('请安装 MetaMask 钱包以便使用本应用', 'warning', 0);
            // 在页面添加 MetaMask 下载链接
            const connectSection = document.getElementById('walletStatus');
            if (connectSection) {
                const metamaskLink = document.createElement('div');
                metamaskLink.className = 'mt-4 text-center';
                metamaskLink.innerHTML = `
                    <p class="text-red-600 mb-2">检测到您尚未安装 MetaMask 钱包</p>
                    <a href="https://metamask.io/download/" target="_blank" 
                       class="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
                       <img src="https://metamask.io/images/metamask-fox.svg" class="h-6 w-6 inline-block mr-2">
                       下载 MetaMask
                    </a>
                `;
                connectSection.appendChild(metamaskLink);
            }
            return;
        }
        
        // 初始化钱包连接
        const isWalletConnected = await initWallet();
        
        // 如果钱包已连接，初始化合约
        if (isWalletConnected) {
            await initContract();
        }
        
        // 初始化注册表单
        initRegistrationForm();
        
        // 添加钱包事件监听
        window.addEventListener('walletConnected', handleWalletConnected);
        window.addEventListener('walletDisconnected', handleWalletDisconnected);
        
        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化失败:', error);
        showMessage('应用初始化失败: ' + error.message, 'error');
    }
}

// 初始化注册表单
function initRegistrationForm() {
    const registrationForm = document.getElementById('registrationForm');
    if (!registrationForm) return;
    
    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('email');
        const personalInfoInput = document.getElementById('personalInfo');
        
        if (!emailInput || !personalInfoInput) {
            showMessage('表单元素不存在', 'error');
            return;
        }
        
        const email = emailInput.value.trim();
        const personalInfo = personalInfoInput.value.trim();
        
        // 表单验证
        if (!email) {
            showMessage('请输入邮箱', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showMessage('请输入有效的邮箱格式', 'error');
            return;
        }
        
        if (!personalInfo) {
            showMessage('请输入个人信息', 'error');
            return;
        }
        
        if (personalInfo.length < 10) {
            showMessage('个人信息至少需要10个字符', 'error');
            return;
        }
        
        try {
            // 禁用提交按钮
            const submitButton = registrationForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = '提交中...';
            submitButton.classList.add('opacity-75', 'cursor-not-allowed');
            
            // 提交注册
            const result = await registerUser(email, personalInfo);
            
            if (result) {
                // 清空表单
                emailInput.value = '';
                personalInfoInput.value = '';
                
                // 更新UI
                await updateUserUI();
            }
        } catch (error) {
            console.error('注册失败:', error);
        } finally {
            // 恢复提交按钮
            const submitButton = registrationForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = '提交注册';
            submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    });
}

// 初始化管理员指南按钮
function initAdminGuideButton() {
    const adminGuideButton = document.getElementById('adminGuideButton');
    if (!adminGuideButton) return;
    
    adminGuideButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        // 创建弹窗
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.id = 'adminGuideModal';
        
        // 创建弹窗内容
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold">管理员登录指南</h2>
                    <button id="closeModal" class="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    <p>当前合约的管理员账户是部署合约的账户。根据您的部署日志，当前管理员账户地址为：</p>
                    <div class="bg-gray-100 p-3 rounded font-mono text-sm break-all">
                        0xE87df4e9951B39e580b23746c884e0cd7dFBA2d7
                    </div>
                    
                    <p class="font-semibold mt-4">如何在 MetaMask 中导入此账户：</p>
                    <ol class="list-decimal pl-5 space-y-2">
                        <li>打开 MetaMask 钱包扩展</li>
                        <li>点击右上角的账户头像</li>
                        <li>选择"导入账户"</li>
                        <li>选择"私钥"选项</li>
                        <li>输入管理员账户的私钥（请从您的部署环境中找到此私钥）</li>
                        <li>点击"导入"</li>
                    </ol>
                    
                    <p class="text-sm text-gray-600 mt-2">注意：如果您没有私钥，可能需要重新部署合约，并保存部署账户的私钥。</p>
                    
                    <div class="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm">
                        <p>如果您使用 Ganache 的确定性模式运行区块链（使用 --wallet.deterministic 选项），您可以尝试使用 Ganache 的第一个账户：</p>
                        <p class="font-mono mt-2 break-all">私钥: 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d</p>
                    </div>
                    
                    <p class="mt-4">成功导入账户后：</p>
                    <ol class="list-decimal pl-5 space-y-2">
                        <li>确保 MetaMask 已选择该账户</li>
                        <li>刷新页面</li>
                        <li>点击"连接钱包"按钮</li>
                    </ol>
                    
                    <p>如果该账户确实是管理员，系统会自动显示管理员面板。</p>
                </div>
            </div>
        `;
        
        // 添加到文档
        document.body.appendChild(modal);
        
        // 添加关闭按钮事件
        document.getElementById('closeModal').addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // 点击背景时关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    });
}

// 处理钱包连接事件
async function handleWalletConnected(event) {
    const account = event.detail.account;
    
    try {
        // 检查是否是管理员
        isAdminUser = await isAdmin(account);
        
        if (isAdminUser) {
            await loadAdminPanel();
        } else {
            await loadUserStatus(account);
        }
    } catch (error) {
        handleError(error);
    }
}

// 处理钱包断开连接事件
function handleWalletDisconnected() {
    // 隐藏所有面板
    toggleElement('userStatus', false);
    toggleElement('registerForm', false);
    toggleElement('userProfile', false);
    toggleElement('adminPanel', false);
    
    // 重置状态
    userStatus = null;
    isAdminUser = false;
}

// 加载用户状态
async function loadUserStatus(account) {
    try {
        const status = await getUserStatus(account);
        userStatus = status;
        
        // 更新状态显示
        const statusMessage = document.getElementById('statusMessage');
        if (status.exists) {
            if (status.isPending) {
                statusMessage.textContent = '您的注册申请正在等待管理员审核。';
                toggleElement('userStatus', true);
                toggleElement('registerForm', false);
                toggleElement('userProfile', false);
            } else if (status.isVerified) {
                await loadUserProfile(account);
                toggleElement('userStatus', false);
                toggleElement('registerForm', false);
                toggleElement('userProfile', true);
            } else {
                statusMessage.textContent = '您的注册申请已被拒绝，请重新注册。';
                toggleElement('userStatus', true);
                toggleElement('registerForm', true);
                toggleElement('userProfile', false);
            }
        } else {
            statusMessage.textContent = '您尚未注册，请填写注册表单。';
            toggleElement('userStatus', true);
            toggleElement('registerForm', true);
            toggleElement('userProfile', false);
        }
    } catch (error) {
        handleError(error);
    }
}

// 加载用户资料
async function loadUserProfile(account) {
    try {
        const info = await getUserInfo(account);
        
        document.getElementById('profileAddress').textContent = account;
        document.getElementById('profileEmail').textContent = info.email;
        document.getElementById('profileInfo').textContent = info.personalInfo;
        document.getElementById('profileTime').textContent = formatDate(info.registrationTime);
        document.getElementById('profileVerified').textContent = info.isVerified ? '已验证' : '未验证';
    } catch (error) {
        handleError(error);
    }
}

// 加载管理员面板
async function loadAdminPanel() {
    toggleElement('adminPanel', true);
    toggleElement('userStatus', false);
    toggleElement('registerForm', false);
    toggleElement('userProfile', false);
    
    try {
        const pendingUsers = await getPendingUsers();
        const pendingUsersContainer = document.getElementById('pendingUsers');
        pendingUsersContainer.innerHTML = '';
        
        if (pendingUsers.length === 0) {
            pendingUsersContainer.innerHTML = '<p class="text-gray-500">暂无待审核用户</p>';
            return;
        }
        
        for (const userAddress of pendingUsers) {
            const userInfo = await getUserInfo(userAddress);
            const userElement = createPendingUserElement(userAddress, userInfo);
            pendingUsersContainer.appendChild(userElement);
        }
    } catch (error) {
        handleError(error);
    }
}

// 创建待审核用户元素
function createPendingUserElement(address, info) {
    const div = document.createElement('div');
    div.className = 'bg-gray-50 p-4 rounded-lg';
    div.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <p class="font-medium">地址: ${address}</p>
                <p>邮箱: ${info.email}</p>
                <p>个人信息: ${info.personalInfo}</p>
                <p>注册时间: ${formatDate(info.registrationTime)}</p>
            </div>
            <div class="space-x-2">
                <button onclick="handleReview('${address}', true)" 
                    class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                    通过
                </button>
                <button onclick="handleReview('${address}', false)"
                    class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    拒绝
                </button>
            </div>
        </div>
    `;
    return div;
}

// 处理审核操作
async function handleReview(address, approved) {
    try {
        await reviewUser(address, approved);
        await loadAdminPanel(); // 重新加载管理员面板
    } catch (error) {
        handleError(error);
    }
}

// 在页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    initAdminGuideButton();
}); 