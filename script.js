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

// ==================== CACHE ====================
let cachedStats = {
    servers: parseInt(localStorage.getItem('cachedServers')) || 0,
    online_members: parseInt(localStorage.getItem('cachedOnline')) || 0,
    upvotes: parseInt(localStorage.getItem('cachedUpvotes')) || 0,
    voice_connections: parseInt(localStorage.getItem('cachedVoice')) || 0,
    total_plays: parseInt(localStorage.getItem('cachedPlays')) || 0,
    uptime: '--'
};

// ==================== THEME ====================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedAccent = localStorage.getItem('accent') || 'green';
    const savedAnimations = localStorage.getItem('animations') !== 'false';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-accent', savedAccent);

    if (!savedAnimations) {
        document.body.classList.add('no-animations');
    }

    if (darkModeToggle) darkModeToggle.checked = savedTheme === 'dark';
    if (animationsToggle) animationsToggle.checked = savedAnimations;

    updateThemeIcon(savedTheme);

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
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ==================== NAV ====================
function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

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
        content.classList.toggle('active', content.id === tabId);
    });
}

// ==================== STATS ====================
async function fetchStats() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE_URL}/api/stats`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error();

        const data = await response.json();

        // fallback safety
        data.servers = parseInt(data.servers) || 0;
        data.online_members = parseInt(data.online_members) || 0;
        data.upvotes = parseInt(data.upvotes) || 0;
        data.voice_connections = parseInt(data.voice_connections) || 0;

        cachedStats = data;

        localStorage.setItem('cachedServers', data.servers);
        localStorage.setItem('cachedOnline', data.online_members);
        localStorage.setItem('cachedUpvotes', data.upvotes);
        localStorage.setItem('cachedVoice', data.voice_connections);

        updateStatsDisplay(data);
        updateStatusIndicators(true);

    } catch (error) {
        updateStatsDisplay(cachedStats);
        updateStatusIndicators(false);
    }
}

function updateStatsDisplay(stats) {
    animateValue('serverCount', stats.servers);
    animateValue('onlineCount', stats.online_members);
    animateValue('upvoteCount', stats.upvotes);

    animateValue('dashServerCount', stats.servers);
    animateValue('dashOnlineCount', stats.online_members);
    animateValue('dashUpvoteCount', stats.upvotes);
    animateValue('dashVoiceCount', stats.voice_connections);

    const btn = document.getElementById('upvoteBtnCount');
    if (btn) btn.textContent = stats.upvotes;

    const uptime = document.getElementById('uptimeValue');
    if (uptime) uptime.textContent = stats.uptime || '--';
}

function animateValue(id, target) {
    const el = document.getElementById(id);
    if (!el) return;

    const start = parseInt(el.textContent) || 0;
    const end = parseInt(target) || 0;

    const duration = 1000;
    const startTime = performance.now();

    function update(time) {
        const progress = Math.min((time - startTime) / duration, 1);
        const value = Math.round(start + (end - start) * (1 - Math.pow(1 - progress, 4)));
        el.textContent = formatNumber(value);

        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
}

// ==================== STATUS ====================
function updateStatusIndicators(isOnline) {
    const api = document.getElementById('apiStatus');
    if (!api) return;

    if (isOnline) {
        api.innerHTML = '<i class="fas fa-circle"></i> Operational';
        api.className = 'status-value online';
    } else {
        api.innerHTML = '<i class="fas fa-circle"></i> Limited';
        api.style.color = 'var(--warning)';
    }
}

// ==================== UPVOTE ====================
async function handleUpvote() {
    if (localStorage.getItem('hasUpvoted')) {
        showNotification('Already upvoted', 'warning');
        return;
    }

    cachedStats.upvotes++;
    updateStatsDisplay(cachedStats);

    localStorage.setItem('cachedUpvotes', cachedStats.upvotes);
    localStorage.setItem('hasUpvoted', 'true');

    try {
        await fetch(`${API_BASE_URL}/api/upvote`, { method: 'POST' });
    } catch {}
}

// ==================== INIT ====================
function init() {
    initTheme();

    if (themeToggle) themeToggle.onclick = toggleTheme;
    if (mobileMenuBtn) mobileMenuBtn.onclick = toggleMobileMenu;

    tabBtns.forEach(btn => btn.onclick = switchTab);
    colorBtns.forEach(btn => btn.onclick = handleColorChange);

    if (volumeSlider) volumeSlider.oninput = handleVolumeChange;
    if (upvoteBtn) upvoteBtn.onclick = handleUpvote;

    window.addEventListener('scroll', handleScroll);

    fetchStats();
    setInterval(fetchStats, 30000);
}

document.addEventListener('DOMContentLoaded', init);
