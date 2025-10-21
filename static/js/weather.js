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
        if (!this.timeElement) return;
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

// 天气功能
class WeatherWidget {
    constructor() {
        this.ipElement = document.getElementById('visitor-ip');
        this.locationElement = document.getElementById('weather-location');
        this.tempElement = document.getElementById('weather-temp');
        this.descElement = document.getElementById('weather-desc');
        this.iconElement = document.getElementById('weather-icon');
        this.init();
    }

    async init() {
        try {
            const data = await this.getIpData();
            await this.processWeatherData(data);
        } catch (error) {
            this.handleError();
        }
    }

    async getIpData() {
        const services = [
            'https://ipapi.co/json/',
            'https://ipwho.is/json/'
        ];

        for (const url of services) {
            try {
                const data = await this.fetchWithTimeout(url, 6000);
                if (data && (data.ip || data.success === true || data.ip_address)) {
                    return data;
                }
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    async processWeatherData(data) {
        let lat = null, lon = null;

        if (data) {
            this.updateIpDisplay(data);
            lat = data.latitude ?? data.lat;
            lon = data.longitude ?? data.lon;
        }

        if (lat == null || lon == null) {
            const geoData = await this.getGeolocation();
            if (geoData) {
                lat = geoData.latitude;
                lon = geoData.longitude;
                this.updateLocationDisplay('通过浏览器定位');
            }
        }

        if (lat != null && lon != null) {
            await this.fetchWeatherData(lat, lon);
        } else {
            this.setDefaultWeather();
        }
    }

    updateIpDisplay(data) {
        const ip = data.ip || data.ip_address || '—';
        if (this.ipElement) this.ipElement.textContent = `IP: ${ip}`;
        
        const city = data.city || '';
        const region = data.region || data.regionName || '';
        const country = data.country_name || data.country || '';
        const location = [city, region, country].filter(Boolean).join(' · ') || '未知位置';
        if (this.locationElement) this.locationElement.textContent = location;
    }

    updateLocationDisplay(text) {
        if (this.locationElement) this.locationElement.textContent = text;
    }

    async fetchWeatherData(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current_weather=true&timezone=auto`;
        
        try {
            const weatherData = await this.fetchWithTimeout(url, 7000);
            const currentWeather = weatherData.current_weather || {};
            
            this.updateWeatherDisplay(currentWeather);
        } catch (error) {
            this.setWeatherError();
        }
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
        if (this.descElement) this.descElement.textContent = '无法获取经纬度';
        if (this.tempElement) this.tempElement.textContent = '--°C';
        if (this.iconElement) this.iconElement.textContent = '—';
    }

    setWeatherError() {
        if (this.descElement) this.descElement.textContent = '天气服务不可用';
    }

    handleError() {
        if (this.ipElement) this.ipElement.textContent = 'IP: 无法获取';
        if (this.locationElement) this.locationElement.textContent = '未知位置';
        if (this.descElement) this.descElement.textContent = '天气服务不可用';
    }

    async fetchWithTimeout(url, timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    async getGeolocation() {
        if (!navigator.geolocation) return null;
        
        return new Promise((resolve) => {
            const success = (position) => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
            const error = () => resolve(null);
            
            navigator.geolocation.getCurrentPosition(success, error, {
                maximumAge: 600000,
                timeout: 8000
            });
        });
    }

    weatherCodeToText(code) {
        const codes = {
            0: '晴朗',
            1: '晴朗',
            2: '晴朗',
            3: '多云',
            45: '雾',
            48: '雾',
            51: '小雨',
            53: '小雨',
            55: '小雨',
            56: '小雨',
            57: '小雨',
            61: '小雨',
            63: '小雨',
            65: '小雨',
            66: '小雨',
            67: '小雨',
            71: '小雪',
            73: '小雪',
            75: '小雪',
            77: '小雪',
            80: '阵雨',
            81: '阵雨',
            82: '阵雨',
            95: '雷暴'
        };
        return codes[code] || '多变';
    }

    weatherCodeToEmoji(code) {
        const emojis = {
            0: '☀️',
            1: '☀️',
            2: '☀️',
            3: '⛅',
            45: '🌫️',
            48: '🌫️',
            51: '🌧️',
            53: '🌧️',
            55: '🌧️',
            56: '🌧️',
            57: '🌧️',
            61: '🌧️',
            63: '🌧️',
            65: '🌧️',
            66: '🌧️',
            67: '🌧️',
            71: '❄️',
            73: '❄️',
            75: '❄️',
            77: '❄️',
            80: '🌦️',
            81: '🌦️',
            82: '🌦️',
            95: '⚡'
        };
        return emojis[code] || '🌤️';
    }
}

// PWA功能
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

        this.registerServiceWorker();
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

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js').catch(err => {
                    console.warn('SW 注册失败:', err);
                });
            });
        }
    }
}

// 初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new TabManager();
    new TimeDisplay();
    new WeatherWidget();
    new PWAHandler();
});