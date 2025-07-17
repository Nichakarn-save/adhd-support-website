// Global Variables
let currentUser = null;
let userType = 'child';
let registerType = 'child';
let gameStats = {
    memoryGames: 0,
    focusTime: 0,
    breathingMinutes: 0,
    tasksCompleted: 0
};




// Memory Game Variables
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let gameStarted = false;
let moves = 0;
let gameTimer = 0;
let timerInterval;

// Focus Game Variables
let focusStartTime = 0;
let focusTimer = 0;
let focusInterval;

// Breathing Exercise Variables
let breathingActive = false;
let breathingTimer = 0;
let breathingInterval;
let breathingPhase = 'inhale'; // 'inhale' or 'exhale'

// Schedule Data
let scheduleData = [
    { time: '07:00', task: 'ตื่นนอน และล้างหน้าแปรงฟัน', completed: false },
    { time: '08:00', task: 'กิจกรรมสมาธิ 10 นาที', completed: false },
    { time: '09:00', task: 'อาหารเช้า', completed: false },
    { time: '10:00', task: 'เวลาเรียน/ทำการบ้าน', completed: false },
    { time: '12:00', task: 'อาหารเที่ยง', completed: false },
    { time: '13:00', task: 'เกมฝึกสมาธิ', completed: false },
    { time: '15:00', task: 'กิจกรรมกลางแจ้ง', completed: false },
    { time: '18:00', task: 'อาหารเย็น', completed: false },
    { time: '19:00', task: 'ผ่อนคลายและหายใจลึก', completed: false },
    { time: '21:00', task: 'เตรียมตัวเข้านอน', completed: false }
];

// Tips Data
let tipsData = [
    "🎯 ตั้งเป้าหมายเล็กๆ ที่ทำได้จริง",
    "⏰ ใช้ Timer ช่วยจัดการเวลา",
    "🎵 ฟังเพลงเบาๆ ขณะทำกิจกรรม",
    "🏃‍♂️ ออกกำลังกายเป็นประจำ",
    "💤 นอนหลับให้เพียงพอ",
    "🥗 กินอาหารที่มีประโยชน์",
    "📱 จำกัดเวลาใช้อุปกรณ์อิเล็กทรอนิกส์",
    "🧘‍♀️ ฝึกสติและการหายใจ"
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupEventListeners();
    updateFloatingElements();
    
    // Auto-save user data every 30 seconds
    setInterval(saveUserData, 30000);
});

// Event Listeners Setup
function setupEventListeners() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const loginModal = document.getElementById('loginModal');
        const activityModal = document.getElementById('activityModal');
        
        if (event.target === loginModal) {
            closeLogin();
        }
        if (event.target === activityModal) {
            closeActivity();
        }
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLogin();
            closeActivity();
        }
    });
}

// Login/Register Functions
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

function selectUserType(type) {
    userType = type;
    const buttons = document.querySelectorAll('#loginForm .user-type-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    // จะใช้ event.target ไม่ได้ ต้องเปลี่ยนมาใช้วิธีอื่นแทน เช่น
    // แต่ไม่มี event ทำให้ไม่รู้ว่า user คลิกที่ปุ่มไหนโดยตรง
}

function selectRegisterType(type) {
    registerType = type;
    const buttons = document.querySelectorAll('#registerForm .user-type-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.user-type-btn').classList.add('active');
    
    // Show/hide age and email fields based on type
    const ageGroup = document.getElementById('ageGroup');
    const emailGroup = document.getElementById('emailGroup');
    
    if (type === 'child') {
        ageGroup.style.display = 'block';
        emailGroup.style.display = 'none';
    } else {
        ageGroup.style.display = 'none';
        emailGroup.style.display = 'block';
    }
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function handleLogin(e) {
    e.preventDefault();
    const name = document.getElementById("username").value;
    currentUser = {
        name: name,
        type: userType
    };
    // Redirect ไปหน้าใหม่หลัง login สำเร็จ
    window.location.href = "activity.html";
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value;
    const username = document.getElementById('regUsername').value;
    const age = document.getElementById('regAge').value;
    
    if (name && username && (registerType === 'parent' || age)) {
        // Create new user
        const newUser = {
            name: name,
            username: username,
            type: registerType,
            age: registerType === 'child' ? age : null,
            registeredAt: new Date().toISOString()
        };
        
        loginUser(username, registerType, newUser);
    } else {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
}

function demoLogin() {
    currentUser = {
        name: "ทดลองใช้",
        type: "child"
    };
    window.location.href = "activity.html";
}

function loginUser(username, type, userData = null) {
    currentUser = userData || { name: username, type: type };
    
    // Hide login screen and show main content
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    // Update user info display
    updateUserInfo();
    
    // Initialize user progress
    initializeProgress();
    
    // Show welcome message
    setTimeout(() => {
        showWelcomeMessage();
    }, 500);
    
    saveUserData();
}




function logout() {
    currentUser = null;
    gameStats = {
        memoryGames: 0,
        focusTime: 0,
        breathingMinutes: 0,
        tasksCompleted: 0
    };
    
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
    
    // Clear any running timers
    clearInterval(timerInterval);
    clearInterval(focusInterval);
    clearInterval(breathingInterval);
    
    localStorage.removeItem('adhdAppUser');
}

function updateUserInfo() {
    const userProfile = document.querySelector('.user-profile');
    const avatar = userProfile.querySelector('.user-avatar');
    const nameElement = userProfile.querySelector('.user-name');
    
    if (!nameElement) {
        const nameDiv = document.createElement('div');
        nameDiv.className = 'user-name';
        userProfile.appendChild(nameDiv);
    }
    
    const name = userProfile.querySelector('.user-name');
    name.textContent = currentUser.name;
    
    // Set avatar based on user type
    if (currentUser.type === 'child') {
        avatar.textContent = currentUser.name.includes('หญิง') ? '👧' : '👦';
    } else {
        avatar.textContent = '👨‍👩‍👧‍👦';
    }
}

function showWelcomeMessage() {
    const message = currentUser.type === 'child' ? 
        `🎉 สวัสดี ${currentUser.name}! พร้อมเรียนรู้และสนุกไปด้วยกันไหม?` :
        `👋 ยินดีต้อนรับ ${currentUser.name} มาร่วมพัฒนาทักษะของลูกไปด้วยกัน`;
    
    // Create temporary welcome toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 5000;
        animation: slideInRight 0.5s ease-out;
        max-width: 300px;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Activity Functions
function openActivity(activityName) {
    const modal = document.getElementById('activityModal');
    const content = document.getElementById('activityContent');
    const title = document.getElementById('activityTitle');
    
    modal.style.display = 'block';
    title.textContent = getActivityTitle(activityName);
    content.innerHTML = getActivityContent(activityName);
    
    // Initialize activity-specific functions
    switch(activityName) {
        case 'memory':
            initMemoryGame();
            break;
        case 'focus':
            initFocusGame();
            break;
        case 'breathing':
            initBreathingExercise();
            break;
        case 'schedule':
            initSchedule();
            break;
        case 'progress':
            initProgress();
            break;
        case 'tips':
            initTips();
            break;
    }
}

function closeActivity() {
    document.getElementById('activityModal').style.display = 'none';
    
    // Clean up any running timers
    clearInterval(timerInterval);
    clearInterval(focusInterval);
    clearInterval(breathingInterval);
    
    gameStarted = false;
    focusStartTime = 0;
    breathingActive = false;
}

function getActivityTitle(activityName) {
    const titles = {
        'memory': '🧠 เกมฝึกความจำ',
        'focus': '🎯 เกมฝึกสมาธิ',
        'breathing': '🧘‍♀️ การหายใจผ่อนคลาย',
        'schedule': '📅 ตารางกิจกรรมประจำวัน',
        'progress': '📊 ติดตามความก้าวหน้า',
        'tips': '💡 เทคนิคและคำแนะนำ'
    };
    return titles[activityName] || 'กิจกรรม';
}

function getActivityContent(activityName) {
    switch(activityName) {
        case 'memory':
            return `
                <div class="game-stats">
                    <div class="stat-item">
                        <div class="stat-number" id="memoryMoves">0</div>
                        <div class="stat-label">ครั้งที่พลิก</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number" id="memoryPairs">0</div>
                        <div class="stat-label">คู่ที่จับได้</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number" id="memoryTime">0</div>
                        <div class="stat-label">เวลา (วินาที)</div>
                    </div>
                </div>
                <div class="game-controls">
                    <button class="game-btn" onclick="startMemoryGame()">🎮 เริ่มเกม</button>
                    <button class="game-btn" onclick="resetMemoryGame()">🔄 เริ่มใหม่</button>
                </div>
                <div class="memory-game" id="memoryGameBoard"></div>
            `;
            
        case 'focus':
            return `
                <div class="focus-game">
                    <div class="game-stats">
                        <div class="stat-item">
                            <div class="stat-number" id="focusTime">0</div>
                            <div class="stat-label">เวลาโฟกัส (วินาที)</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="focusLevel">0</div>
                            <div class="stat-label">ระดับสมาธิ</div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <button class="game-btn" onclick="startFocusExercise()">🎯 เริ่มฝึกสมาธิ</button>
                        <button class="game-btn" onclick="stopFocusExercise()">⏹️ หยุด</button>
                    </div>
                    <div class="focus-circle" id="focusCircle">
                        <span id="focusText">คลิกเพื่อเริ่ม</span>
                    </div>
                    <p>📝 วิธีเล่น: คลิกค้างที่วงกลม และสังเกตการเปลี่ยนแปลง</p>
                </div>
            `;
            
        case 'breathing':
            return `
                <div class="breathing-exercise">
                    <div class="game-stats">
                        <div class="stat-item">
                            <div class="stat-number" id="breathingTime">0</div>
                            <div class="stat-label">เวลาที่หายใจ (วินาที)</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="breathingCycles">0</div>
                            <div class="stat-label">รอบที่หายใจ</div>
                        </div>
                    </div>
                    <div class="game-controls">
                        <button class="game-btn" onclick="startBreathingExercise()">🌬️ เริ่มหายใจ</button>
                        <button class="game-btn" onclick="stopBreathingExercise()">⏹️ หยุด</button>
                    </div>
                    <div class="breathing-circle" id="breathingCircle">
                        <span id="breathingText">พร้อมที่จะหายใจ</span>
                    </div>
                    <div class="breathing-guide" id="breathingGuide">
                        คลิกเริ่มหายใจ เพื่อความผ่อนคลาย
                    </div>
                </div>
            `;
            
        case 'schedule':
            return `
                <div class="schedule-container">
                    <h3 style="text-align: center; margin-bottom: 20px;">📅 ตารางกิจกรรมประจำวัน</h3>
                    <div id="scheduleList"></div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="game-btn" onclick="resetSchedule()">🔄 รีเซ็ตตาราง</button>
                    </div>
                </div>
            `;
            
        case 'progress':
            return `
                <div class="progress-section">
                    <h3 class="progress-title">📊 ความก้าวหน้าของคุณ</h3>
                    <div class="progress-bars" id="progressBars"></div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="game-btn" onclick="updateProgress()">🔄 อัพเดท</button>
                    </div>
                </div>
            `;
            
        case 'tips':
            return `
                <div class="tips-section">
                    <h3 class="tips-title">💡 เทคนิคและคำแนะนำ</h3>
                    <div class="tips-grid" id="tipsGrid"></div>
                    <div style="text-align: center; margin-top: 20px;">
                        <button class="game-btn" onclick="randomTip()">🎲 เทคนิคแบบสุ่ม</button>
                    </div>
                </div>
            `;
            
        default:
            return '<p>กิจกรรมกำลังพัฒนา...</p>';
    }
}

// Memory Game Functions
function initMemoryGame() {
    const emojis = ['🌟', '🎈', '🦋', '🌈', '🎯', '🎨', '🎭', '🎪'];
    memoryCards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    
    const gameBoard = document.getElementById('memoryGameBoard');
    gameBoard.innerHTML = '';
    
    memoryCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.addEventListener('click', flipCard);
        gameBoard.appendChild(card);
    });
    
    resetMemoryGameStats();
}

function startMemoryGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameTimer = 0;
        timerInterval = setInterval(() => {
            gameTimer++;
            document.getElementById('memoryTime').textContent = gameTimer;
        }, 1000);
    }
}

function resetMemoryGame() {
    gameStarted = false;
    moves = 0;
    matchedPairs = 0;
    flippedCards = [];
    clearInterval(timerInterval);
    gameTimer = 0;
    
    resetMemoryGameStats();
    initMemoryGame();
}

function resetMemoryGameStats() {
    document.getElementById('memoryMoves').textContent = '0';
    document.getElementById('memoryPairs').textContent = '0';
    document.getElementById('memoryTime').textContent = '0';
}

function flipCard(event) {
    if (!gameStarted) {
        startMemoryGame();
    }
    
    const card = event.target;
    const index = card.dataset.index;
    
    if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
        card.classList.add('flipped');
        card.textContent = card.dataset.emoji;
        flippedCards.push(card);
        
        if (flippedCards.length === 2) {
            moves++;
            document.getElementById('memoryMoves').textContent = moves;
            
            setTimeout(checkMatch, 1000);
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.emoji === card2.dataset.emoji) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        document.getElementById('memoryPairs').textContent = matchedPairs;
        
        if (matchedPairs === 8) {
            clearInterval(timerInterval);
            gameStats.memoryGames++;
            saveUserData();
            
            setTimeout(() => {
                alert(`🎉 ยินดีด้วย! คุณจับคู่ได้ทั้งหมดใน ${moves} ครั้ง เวลา ${gameTimer} วินาที`);
            }, 500);
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '';
        card2.textContent = '';
    }
    
    flippedCards = [];
}

function saveUserData() {
    if (currentUser) {
        const dataToSave = {
            user: currentUser,
            stats: gameStats,
            schedule: scheduleData
        };
        localStorage.setItem('adhdAppUser', JSON.stringify(dataToSave));
    }
}

function loadUserData() {
    const savedData = localStorage.getItem('adhdAppUser');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        currentUser = parsedData.user;
        gameStats = parsedData.stats || gameStats;
        scheduleData = parsedData.schedule || scheduleData;

        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        updateUserInfo();
        initializeProgress();
    }
}

// Focus Game Functions
function initFocusGame() {
    const focusCircle = document.getElementById('focusCircle');
    const focusText = document.getElementById('focusText');
    
    focusCircle.addEventListener('mousedown', startFocusTimer);
    focusCircle.addEventListener('mouseup', stopFocusTimer);
    focusCircle.addEventListener('mouseleave', stopFocusTimer);
    
    // Touch events for mobile
    focusCircle.addEventListener('touchstart', startFocusTimer);
    focusCircle.addEventListener('touchend', stopFocusTimer);
}

function startFocusExercise() {
    document.getElementById('focusText').textContent = 'คลิกค้างที่วงกลม';
    document.getElementById('focusTime').textContent = '0';
    document.getElementById('focusLevel').textContent = '0';
}

function stopFocusExercise() {
    clearInterval(focusInterval);
    focusStartTime = 0;
    focusTimer = 0;
    document.getElementById('focusText').textContent = 'คลิกเพื่อเริ่ม';
}

function startFocusTimer() {
    focusStartTime = Date.now();
    focusTimer = 0;
    
    focusInterval = setInterval(() => {
        focusTimer++;
        document.getElementById('focusTime').textContent = focusTimer;
        
        // Calculate focus level based on time
        const level = Math.min(Math.floor(focusTimer / 5) + 1, 10);
        document.getElementById('focusLevel').textContent = level;
        
        document.getElementById('focusText').textContent = `โฟกัส! ระดับ ${level}`;
    }, 1000);
}

function stopFocusTimer() {
    clearInterval(focusInterval);
    
    if (focusTimer > 0) {
        gameStats.focusTime += focusTimer;
        saveUserData();
        
        document.getElementById('focusText').textContent = `ดีมาก! ${focusTimer} วินาที`;
    }
}

// Breathing Exercise Functions
function initBreathingExercise() {
    document.getElementById('breathingTime').textContent = '0';
    document.getElementById('breathingCycles').textContent = '0';
}

function startBreathingExercise() {
    if (!breathingActive) {
        breathingActive = true;
        breathingPhase = 'inhale';
        breathingTimer = 0;
        
        const circle = document.getElementById('breathingCircle');
        const text = document.getElementById('breathingText');
        const guide = document.getElementById('breathingGuide');
        
        breathingInterval = setInterval(() => {
            breathingTimer++;
            document.getElementById('breathingTime').textContent = breathingTimer;
            
            if (breathingTimer % 8 === 0) {
                // Complete cycle every 8 seconds
                const cycles = Math.floor(breathingTimer / 8);
                document.getElementById('breathingCycles').textContent = cycles;
                gameStats.breathingMinutes = Math.floor(breathingTimer / 60);
            }
            
            // Breathing animation
            if (breathingTimer % 8 <= 4) {
                breathingPhase = 'inhale';
                text.textContent = 'หายใจเข้า';
                guide.textContent = '🌬️ หายใจเข้าช้าๆ ลึกๆ';
                circle.style.transform = 'scale(1.2)';
            } else {
                breathingPhase = 'exhale';
                text.textContent = 'หายใจออก';
                guide.textContent = '💨 หายใจออกช้าๆ ผ่อนคลาย';
                circle.style.transform = 'scale(1)';
            }
        }, 1000);
    }
}

function stopBreathingExercise() {
    breathingActive = false;
    clearInterval(breathingInterval);
    
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const guide = document.getElementById('breathingGuide');
    
    circle.style.transform = 'scale(1)';
    text.textContent = 'พร้อมที่จะหายใจ';
    guide.textContent = 'คลิกเริ่มหายใจ เพื่อความผ่อนคลาย';
    
    if (breathingTimer > 0) {
        saveUserData();
    }
}

// Schedule Functions
function initSchedule() {
    const scheduleList = document.getElementById('scheduleList');
    scheduleList.innerHTML = '';
    
    scheduleData.forEach((item, index) => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <div class="schedule-time">${item.time}</div>
            <div class="schedule-task">${item.task}</div>
            <div class="schedule-status ${item.completed ? 'completed' : ''}" 
                 onclick="toggleScheduleItem(${index})"></div>
        `;
        scheduleList.appendChild(scheduleItem);
    });
}

function toggleScheduleItem(index) {
    scheduleData[index].completed = !scheduleData[index].completed;
    
    if (scheduleData[index].completed) {
        gameStats.tasksCompleted++;
        saveUserData();
    } else {
        gameStats.tasksCompleted = Math.max(0, gameStats.tasksCompleted - 1);
    }
    
    initSchedule();
}

function resetSchedule() {
    scheduleData.forEach(item => item.completed = false);
    initSchedule();
}

// Progress Functions
function initializeProgress() {
    updateProgressBars();
}

function initProgress() {
    updateProgressBars();
}

function updateProgressBars() {
    const progressBars = document.getElementById('progressBars');
    if (!progressBars) return;
    
    const progressData = [
        { 
            label: 'เกมความจำ', 
            value: Math.min(gameStats.memoryGames * 10, 100), 
            color: '#667eea' 
        },
        { 
            label: 'เวลาโฟกัส', 
            value: Math.min(gameStats.focusTime / 10, 100), 
            color: '#764ba2' 
        },
        { 
            label: 'การหายใจ', 
            value: Math.min(gameStats.breathingMinutes * 5, 100), 
            color: '#ff9a9e' 
        },
        { 
            label: 'งานที่ทำเสร็จ', 
            value: Math.min(gameStats.tasksCompleted * 10, 100), 
            color: '#fecfef' 
        }
    ];
    
    progressBars.innerHTML = '';
    
    progressData.forEach(item => {
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div class="progress-label">${item.label}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${item.value}%; background: ${item.color}"></div>
            </div>
            <div style="min-width: 50px; text-align: right; font-weight: bold;">${Math.round(item.value)}%</div>
        `;
        progressBars.appendChild(progressItem);
    });
}

function updateProgress() {
    updateProgressBars();
}

// Tips Functions
function initTips() {
    const tipsGrid = document.getElementById('tipsGrid');
    tipsGrid.innerHTML = '';
    
    tipsData.forEach(tip => {
        const tipCard = document.createElement('div');
        tipCard.className = 'tip-card';
        tipCard.textContent = tip;
        tipsGrid.appendChild(tipCard);
    });
}

function randomTip() {
    const randomIndex = Math.floor(Math.random() * tipsData.length);
    const tip = tipsData[randomIndex];
    
    // Show tip as toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #333;
        padding: 20px 30px;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        font-size: 1.2em;
        font-weight: bold;
        z-index: 9999;
        text-align: center;
        animation: fadeInOut 3s forwards;
    `;
    toast.textContent = tip;
    document.body.appendChild(toast);

    // ลบ toast หลังจาก 3 วิ
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function selectUserType(type, event) {
    userType = type;
    const buttons = document.querySelectorAll('#loginForm .user-type-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('.user-type-btn').classList.add('active');
}
//function handleBackButtonClick (event )
//{ 
    //demoLogin();
    //console.debug();}

// const backButtons = document.querySelectorAll("back-btn");
// backButtons.forEach(button => {
//     button.addEventListener(
//         'click',handleBackButtonClick
//     );
// });


