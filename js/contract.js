// 合约实例
let contract = null;

// 初始化合约
async function initContract() {
    try {
        console.log('正在初始化合约...');
        
        if (!CONTRACT_CONFIG || !CONTRACT_CONFIG.address) {
            console.error('合约配置缺失');
            showMessage('合约配置错误', 'error');
            return null;
        }
        
        console.log('合约地址:', CONTRACT_CONFIG.address);
        
        if (!window.ethereum) {
            throw new Error('请安装 MetaMask');
        }
        
        if (!getSigner()) {
            throw new Error('未连接钱包');
        }

        // 创建合约实例
        contract = new ethers.Contract(
            CONTRACT_CONFIG.address,
            CONTRACT_CONFIG.abi,
            getSigner()
        );
        
        console.log('合约初始化成功');
        return contract;
    } catch (error) {
        console.error('合约初始化失败:', error);
        showMessage('合约初始化失败: ' + error.message, 'error');
        return null;
    }
}

// 检查用户状态
async function checkUserStatus() {
    try {
        if (!contract || !getCurrentAccount()) {
            console.warn('合约或账户未初始化');
            return null;
        }
        
        const status = await contract.getUserStatus(getCurrentAccount());
        return {
            exists: status[0],
            isVerified: status[1],
            isPending: status[2]
        };
    } catch (error) {
        console.error('获取用户状态失败:', error);
        showMessage('获取用户状态失败', 'error');
        return null;
    }
}

// 获取用户信息
async function getUserInfo() {
    try {
        if (!contract || !getCurrentAccount()) {
            console.warn('合约或账户未初始化');
            return null;
        }
        
        const userInfo = await contract.users(getCurrentAccount());
        return {
            email: userInfo[0],
            personalInfo: userInfo[1],
            registrationTime: Number(userInfo[2]),
            isVerified: userInfo[3]
        };
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return null;
    }
}

// 注册用户
async function registerUser(email, personalInfo) {
    try {
        if (!contract) {
            throw new Error('合约未初始化');
        }
        
        if (!getCurrentAccount()) {
            throw new Error('未连接钱包');
        }
        
        // 验证表单
        if (!email || !personalInfo) {
            throw new Error('请填写完整信息');
        }
        
        if (!isValidEmail(email)) {
            throw new Error('请输入有效的邮箱地址');
        }
        
        showMessage('正在提交注册交易...', 'info');
        
        // 发送交易
        const tx = await contract.register(
            email.toLowerCase().trim(),
            personalInfo.trim()
        );
        
        showMessage('交易已提交，等待确认...', 'info');
        
        // 等待交易确认
        const receipt = await tx.wait();
        
        showMessage('注册成功！等待管理员审核', 'success');
        return receipt;
    } catch (error) {
        console.error('注册失败:', error);
        
        // 处理特定错误
        if (error.message.includes('User already registered')) {
            showMessage('该钱包地址已注册', 'error');
        } else {
            showMessage('注册失败: ' + error.message, 'error');
        }
        
        return null;
    }
}

// 检查是否为管理员
async function isAdmin() {
    try {
        if (!contract || !getCurrentAccount()) {
            return false;
        }
        
        const result = await contract.isAdmin(getCurrentAccount());
        console.log('管理员检查结果:', result, '账户:', getCurrentAccount());
        return result;
    } catch (error) {
        console.error('检查管理员权限失败:', error);
        return false;
    }
}

// 获取待审核用户列表
async function getPendingUsers() {
    try {
        if (!contract) {
            throw new Error('合约未初始化');
        }
        
        return await contract.getPendingUsers();
    } catch (error) {
        console.error('获取待审核用户失败:', error);
        showMessage('获取待审核用户失败', 'error');
        return [];
    }
}

// 审核用户
async function reviewUser(userAddress, approved) {
    try {
        if (!contract) {
            throw new Error('合约未初始化');
        }
        
        const functionName = approved ? 'approveUser' : 'rejectUser';
        
        showMessage('提交审核交易...', 'info');
        const tx = await contract[functionName](userAddress);
        
        showMessage('交易已提交，等待确认...', 'info');
        const receipt = await tx.wait();
        
        showMessage(`已${approved ? '批准' : '拒绝'}用户`, 'success');
        return receipt;
    } catch (error) {
        console.error('审核用户失败:', error);
        showMessage('审核用户失败: ' + error.message, 'error');
        return null;
    }
}

// 更新用户 UI
async function updateUserUI() {
    try {
        if (!getCurrentAccount()) {
            return;
        }
        
        // 检查用户状态和信息
        const status = await checkUserStatus();
        const statusMessage = document.getElementById('statusMessage');
        const registerForm = document.getElementById('registerForm');
        const userProfile = document.getElementById('userProfile');
        const adminPanel = document.getElementById('adminPanel');
        
        // 如果UI元素不存在，提前返回
        if (!statusMessage || !registerForm || !userProfile) {
            return;
        }
        
        // 检查是否是管理员
        const adminStatus = await isAdmin();
        console.log('当前用户是否为管理员:', adminStatus);
        
        if (adminStatus) {
            // 显示管理员面板
            statusMessage.textContent = '您是管理员';
            adminPanel.classList.remove('hidden');
            registerForm.classList.add('hidden');
            userProfile.classList.add('hidden');
            
            // 加载待审核用户
            await loadPendingUsers();
        } else if (status && status.exists) {
            // 用户已注册
            adminPanel.classList.add('hidden');
            
            if (status.isVerified) {
                statusMessage.textContent = '您的账户已验证通过';
                userProfile.classList.remove('hidden');
                registerForm.classList.add('hidden');
                
                // 加载用户资料
                await loadUserProfile();
            } else if (status.isPending) {
                statusMessage.textContent = '您的账户正在等待审核';
                userProfile.classList.add('hidden');
                registerForm.classList.add('hidden');
            } else {
                statusMessage.textContent = '您的账户未通过审核';
                userProfile.classList.add('hidden');
                registerForm.classList.add('hidden');
            }
        } else {
            // 用户未注册
            adminPanel.classList.add('hidden');
            statusMessage.textContent = '您尚未注册，请完成注册';
            registerForm.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
    } catch (error) {
        console.error('更新用户UI失败:', error);
    }
}

// 加载用户资料
async function loadUserProfile() {
    try {
        const userInfo = await getUserInfo();
        if (!userInfo) return;
        
        // 更新资料显示
        document.getElementById('profileAddress').textContent = getCurrentAccount();
        document.getElementById('profileEmail').textContent = userInfo.email;
        document.getElementById('profileInfo').textContent = userInfo.personalInfo;
        document.getElementById('profileTime').textContent = formatDateTime(userInfo.registrationTime);
        document.getElementById('profileVerified').textContent = userInfo.isVerified ? '已验证' : '未验证';
    } catch (error) {
        console.error('加载用户资料失败:', error);
    }
}

// 加载待审核用户
async function loadPendingUsers() {
    try {
        const pendingUsersList = document.getElementById('pendingUsers');
        if (!pendingUsersList) return;
        
        // 清空列表
        pendingUsersList.innerHTML = '';
        
        // 获取待审核用户
        const pendingUsers = await getPendingUsers();
        
        if (pendingUsers.length === 0) {
            pendingUsersList.innerHTML = '<p class="text-gray-500">没有待审核的用户</p>';
            return;
        }
        
        // 为每个待审核用户创建UI
        for (const userAddress of pendingUsers) {
            const userInfo = await contract.users(userAddress);
            
            const userCard = document.createElement('div');
            userCard.className = 'bg-gray-50 p-4 rounded-md border border-gray-200';
            userCard.innerHTML = `
                <div class="mb-2">
                    <span class="font-medium">地址:</span> 
                    <span class="text-sm break-all">${userAddress}</span>
                </div>
                <div class="mb-2">
                    <span class="font-medium">邮箱:</span> 
                    <span>${userInfo[0]}</span>
                </div>
                <div class="mb-4">
                    <span class="font-medium">个人信息:</span> 
                    <p class="text-sm mt-1">${userInfo[1]}</p>
                </div>
                <div class="flex space-x-2">
                    <button data-address="${userAddress}" data-action="approve" 
                        class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                        批准
                    </button>
                    <button data-address="${userAddress}" data-action="reject" 
                        class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                        拒绝
                    </button>
                </div>
            `;
            
            pendingUsersList.appendChild(userCard);
            
            // 添加按钮事件
            const approveBtn = userCard.querySelector('[data-action="approve"]');
            const rejectBtn = userCard.querySelector('[data-action="reject"]');
            
            approveBtn.addEventListener('click', () => handleReview(userAddress, true));
            rejectBtn.addEventListener('click', () => handleReview(userAddress, false));
        }
    } catch (error) {
        console.error('加载待审核用户失败:', error);
        showMessage('加载待审核用户失败', 'error');
    }
}

// 处理用户审核
async function handleReview(userAddress, approved) {
    try {
        await reviewUser(userAddress, approved);
        // 刷新列表
        await loadPendingUsers();
    } catch (error) {
        console.error('处理用户审核失败:', error);
    }
} 