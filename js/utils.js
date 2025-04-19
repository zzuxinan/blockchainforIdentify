// 格式化时间戳
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// 显示消息
function showMessage(message, type = 'info', duration = 3000) {
    const messageBox = document.getElementById('messageBox');
    if (!messageBox) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = `p-4 mb-2 rounded-md shadow-md text-sm flex items-center justify-between animate-fade-in
        ${type === 'success' ? 'bg-green-100 text-green-800' : 
        type === 'error' ? 'bg-red-100 text-red-800' : 
        type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
        'bg-blue-100 text-blue-800'}`;
    
    messageElement.innerHTML = `
        <span>${message}</span>
        <button class="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none">&times;</button>
    `;
    
    messageBox.appendChild(messageElement);
    
    // 添加关闭按钮功能
    const closeButton = messageElement.querySelector('button');
    closeButton.addEventListener('click', () => {
        messageElement.classList.add('animate-fade-out');
        setTimeout(() => messageElement.remove(), 300);
    });
    
    // 自动消失
    if (duration > 0) {
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.classList.add('animate-fade-out');
                setTimeout(() => messageElement.remove(), 300);
            }
        }, duration);
    }
}

// 显示加载状态
function showLoading(element, text = '加载中...') {
    const originalContent = element.innerHTML;
    element.disabled = true;
    element.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        ${text}
    `;
    return () => {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// 显示/隐藏元素
function toggleElement(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('hidden', !show);
    }
}

// 处理错误信息
function handleError(error) {
    console.error('Error:', error);
    let message = '操作失败，请重试';
    
    if (error.message.includes('User already registered')) {
        message = '该钱包地址已经注册';
    } else if (error.message.includes('user rejected transaction')) {
        message = '您已取消操作';
    } else if (error.message.includes('insufficient funds')) {
        message = '账户余额不足';
    }
    
    showMessage(message, 'error');
}

// 格式化日期时间
function formatDateTime(timestamp) {
    if (!timestamp) return '未知';
    
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 缩短地址显示
function formatAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 验证邮箱格式
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 添加动画类
document.head.insertAdjacentHTML('beforeend', `
<style>
    .animate-fade-in {
        animation: fadeIn 0.3s ease-in-out;
    }
    .animate-fade-out {
        animation: fadeOut 0.3s ease-in-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
</style>
`); 