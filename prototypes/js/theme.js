/**
 * 主题切换功能
 * 支持白天模式（水墨淡彩）和黑夜模式（月夜山水）
 */

(function() {
    'use strict';

    // 主题配置
    const ThemeConfig = {
        light: {
            name: 'day',
            displayName: '日间',
            icon: '☀️',
            description: '水墨淡彩'
        },
        dark: {
            name: 'night',
            displayName: '夜间',
            icon: '🌙',
            description: '月夜山水'
        }
    };

    // 获取当前主题
    function getCurrentTheme() {
        const savedTheme = localStorage.getItem('stock-theme');
        if (savedTheme) {
            return savedTheme;
        }

        // 根据系统时间自动选择
        const hour = new Date().getHours();
        return (hour >= 18 || hour < 6) ? 'dark' : 'light';
    }

    // 设置主题
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('stock-theme', theme);
        updateThemeToggleButton(theme);
    }

    // 切换主题
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        // 添加切换动画效果
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);

        // 显示切换提示
        const themeInfo = ThemeConfig[newTheme];
        showNotification(`已切换到${themeInfo.displayName}模式：${themeInfo.description}`);
    }

    // 更新主题切换按钮显示
    function updateThemeToggleButton(theme) {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const themeInfo = ThemeConfig[theme];
            toggleBtn.innerHTML = `${themeInfo.icon} ${themeInfo.displayName}`;
        }
    }

    // 显示通知提示
    function showNotification(message) {
        // 移除已存在的通知
        const existingNotification = document.getElementById('theme-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 创建新通知
        const notification = document.createElement('div');
        notification.id = 'theme-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
            font-size: 14px;
        `;

        document.body.appendChild(notification);

        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 初始化主题切换按钮
    function initThemeToggle() {
        const navbar = document.querySelector('.navbar-right');
        if (!navbar) {
            console.warn('未找到导航栏右侧容器');
            return;
        }

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'themeToggle';
        toggleBtn.className = 'theme-toggle';
        toggleBtn.onclick = toggleTheme;

        navbar.insertBefore(toggleBtn, navbar.firstChild);
    }

    // 初始化主题
    function initTheme() {
        const currentTheme = getCurrentTheme();
        setTheme(currentTheme);
        initThemeToggle();
    }

    // 页面加载时初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }

    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        body {
            transition: opacity 0.1s ease;
        }
    `;
    document.head.appendChild(style);

    // 暴露全局方法（可选）
    window.ThemeManager = {
        toggle: toggleTheme,
        set: setTheme,
        get: getCurrentTheme
    };

})();
