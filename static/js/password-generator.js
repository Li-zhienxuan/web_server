/**
 * 强密码生成器 - 独立版本
 * 为 LilyXUAN 个人站定制
 */

class PasswordGenerator {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('passwordHistory')) || [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.displayHistory();
        this.generatePassword(); // 页面加载时自动生成
    }

    bindEvents() {
        // 生成按钮
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generatePassword();
        });

        // 复制按钮
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyPassword();
        });

        // 清空历史记录
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });

        // 长度选择器
        document.querySelectorAll('.length-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectLength(e.target);
            });
        });
    }

    selectLength(selectedOption) {
        // 移除所有激活状态
        document.querySelectorAll('.length-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // 激活当前选项
        selectedOption.classList.add('active');
        
        // 重新生成密码
        this.generatePassword();
    }

    generatePassword() {
        const length = parseInt(document.querySelector('.length-option.active').dataset.length);
        const password = this.createPassword(length);
        
        this.displayPassword(password);
        this.updateStrengthIndicator(password);
        this.addToHistory(password);
    }

    createPassword(length) {
        const charSets = {
            upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lower: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '@#$%^&*'
        };

        let password = '';
        
        if (length === 16) {
            // 16位密码：6-5-5格式
            password = this.generateSegment(6, charSets) + '-' +
                      this.generateSegment(5, charSets) + '-' +
                      this.generateSegment(5, charSets);
        } else {
            // 18位密码：6-6-6格式  
            password = this.generateSegment(6, charSets) + '-' +
                      this.generateSegment(6, charSets) + '-' +
                      this.generateSegment(6, charSets);
        }

        return password;
    }

    generateSegment(length, charSets) {
        const allChars = charSets.upper + charSets.lower + charSets.numbers + charSets.symbols;
        let segment = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            segment += allChars[randomIndex];
        }
        
        return segment;
    }

    displayPassword(password) {
        const outputElement = document.getElementById('passwordOutput');
        outputElement.innerHTML = '';
        outputElement.textContent = password;
    }

    updateStrengthIndicator(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        let strength = 'weak';
        let strengthClass = 'weak';
        
        // 简单密码强度评估
        if (password.length >= 16) {
            const hasUpper = /[A-Z]/.test(password);
            const hasLower = /[a-z]/.test(password);
            const hasNumbers = /[0-9]/.test(password);
            const hasSymbols = /[@#$%^&*\-]/.test(password);
            
            const criteriaCount = [hasUpper, hasLower, hasNumbers, hasSymbols].filter(Boolean).length;
            
            if (criteriaCount === 4) {
                strength = '非常强';
                strengthClass = 'strong';
            } else if (criteriaCount === 3) {
                strength = '强';
                strengthClass = 'strong';
            } else if (criteriaCount === 2) {
                strength = '中等';
                strengthClass = 'good';
            } else {
                strength = '一般';
                strengthClass = 'fair';
            }
        }
        
        strengthFill.className = `strength-fill ${strengthClass}`;
        strengthText.textContent = strength;
    }

    addToHistory(password) {
        // 检查是否已存在相同密码
        if (!this.history.some(item => item.password === password)) {
            const timestamp = new Date().toLocaleString('zh-CN');
            this.history.unshift({ password, timestamp });
            
            // 限制历史记录数量
            if (this.history.length > 10) {
                this.history = this.history.slice(0, 10);
            }
            
            // 保存到本地存储
            localStorage.setItem('passwordHistory', JSON.stringify(this.history));
            
            // 更新显示
            this.displayHistory();
        }
    }

    displayHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                        <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p>暂无生成记录</p>
                </div>
            `;
            return;
        }
        
        historyList.innerHTML = this.history.map(item => `
            <div class="history-item">
                <span class="history-password">${item.password}</span>
                <span class="history-time">${item.timestamp}</span>
            </div>
        `).join('');
    }

    copyPassword() {
        const passwordElement = document.getElementById('passwordOutput');
        const password = passwordElement.textContent;
        
        if (password && !passwordElement.querySelector('.placeholder')) {
            navigator.clipboard.writeText(password).then(() => {
                this.showCopyFeedback();
            }).catch(err => {
                // 备用复制方法
                const textArea = document.createElement('textarea');
                textArea.value = password;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showCopyFeedback();
            });
        }
    }

    showCopyFeedback() {
        const copyBtn = document.getElementById('copyBtn');
        const originalHTML = copyBtn.innerHTML;
        
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
            </svg>
        `;
        copyBtn.style.color = '#10b981';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.color = '';
        }, 2000);
    }

    clearHistory() {
        if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
            this.history = [];
            localStorage.removeItem('passwordHistory');
            this.displayHistory();
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});