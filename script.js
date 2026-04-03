// ==================== DOM ====================
const themeToggle = document.getElementById('themeToggle');
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const colorBtns = document.querySelectorAll('.color-btn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const upvoteBtn = document.getElementById('upvoteBtn');

// ==================== API ====================
const API_URL = 'https://ahmeddewy1-radiofm.hf.space/api/stats';

// ==================== CACHE ====================
let cachedStats = {
    servers: parseInt(localStorage.getItem('cachedServers')) || 0,
    online_members: parseInt(localStorage.getItem('cachedOnline')) || 0,
    upvotes: parseInt(localStorage.getItem('cachedUpvotes')) || 0,
    voice_connections: parseInt(localStorage.getItem('cachedVoice')) || 0,
    uptime: '--'
};

// ==================== THEME ====================
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    const accent = localStorage.getItem('accent') || 'green';

    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-accent', accent);

    updateThemeIcon(theme);

    colorBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === accent);
    });
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ==================== NAV ====================
function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
}

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    icon.className = navMenu.classList.contains('active')
        ? 'fas fa-times'
        : 'fas fa-bars';
}

// ==================== TABS ====================
function switchTab(e) {
    const tabId = e.target.closest('.tab-btn').dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    e.target.closest('.tab-btn').classList.add('active');

    tabContents.forEach(c => {
        c.classList.toggle('active', c.id === tabId);
    });
}

// ==================== STATS ====================
async function fetchStats() {
    try {
        const res = await fetch(API_URL);

        if (!res.ok) throw new Error();

        const data = await res.json();

        cachedStats = data;

        localStorage.setItem('cachedServers', data.servers);
        localStorage.setItem('cachedOnline', data.online_members);
        localStorage.setItem('cachedUpvotes', data.upvotes);
        localStorage.setItem('cachedVoice', data.voice_connections);

        updateStats(data);
        updateStatus(true);

    } catch {
        updateStats(cachedStats);
        updateStatus(false);
    }
}

function updateStats(s) {
    setText('serverCount', s.servers);
    setText('onlineCount', s.online_members);
    setText('upvoteCount', s.upvotes);

    setText('dashServerCount', s.servers);
    setText('dashOnlineCount', s.online_members);
    setText('dashUpvoteCount', s.upvotes);
    setText('dashVoiceCount', s.voice_connections);

    const btn = document.getElementById('upvoteBtnCount');
    if (btn) btn.textContent = s.upvotes;

    const up = document.getElementById('uptimeValue');
    if (up) up.textContent = s.uptime || '--';
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = format(val);
}

function format(n) {
    n = parseInt(n) || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n;
}

// ==================== STATUS ====================
function updateStatus(ok) {
    const api = document.getElementById('apiStatus');
    if (!api) return;

    if (ok) {
        api.innerHTML = '<i class="fas fa-circle"></i> Operational';
        api.className = 'status-value online';
    } else {
        api.innerHTML = '<i class="fas fa-circle"></i> Limited';
    }
}

// ==================== UPVOTE ====================
async function handleUpvote() {
    if (localStorage.getItem('hasUpvoted')) return;

    cachedStats.upvotes++;
    updateStats(cachedStats);

    localStorage.setItem('cachedUpvotes', cachedStats.upvotes);
    localStorage.setItem('hasUpvoted', 'true');

    try {
        await fetch('https://ahmeddewy1-radiofm.hf.space/api/upvote', {
            method: 'POST'
        });
    } catch {}
}

// ==================== SETTINGS ====================
function handleColor(e) {
    const c = e.target.dataset.color;
    document.documentElement.setAttribute('data-accent', c);
    localStorage.setItem('accent', c);
}

function handleVolume() {
    const v = volumeSlider.value;
    volumeValue.textContent = v + '%';
    localStorage.setItem('defaultVolume', v);
}

// ==================== INVITE ====================
function getInvite() {
    const id = '1489146429732818986';
    return `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=8&scope=bot%20applications.commands`;
}

// ==================== INIT ====================
function init() {
    initTheme();

    if (themeToggle) themeToggle.onclick = toggleTheme;
    if (mobileMenuBtn) mobileMenuBtn.onclick = toggleMobileMenu;

    tabBtns.forEach(b => b.onclick = switchTab);
    colorBtns.forEach(b => b.onclick = handleColor);

    if (volumeSlider) volumeSlider.oninput = handleVolume;
    if (upvoteBtn) upvoteBtn.onclick = handleUpvote;

    const invite = getInvite();
    document.querySelectorAll('#inviteBtn, #heroInviteBtn, #addServerBtn')
        .forEach(b => b && (b.href = invite));

    window.addEventListener('scroll', handleScroll);

    fetchStats();
    setInterval(fetchStats, 30000);
}

document.addEventListener('DOMContentLoaded', init);

// ==================== SAVE CACHE ====================
window.addEventListener('beforeunload', () => {
    localStorage.setItem('cachedServers', cachedStats.servers);
    localStorage.setItem('cachedOnline', cachedStats.online_members);
    localStorage.setItem('cachedUpvotes', cachedStats.upvotes);
    localStorage.setItem('cachedVoice', cachedStats.voice_connections);
});
