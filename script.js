// State
const state = {
    lang: 'en',
    name: '',
    isPlaying: false
};

// CONFIGURATION - REPLACE WITH YOUR GOOGLE SCRIPT URL
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';

// DOM Elements
const nameInput = document.getElementById('nameInput');
const generateBtn = document.getElementById('generateBtn');
const inputSection = document.getElementById('inputSection');
const resultSection = document.getElementById('resultSection');
const greetingText = document.getElementById('greetingText');
const langToggle = document.getElementById('langToggle');

const whatsappBtn = document.getElementById('whatsappShare');
const bgMusic = document.getElementById('bgMusic');
const fireworkSound = document.getElementById('fireworkSound');

// Messages
const messages = {
    en: (name) => `Happy New Year 2026, ${name}! ✨\nMay this New Year bring new hope, new opportunities, and positive changes into your life. May you achieve your goals with confidence, stay healthy, and find happiness in every small moment. Let go of the past, believe in yourself, and step into the New Year with courage, peace, and a smile. Wishing you a successful, joyful, and prosperous New Year ahead`,
    ta: (name) => `2026 புத்தாண்டு நல்வாழ்த்துக்கள் ${name}! ✨\nஒவ்வொரு நாளும் உங்கள் உள்ளத்தில் சந்தோஷம் மலரட்டும்; உங்கள் வீட்டில் மகிழ்ச்சி நிறையட்டும். உங்கள் முயற்சிகள் அனைத்தும் வெற்றியடையட்டும்.\n\nசென்ற ஆண்டிற்கு நன்றி கூறி, புதிதாக பிறந்துள்ள இந்த புத்தாண்டை புது நம்பிக்கையுடனும் உற்சாகத்துடனும் வரவேற்போம்.\n\nஇனிய புத்தாண்டு நல்வாழ்த்துக்கள்!`
};

// Event Listeners
generateBtn.addEventListener('click', () => {
    if (!nameInput.value.trim()) {
        nameInput.style.borderColor = '#ff4444';
        setTimeout(() => nameInput.style.borderColor = 'var(--glass-border)', 2000);
        return;
    }
    state.name = nameInput.value.trim();
    showGreeting();
    triggerExplosion();
    saveDataToSheet(state.name);
});

langToggle.addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'ta' : 'en';
    langToggle.textContent = state.lang === 'en' ? 'TA' : 'EN';

    if (state.name) {
        updateGreetingText();
    }
});



whatsappBtn.addEventListener('click', () => {
    const text = messages[state.lang](state.name);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
});

function showGreeting() {
    inputSection.classList.add('hidden');
    resultSection.style.display = 'flex';
    updateGreetingText();
    // Try auto play music on first interaction
    if (bgMusic.paused) {
        playAudio();
    }
}

function updateGreetingText() {
    greetingText.textContent = messages[state.lang](state.name);
    if (state.lang === 'ta') {
        greetingText.classList.add('ta');
    } else {
        greetingText.classList.remove('ta');
    }
}

function playAudio() {
    bgMusic.play().catch(error => {
        console.warn("Audio playback failed:", error);
    });
}

function saveDataToSheet(name) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_GOOGLE_SCRIPT_URL')) return;

    const data = new FormData();
    data.append('Name', name);

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: data
    })
        .then(response => console.log('Success!', response))
        .catch(error => console.error('Error!', error.message));
}


function triggerExplosion() {
    // Play firework sound
    if (fireworkSound) {
        fireworkSound.currentTime = 0;
        fireworkSound.play().catch(e => console.log("Sound play failed", e));
    }

    // Intense fireworks on generate
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            launchRocket(
                Math.random() * canvas.width,
                canvas.height,
                Math.random() * canvas.width,
                Math.random() * (canvas.height / 2)
            );
        }, i * 300);
    }
}

/* 
    * Fireworks Engine (Canvas)
    */
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let rockets = [];

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Rocket {
    constructor(x, y, tx, ty) {
        this.x = x;
        this.y = y;
        this.tx = tx;
        this.ty = ty;
        this.speed = 10;
        this.angle = Math.atan2(ty - y, tx - x);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.life = 100;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Distance check or life check
        const dx = this.tx - this.x;
        const dy = this.ty - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 20 || this.life <= 0) {
            createParticles(this.x, this.y, this.color);
            return false; // dead
        }
        return true;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.05;
        this.friction = 0.95;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.01;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        return this.alpha > 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

function launchRocket(x, y, tx, ty) {
    rockets.push(new Rocket(x, y, tx, ty));
}

function createParticles(x, y, color) {
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateAndDraw(entities) {
    return entities.filter(e => {
        const alive = e.update();
        if (alive) e.draw();
        return alive;
    });
}

function loop() {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    // Random auto launches
    if (Math.random() < 0.03) {
        launchRocket(
            Math.random() * canvas.width,
            canvas.height,
            Math.random() * canvas.width,
            Math.random() * (canvas.height / 3)
        );
    }

    rockets = updateAndDraw(rockets);
    particles = updateAndDraw(particles);

    requestAnimationFrame(loop);
}

loop();
