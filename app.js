// ==================== DOM ELEMENTS ====================
const themeToggle = document.getElementById('themeToggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const animationsToggle = document.getElementById('animationsToggle');
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const colorBtns = document.querySelectorAll('.color-btn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const upvoteBtn = document.getElementById('upvoteBtn');

// ==================== API CONFIGURATION ====================
const API_BASE_URL = 'https://ahmeddewy1-radiofm.hf.space'; 

// Cleaned up: Only one definition of cachedStats
let cachedStats = {
    servers: localStorage.getItem('cachedServers') || 0,
    online_members: localStorage.getItem('cachedOnline') || 0,
    upvotes: localStorage.getItem('cachedUpvotes') || 0,
    voice_connections: localStorage.getItem('cachedVoice') || 0,
    total_plays: localStorage.getItem('cachedPlays') || 0,
    uptime: '--'
};

// ... [Keep the rest of your functions like updateStats, init, etc.] ...

// Fallback/default stats (used when API is unavailable)
let cachedStats = {
    servers: localStorage.getItem('cachedServers') || 0,
    online_members: localStorage.getItem('cachedOnline') || 0,
    upvotes: localStorage.getItem('cachedUpvotes') || 0,
    voice_connections: localStorage.getItem('cachedVoice') || 0,
    uptime: '--'
};

// ==================== THEME MANAGEMENT ====================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedAccent = localStorage.getItem('accent') || 'green';
    const savedAnimations = localStorage.getItem('animations') !== 'false';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-accent', savedAccent);
    
    if (!savedAnimations) {
        document.body.classList.add('no-animations');
    }
    
    // Update toggle states
    if (darkModeToggle) {
        darkModeToggle.checked = savedTheme === 'dark';
    }
    if (animationsToggle) {
        animationsToggle.checked = savedAnimations;
    }
    
    // Update theme toggle icon
    updateThemeIcon(savedTheme);
    
    // Update color button active state
    colorBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === savedAccent);
    });
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon(newTheme);
    
    if (darkModeToggle) {
        darkModeToggle.checked = newTheme === 'dark';
    }
}

function updateThemeIcon(theme) {
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ==================== NAVIGATION ====================
function handleScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Update active nav link based on scroll position
    const sections = document.querySelectorAll('section');
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    icon.className = navMenu.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
}

// ==================== TABS ====================
function switchTab(e) {
    const tabId = e.target.closest('.tab-btn').dataset.tab;
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    e.target.closest('.tab-btn').classList.add('active');
    
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
            content.classList.add('active');
        }
    });
}

// ==================== STATS MANAGEMENT ====================
async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            timeout: 5000
        });
        
        if (!response.ok) throw new Error('API unavailable');
        
        const data = await response.json();
        
        // Cache the stats
        cachedStats = data;
        localStorage.setItem('cachedServers', data.servers);
        localStorage.setItem('cachedOnline', data.online_members);
        localStorage.setItem('cachedUpvotes', data.upvotes);
        localStorage.setItem('cachedVoice', data.voice_connections);
        
        updateStatsDisplay(data);
        updateStatusIndicators(true);
        
    } catch (error) {
        console.log('Using cached stats:', error.message);
        updateStatsDisplay(cachedStats);
        updateStatusIndicators(false);
    }
}

function updateStatsDisplay(stats) {
    // Hero stats
    animateValue('serverCount', stats.servers);
    animateValue('onlineCount', stats.online_members);
    animateValue('upvoteCount', stats.upvotes);
    
    // Dashboard stats
    animateValue('dashServerCount', stats.servers);
    animateValue('dashOnlineCount', stats.online_members);
    animateValue('dashUpvoteCount', stats.upvotes);
    animateValue('dashVoiceCount', stats.voice_connections);
    
    // Upvote button count
    const upvoteBtnCount = document.getElementById('upvoteBtnCount');
    if (upvoteBtnCount) {
        upvoteBtnCount.textContent = stats.upvotes;
    }
    
    // Uptime
    const uptimeValue = document.getElementById('uptimeValue');
    if (uptimeValue && stats.uptime) {
        uptimeValue.textContent = stats.uptime;
    }
}

function animateValue(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const target = parseInt(targetValue) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const value = Math.round(currentValue + (target - currentValue) * easeOutQuart);
        
        element.textContent = formatNumber(value);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function updateStatusIndicators(isOnline) {
    const botStatus = document.getElementById('botStatus');
    const apiStatus = document.getElementById('apiStatus');
    const streamStatus = document.getElementById('streamStatus');
    
    if (isOnline) {
        if (botStatus) {
            botStatus.innerHTML = '<i class="fas fa-circle"></i> Online';
            botStatus.className = 'status-value online';
        }
        if (apiStatus) {
            apiStatus.innerHTML = '<i class="fas fa-circle"></i> Operational';
            apiStatus.className = 'status-value online';
        }
        if (streamStatus) {
            streamStatus.innerHTML = '<i class="fas fa-circle"></i> Active';
            streamStatus.className = 'status-value online';
        }
    } else {
        if (apiStatus) {
            apiStatus.innerHTML = '<i class="fas fa-circle"></i> Limited';
            apiStatus.style.color = 'var(--warning)';
        }
    }
}

// ==================== UPVOTE FUNCTIONALITY ====================
async function handleUpvote() {
    // Check if user already upvoted (simple localStorage check)
    const hasUpvoted = localStorage.getItem('hasUpvoted');
    
    if (hasUpvoted) {
        showNotification('You have already upvoted!', 'warning');
        return;
    }
    
    // Optimistic UI update
    cachedStats.upvotes = (parseInt(cachedStats.upvotes) || 0) + 1;
    updateStatsDisplay(cachedStats);
    localStorage.setItem('cachedUpvotes', cachedStats.upvotes);
    localStorage.setItem('hasUpvoted', 'true');
    
    // Add animation to button
    upvoteBtn.classList.add('upvoted');
    setTimeout(() => upvoteBtn.classList.remove('upvoted'), 300);
    
    showNotification('Thank you for your upvote! ❤️', 'success');
    
    // Try to send to API
    try {
        await fetch(`${API_BASE_URL}/api/upvote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
    } catch (error) {
        console.log('Upvote saved locally');
    }
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '12px',
        background: type === 'success' ? 'var(--success)' : 
                   type === 'warning' ? 'var(--warning)' : 
                   type === 'error' ? 'var(--error)' : 'var(--info)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontWeight: '600',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        zIndex: '9999',
        transform: 'translateX(120%)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'error': return 'fa-times-circle';
        default: return 'fa-info-circle';
    }
}

// ==================== SETTINGS HANDLERS ====================
function handleColorChange(e) {
    const color = e.target.dataset.color;
    document.documentElement.setAttribute('data-accent', color);
    localStorage.setItem('accent', color);
    
    colorBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === color);
    });
}

function handleVolumeChange() {
    const value = volumeSlider.value;
    volumeValue.textContent = `${value}%`;
    localStorage.setItem('defaultVolume', value);
}

function handleAnimationsToggle() {
    const enabled = animationsToggle.checked;
    document.body.classList.toggle('no-animations', !enabled);
    localStorage.setItem('animations', enabled);
}

// ==================== INVITE LINK ====================
function getInviteLink() {
    // Replace with your actual bot client ID
    const clientId = 'YOUR_BOT_CLIENT_ID';
    return `[discord.com](https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands)`;
}

// ==================== INITIALIZATION ====================
function init() {
    // Initialize theme
    initTheme();
    
    // Load saved settings
    const savedVolume = localStorage.getItem('defaultVolume') || 80;
    if (volumeSlider) {
        volumeSlider.value = savedVolume;
        volumeValue.textContent = `${savedVolume}%`;
    }
    
    // Event Listeners
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleTheme);
    }
    
    if (animationsToggle) {
        animationsToggle.addEventListener('change', handleAnimationsToggle);
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.className = 'fas fa-bars';
        });
    });
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', switchTab);
    });
    
    colorBtns.forEach(btn => {
        btn.addEventListener('click', handleColorChange);
    });
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', handleVolumeChange);
    }
    
    if (upvoteBtn) {
        upvoteBtn.addEventListener('click', handleUpvote);
    }
    
    // Set invite links
    const inviteLink = getInviteLink();
    document.querySelectorAll('#inviteBtn, #heroInviteBtn, #addServerBtn').forEach(btn => {
        if (btn) btn.href = inviteLink;
    });
    
    // Scroll handler
    window.addEventListener('scroll', handleScroll);
    
    // Fetch initial stats
    fetchStats();
    
    // Auto-refresh stats every 30 seconds if enabled
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    let statsInterval;
    
    function startAutoRefresh() {
        statsInterval = setInterval(fetchStats, 30000);
    }
    
    function stopAutoRefresh() {
        if (statsInterval) clearInterval(statsInterval);
    }
    
    if (autoRefreshToggle) {
        const savedAutoRefresh = localStorage.getItem('autoRefresh') !== 'false';
        autoRefreshToggle.checked = savedAutoRefresh;
        
        if (savedAutoRefresh) {
            startAutoRefresh();
        }
        
        autoRefreshToggle.addEventListener('change', () => {
            if (autoRefreshToggle.checked) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
            localStorage.setItem('autoRefresh', autoRefreshToggle.checked);
        });
    } else {
        startAutoRefresh();
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Save stats before page unload
window.addEventListener('beforeunload', () => {
    localStorage.setItem('cachedServers', cachedStats.servers);
    localStorage.setItem('cachedOnline', cachedStats.online_members);
    localStorage.setItem('cachedUpvotes', cachedStats.upvotes);
    localStorage.setItem('cachedVoice', cachedStats.voice_connections);
});
