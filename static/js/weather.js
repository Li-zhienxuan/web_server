// 主题切换功能
class ThemeManager {
    constructor() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.themeIcon = this.themeToggleBtn?.querySelector('i');
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            if (this.themeIcon) {
                this.themeIcon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }

        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        if (this.themeIcon) {
            this.themeIcon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        localStorage.setItem('theme', newTheme);
    }
}

// 选项卡功能
class TabManager {
    constructor() {
        this.tabs = document.querySelectorAll('.tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.init();
    }

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });
    }

    switchTab(activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        
        this.tabs.forEach(t => t.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.remove('active'));
        
        activeTab.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }
}

// 时间显示功能
class TimeDisplay {
    constructor() {
        this.timeElement = document.getElementById('current-time');
        this.init();
    }

    init() {
        if (!this.timeElement) {
            console.warn('未找到时间显示元素 #current-time');
            return;
        }
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const pad = n => String(n).padStart(2, '0');
        
        this.timeElement.textContent = 
            `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${
                weekdays[now.getDay()]
            } ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    }
}

// 天气功能 - 修复版本
class WeatherWidget {
    constructor() {
        this.ipElement = document.getElementById('visitor-ip');
        this.locationElement = document.getElementById('weather-location');
        this.tempElement = document.getElementById('weather-temp');
        this.descElement = document.getElementById('weather-desc');
        this.iconElement = document.getElementById('weather-icon');
        
        // 检查必要元素是否存在
        if (!this.locationElement || !this.tempElement) {
            console.warn('天气小部件所需元素未找到');
            return;
        }
        
        this.init();
    }

    async init() {
        try {
            const data = await this.getIpData();
            await this.processWeatherData(data);
        } catch (error) {
            console.warn('天气数据获取失败:', error);
            this.setDefaultDisplay();
        }
    }

    async getIpData() {
        // 使用更稳定的IP API服务
        const services = [
            'https://api.ipify.org?format=json',
            'https://jsonip.com/',
            'https://api.db-ip.com/v2/free/self'
        ];

        for (const url of services) {
            try {
                const data = await this.fetchWithTimeout(url, 5000);
                if (data && (data.ip || data.ipAddress)) {
                    // 获取位置信息的备用服务
                    const ip = data.ip || data.ipAddress;
                    const locationData = await this.fetchWithTimeout(`http://ip-api.com/json/${ip}`, 5000);
                    return { ip, ...locationData };
                }
            } catch (error) {
                console.log(`IP服务 ${url} 失败:`, error.message);
                continue;
            }
        }
        return null;
    }

    async processWeatherData(data) {
        let lat = null, lon = null;

        if (data) {
            this.updateIpDisplay(data);
            lat = data.lat || data.latitude;
            lon = data.lon || data.longitude;
            
            // 如果IP API没有返回位置，使用默认位置（上海）
            if (!lat || !lon) {
                lat = 31.2304;
                lon = 121.4737;
                this.updateLocationDisplay('上海 · 中国');
            }
        } else {
            // 完全失败时使用默认位置
            lat = 31.2304;
            lon = 121.4737;
            this.updateLocationDisplay('默认位置');
            if (this.ipElement) this.ipElement.textContent = 'IP: 无法获取';
        }

        if (lat != null && lon != null) {
            await this.fetchWeatherData(lat, lon);
        } else {
            this.setDefaultWeather();
        }
    }

    updateIpDisplay(data) {
        const ip = data.ip || '—';
        if (this.ipElement) this.ipElement.textContent = `IP: ${ip}`;
        
        const city = data.city || '';
        const region = data.regionName || data.region || '';
        const country = data.country || data.countryCode || '';
        const location = [city, region, country].filter(Boolean).join(' · ') || '未知位置';
        if (this.locationElement) this.locationElement.textContent = location;
    }

    updateLocationDisplay(text) {
        if (this.locationElement) this.locationElement.textContent = text;
    }

    async fetchWeatherData(lat, lon) {
        // 使用更可靠的天气API
        const weatherUrls = [
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`,
            `https://api.weather.gov/points/${lat},${lon}`
        ];

        for (const url of weatherUrls) {
            try {
                const weatherData = await this.fetchWithTimeout(url, 6000);
                if (weatherData && weatherData.current_weather) {
                    this.updateWeatherDisplay(weatherData.current_weather);
                    return;
                }
            } catch (error) {
                console.log(`天气服务 ${url} 失败:`, error.message);
                continue;
            }
        }
        
        // 所有天气服务都失败
        this.setWeatherError();
    }

    updateWeatherDisplay(weather) {
        const temp = weather.temperature;
        const code = weather.weathercode;
        const wind = weather.windspeed;

        if (this.tempElement) {
            this.tempElement.textContent = temp != null ? `${Number(temp).toFixed(1)}°C` : '--°C';
        }
        if (this.descElement) {
            this.descElement.textContent = `${this.weatherCodeToText(code)} · 风 ${wind ?? '--'} km/h`;
        }
        if (this.iconElement) {
            this.iconElement.textContent = this.weatherCodeToEmoji(code);
        }
    }

    setDefaultWeather() {
        if (this.descElement) this.descElement.textContent = '天气服务暂不可用';
        if (this.tempElement) this.tempElement.textContent = '--°C';
        if (this.iconElement) this.iconElement.textContent = '🌤️';
    }

    setWeatherError() {
        if (this.descElement) this.descElement.textContent = '天气数据获取失败';
        if (this.tempElement) this.tempElement.textContent = '--°C';
        if (this.iconElement) this.iconElement.textContent = '❓';
    }

    setDefaultDisplay() {
        if (this.ipElement) this.ipElement.textContent = 'IP: 获取中...';
        if (this.locationElement) this.locationElement.textContent = '位置信息加载中';
        if (this.descElement) this.descElement.textContent = '天气信息加载中';
        if (this.tempElement) this.tempElement.textContent = '--°C';
        if (this.iconElement) this.iconElement.textContent = '⏳';
    }

    async fetchWithTimeout(url, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, { 
                signal: controller.signal,
                mode: 'cors'
            });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    weatherCodeToText(code) {
        const codes = {
            0: '晴朗', 1: '晴朗', 2: '晴朗', 3: '多云',
            45: '雾', 48: '雾',
            51: '小雨', 53: '小雨', 55: '小雨',
            61: '小雨', 63: '小雨', 65: '小雨',
            71: '小雪', 73: '小雪', 75: '小雪', 77: '小雪',
            80: '阵雨', 81: '阵雨', 82: '阵雨',
            95: '雷暴', 96: '雷暴', 99: '雷暴'
        };
        return codes[code] || '天气多变';
    }

    weatherCodeToEmoji(code) {
        const emojis = {
            0: '☀️', 1: '☀️', 2: '☀️', 3: '⛅',
            45: '🌫️', 48: '🌫️',
            51: '🌧️', 53: '🌧️', 55: '🌧️',
            61: '🌧️', 63: '🌧️', 65: '🌧️',
            71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️',
            80: '🌦️', 81: '🌦️', 82: '🌦️',
            95: '⛈️', 96: '⛈️', 99: '⛈️'
        };
        return emojis[code] || '🌤️';
    }
}

// PWA功能 - 移除Service Worker注册
class PWAHandler {
    constructor() {
        this.installBtn = document.getElementById('install-btn');
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            if (this.installBtn) {
                this.installBtn.style.display = 'inline-flex';
            }
        });

        if (this.installBtn) {
            this.installBtn.addEventListener('click', () => this.installApp());
        }

        // 注释掉Service Worker注册，避免404错误
        // this.registerServiceWorker();
    }

    async installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const choiceResult = await this.deferredPrompt.userChoice;
        
        this.deferredPrompt = null;
        if (this.installBtn) {
            this.installBtn.style.display = 'none';
        }
    }

    // registerServiceWorker() {
    //     if ('serviceWorker' in navigator) {
    //         window.addEventListener('load', () => {
    //             navigator.serviceWorker.register('/service-worker.js').catch(err => {
    //                 console.warn('SW 注册失败:', err);
    //             });
    //         });
    //     }
    // }
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    console.log('初始化网站功能...');
    
    try {
        new ThemeManager();
        new TabManager();
        new TimeDisplay();
        new WeatherWidget();
        new PWAHandler();
        
        console.log('所有功能初始化完成');
    } catch (error) {
        console.error('功能初始化失败:', error);
    }
});