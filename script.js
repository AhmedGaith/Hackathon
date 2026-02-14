/* ============================================
   Deadline 23:59 - Cybersecurity Game
   Main Game Logic
   ============================================ */

// ========== GAME STATE MANAGEMENT ==========

const gameState = {
    securityScore: 50,
    stressLevel: 30,
    timeLeft: 23 * 60 + 59, // in seconds
    gameOver: false,
    currentScenario: null,
    scenariosCompleted: {
        phishing: false,
        software: false,
        ransomware: false
    },
    decisions: [],
    maxSecurityScore: 100,
    ransomwareTriggered: false
};

// ========== WINDOW MANAGEMENT ==========

const windows = {};
let windowCounter = 0;
let zIndexCounter = 100;

/**
 * Create and open a new window
 * @param {string} title - Window title
 * @param {string} type - Window type (email, browser, explorer)
 * @param {number} width - Initial width
 * @param {number} height - Initial height
 */
function createWindow(title, type, width = 600, height = 400) {
    const template = document.getElementById('window-template');
    const windowElement = template.content.cloneNode(true);
    const window = windowElement.querySelector('.window');
    const windowId = `window-${windowCounter++}`;

    window.id = windowId;
    window.dataset.windowType = type;
    window.style.width = width + 'px';
    window.style.height = height + 'px';
    window.style.left = (50 + windowCounter * 20) + 'px';
    window.style.top = (50 + windowCounter * 20) + 'px';

    window.querySelector('.window-title').textContent = title;

    // Add window to container
    document.getElementById('windows-container').appendChild(windowElement);

    // Store window reference
    windows[windowId] = {
        element: document.getElementById(windowId),
        type: type,
        title: title,
        isMaximized: false,
        isMinimized: false
    };

    // Make window draggable
    makeWindowDraggable(windowId);

    // Bring to front
    bringWindowToFront(windowId);

    // Add taskbar item
    addTaskbarItem(windowId, title);

    // Initialize window content based on type
    initializeWindowContent(windowId, type);

    return windowId;
}

/**
 * Make a window draggable
 * @param {string} windowId - Window ID
 */
function makeWindowDraggable(windowId) {
    const windowElement = windows[windowId].element;
    const titleBar = windowElement.querySelector('.window-titlebar');
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - windowElement.offsetLeft;
        offsetY = e.clientY - windowElement.offsetTop;
        bringWindowToFront(windowId);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && !windows[windowId].isMaximized) {
            windowElement.style.left = (e.clientX - offsetX) + 'px';
            windowElement.style.top = (e.clientY - offsetY) + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Click on title bar to bring to front
    titleBar.addEventListener('click', () => {
        bringWindowToFront(windowId);
    });
}

/**
 * Bring a window to the front
 * @param {string} windowId - Window ID
 */
function bringWindowToFront(windowId) {
    // Update z-index for the window
    windows[windowId].element.style.zIndex = zIndexCounter++;

    // Update taskbar buttons
    Object.keys(windows).forEach(id => {
        const item = document.querySelector(`[data-window-id="${id}"]`);
        if (item) {
            item.classList.remove('active');
        }
    });

    const taskbarItem = document.querySelector(`[data-window-id="${windowId}"]`);
    if (taskbarItem) {
        taskbarItem.classList.add('active');
    }
}

/**
 * Close a window
 * @param {Event} event - Click event
 */
function closeWindow(event) {
    const window = event.target.closest('.window');
    const windowId = window.id;

    window.style.animation = 'windowOpen 0.2s ease reverse';
    setTimeout(() => {
        window.remove();
        delete windows[windowId];
        removeTaskbarItem(windowId);
    }, 200);
}

/**
 * Minimize a window
 * @param {Event} event - Click event
 */
function minimizeWindow(event) {
    const window = event.target.closest('.window');
    const windowId = window.id;

    windows[windowId].isMinimized = !windows[windowId].isMinimized;

    if (windows[windowId].isMinimized) {
        window.style.display = 'none';
    } else {
        window.style.display = 'flex';
        bringWindowToFront(windowId);
    }
}

/**
 * Maximize a window
 * @param {Event} event - Click event
 */
function maximizeWindow(event) {
    const window = event.target.closest('.window');
    const windowId = window.id;

    windows[windowId].isMaximized = !windows[windowId].isMaximized;
    window.classList.toggle('maximized');
}

/**
 * Add taskbar item for a window
 * @param {string} windowId - Window ID
 * @param {string} title - Window title
 */
function addTaskbarItem(windowId, title) {
    const taskbarWindows = document.getElementById('taskbar-windows');
    const button = document.createElement('button');
    button.className = 'taskbar-item active';
    button.dataset.windowId = windowId;
    button.textContent = title;

    button.addEventListener('click', () => {
        const window = windows[windowId];
        if (window.isMinimized) {
            window.isMinimized = false;
            window.element.style.display = 'flex';
        }
        bringWindowToFront(windowId);
    });

    taskbarWindows.appendChild(button);
}

/**
 * Remove taskbar item
 * @param {string} windowId - Window ID
 */
function removeTaskbarItem(windowId) {
    const item = document.querySelector(`[data-window-id="${windowId}"]`);
    if (item) {
        item.remove();
    }
}

// ========== WINDOW CONTENT INITIALIZATION ==========

/**
 * Initialize window content based on type
 * @param {string} windowId - Window ID
 * @param {string} type - Window type
 */
function initializeWindowContent(windowId, type) {
    const window = windows[windowId].element;
    const contentDiv = window.querySelector('.window-content');

    switch (type) {
        case 'email':
            initializeEmailApp(windowId, contentDiv);
            break;
        case 'browser':
            initializeBrowserApp(windowId, contentDiv);
            break;
        case 'explorer':
            initializeFileExplorer(windowId, contentDiv);
            break;
    }
}

/**
 * Initialize email application
 * @param {string} windowId - Window ID
 * @param {HTMLElement} contentDiv - Content container
 */
function initializeEmailApp(windowId, contentDiv) {
    const emailTemplate = document.getElementById('email-template');
    const emailApp = emailTemplate.content.cloneNode(true);
    contentDiv.appendChild(emailApp);

    const emailList = contentDiv.querySelector('.email-list');
    const emailViewer = contentDiv.querySelector('.email-viewer');

    // Generate emails
    const emails = [
        {
            id: 1,
            from: 'prof.johnson@university.edu',
            subject: 'URGENT: Update Your Student Portal Password',
            preview: 'Click here to verify your account...',
            body: `Dear Student,

We have detected unusual activity on your university account.

To protect your account, please click the link below to verify your identity:

[CLICK HERE TO VERIFY: http://secure-verify-portal.com/login]

This is required immediately to avoid account suspension.

Best regards,
Professor Johnson
Department of Computer Science`,
            isPhishing: true
        },
        {
            id: 2,
            from: 'library@university.edu',
            subject: 'Book Reservation Confirmation',
            preview: 'Your book reservation has been processed...',
            body: `Dear Student,

Your requested book "Cybersecurity Fundamentals" has been reserved.

You can pick it up from the main library desk between 9 AM - 5 PM.

Please bring your student ID.

Best regards,
University Library`,
            isPhishing: false
        },
        {
            id: 3,
            from: 'notifications@university.edu',
            subject: 'Deadline Reminder: Project Submission',
            preview: 'Your project is due in 24 hours...',
            body: `Hello,

This is a reminder that your semester project is due in 24 hours.

Please submit through the university portal.

If you have questions, contact your instructor.

Best regards,
Student Services`,
            isPhishing: false
        }
    ];

    // Render email list
    emails.forEach((email, index) => {
        const emailItem = document.createElement('div');
        emailItem.className = 'email-item';
        if (index === 0) emailItem.classList.add('selected');

        emailItem.innerHTML = `
            <div class="email-from">${email.from}</div>
            <div class="email-subject">${email.subject}</div>
            <div class="email-preview">${email.preview}</div>
        `;

        emailItem.addEventListener('click', () => {
            // Update selected state
            emailList.querySelectorAll('.email-item').forEach(item => {
                item.classList.remove('selected');
            });
            emailItem.classList.add('selected');

            // Display email
            displayEmail(emailViewer, email, windowId);
        });

        emailList.appendChild(emailItem);
    });

    // Display first email
    displayEmail(emailViewer, emails[0], windowId);
}

/**
 * Display an email in the viewer
 * @param {HTMLElement} viewer - Email viewer container
 * @param {Object} email - Email object
 * @param {string} windowId - Window ID for action handling
 */
function displayEmail(viewer, email, windowId) {
    const header = viewer.querySelector('.email-header');
    const body = viewer.querySelector('.email-body');
    const actions = viewer.querySelector('.email-actions');

    header.innerHTML = `
        <p><strong>From:</strong> ${email.from}</p>
        <p><strong>Subject:</strong> ${email.subject}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `;

    body.textContent = email.body;

    actions.innerHTML = '';

    if (email.isPhishing) {
        // Phishing email - show scenario choices
        const clickBtn = document.createElement('button');
        clickBtn.className = 'btn-danger';
        clickBtn.textContent = '🔗 Click Link';
        clickBtn.addEventListener('click', () => {
            handlePhishingDecision('click', windowId);
        });

        const reportBtn = document.createElement('button');
        reportBtn.className = 'btn-success';
        reportBtn.textContent = '⚠️ Report Phishing';
        reportBtn.addEventListener('click', () => {
            handlePhishingDecision('report', windowId);
        });

        const ignoreBtn = document.createElement('button');
        ignoreBtn.className = 'btn-secondary';
        ignoreBtn.textContent = '🚫 Ignore';
        ignoreBtn.addEventListener('click', () => {
            handlePhishingDecision('ignore', windowId);
        });

        actions.appendChild(clickBtn);
        actions.appendChild(reportBtn);
        actions.appendChild(ignoreBtn);
    } else {
        // Normal email - show archive/delete buttons
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-secondary';
        deleteBtn.textContent = 'Delete';
        actions.appendChild(deleteBtn);

        const archiveBtn = document.createElement('button');
        archiveBtn.className = 'btn-secondary';
        archiveBtn.textContent = 'Archive';
        actions.appendChild(archiveBtn);
    }
}

/**
 * Initialize browser application
 * @param {string} windowId - Window ID
 * @param {HTMLElement} contentDiv - Content container
 */
function initializeBrowserApp(windowId, contentDiv) {
    const browserTemplate = document.getElementById('browser-template');
    const browserApp = browserTemplate.content.cloneNode(true);
    contentDiv.appendChild(browserApp);

    // Store browser state
    windows[windowId].browserState = {
        currentPage: 'home',
        history: ['home'],
        historyIndex: 0
    };

    loadBrowserPage(windowId, 'home');
}

/**
 * Load a browser page
 * @param {string} windowId - Window ID
 * @param {string} page - Page name
 */
function loadBrowserPage(windowId, page) {
    const window = windows[windowId].element;
    const content = window.querySelector('.browser-content');
    const addressBar = window.querySelector('.address-bar');

    windows[windowId].browserState.currentPage = page;

    content.innerHTML = '';

    switch (page) {
        case 'home':
            addressBar.value = 'about:home';
            content.innerHTML = `
                <div class="website">
                    <div class="website-header">
                        <h1>Welcome to Internet</h1>
                        <p>Your gateway to knowledge</p>
                    </div>
                    <div class="website-content">
                        <h2>Popular Websites</h2>
                        <p>
                            <button class="download-btn" onclick="navigateBrowser(event, 'softwaresite')">🔗 Visit TechSoftware.com (Legitimate)</button>
                        </p>
                        <p>
                            <button class="download-btn warning" onclick="navigateBrowser(event, 'cracked')">🔗 Visit CrackedSoft.xyz (NOT SAFE!)</button>
                        </p>
                    </div>
                </div>
            `;
            break;

        case 'softwaresite':
            addressBar.value = 'https://www.techsoftware.com';
            content.innerHTML = `
                <div class="website">
                    <div class="website-header">
                        <h1>TechSoftware - Legitimate Software</h1>
                        <p>Safe, Official, Verified Downloads</p>
                    </div>
                    <div class="website-content">
                        <h2>PhotoMagic Pro - Image Editor</h2>
                        <p>Professional image editing software. Officially licensed and safe.</p>
                        <p><strong>Price:</strong> $49.99 (30-day free trial available)</p>
                        <div class="download-section">
                            <p>✓ Verified Safe</p>
                            <p>✓ Original Developer</p>
                            <p>✓ 24/7 Support</p>
                            <button class="download-btn" onclick="handleSoftwareDownload(event, 'legitimate')">
                                📥 Download PhotoMagic Pro
                            </button>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'cracked':
            addressBar.value = 'https://cracked-soft.xyz';
            content.innerHTML = `
                <div class="website">
                    <div class="website-header">
                        <h1>Cracked Software - FREE DOWNLOADS!</h1>
                        <p style="color: #ffff00;">Get paid software for FREE!!!</p>
                    </div>
                    <div class="website-content">
                        <h2>PhotoMagic Pro CRACK - 100% Free</h2>
                        <p>Download the full version of PhotoMagic Pro completely FREE!</p>
                        <p style="color: red;"><strong>⚠️ WARNING: This website may contain malware</strong></p>
                        <div class="download-section" style="border: 2px dashed red;">
                            <p>🆓 Completely FREE</p>
                            <p>⚡ No License Key Needed</p>
                            <p>🔓 Full Features Unlocked</p>
                            <button class="download-btn warning" onclick="handleSoftwareDownload(event, 'cracked')">
                                📥 Download NOW (RISKY!)
                            </button>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}

/**
 * Browser navigation handler
 * @param {Event} event - Click event
 * @param {string} page - Page name
 */
function navigateBrowser(event, page) {
    event.preventDefault();
    const window = event.target.closest('.window');
    const windowId = window.id;
    loadBrowserPage(windowId, page);
}

/**
 * Initialize file explorer
 * @param {string} windowId - Window ID
 * @param {HTMLElement} contentDiv - Content container
 */
function initializeFileExplorer(windowId, contentDiv) {
    const explorerTemplate = document.getElementById('file-explorer-template');
    const explorer = explorerTemplate.content.cloneNode(true);
    contentDiv.appendChild(explorer);

    const fileList = contentDiv.querySelector('.file-list');

    // Sample files
    const files = [
        { name: 'Deadline Project.docx', icon: '📄' },
        { name: 'Research Paper.pdf', icon: '📕' },
        { name: 'Presentation.pptx', icon: '📊' },
        { name: 'Data Analysis.xlsx', icon: '📈' },
        { name: 'Notes', icon: '📁', isFolder: true },
        { name: 'Downloads', icon: '📁', isFolder: true }
    ];

    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-icon">${file.icon}</div>
            <div class="file-name">${file.name}</div>
        `;
        fileList.appendChild(fileItem);
    });
}

// ========== GAME MECHANICS ==========

/**
 * Handle phishing email decision
 * @param {string} choice - 'click', 'report', or 'ignore'
 * @param {string} windowId - Window ID
 */
function handlePhishingDecision(choice, windowId) {
    if (gameState.scenariosCompleted.phishing) return;

    gameState.scenariosCompleted.phishing = true;
    gameState.decisions.push({
        scenario: 'phishing',
        choice: choice,
        timestamp: Date.now()
    });

    let isCorrect = false;
    let message = '';

    switch (choice) {
        case 'click':
            isCorrect = false;
            updateSecurityScore(-20);
            updateStress(15);
            message = 'PHISHING DETECTED! ❌\n\nYou clicked the malicious link. Your credentials are now compromised and a credential stealer was installed.\n\nSecurity Score -20';
            break;

        case 'report':
            isCorrect = true;
            updateSecurityScore(20);
            updateStress(-5);
            message = 'EXCELLENT! ✓\n\nYou correctly identified and reported the phishing email. The university IT department has been notified.\n\nSecurity Score +20';
            break;

        case 'ignore':
            isCorrect = true;
            updateSecurityScore(10);
            updateStress(-3);
            message = 'GOOD! ✓\n\nYou ignored the suspicious email. The threat has passed.\n\nSecurity Score +10';
            break;
    }

    showScenarioResult(message, isCorrect);
    checkRansomwareTrigger();
}

/**
 * Handle software download decision
 * @param {Event} event - Click event
 * @param {string} source - 'legitimate' or 'cracked'
 */
function handleSoftwareDownload(event, source) {
    event.preventDefault();

    if (gameState.scenariosCompleted.software) return;

    gameState.scenariosCompleted.software = true;
    gameState.decisions.push({
        scenario: 'software',
        choice: source,
        timestamp: Date.now()
    });

    let isCorrect = false;
    let message = '';

    switch (source) {
        case 'legitimate':
            isCorrect = true;
            updateSecurityScore(15);
            updateStress(-5);
            message = 'SECURE CHOICE! ✓\n\nYou downloaded from the official source. Your system remains safe.\n\nThe software installs without any issues.\n\nSecurity Score +15';
            break;

        case 'cracked':
            isCorrect = false;
            updateSecurityScore(-25);
            updateStress(20);
            message = 'MALWARE DETECTED! ❌\n\nThe cracked version contained ransomware and spyware.\n\nYour files are being encrypted...\n\nSecurity Score -25';
            // Trigger ransomware event after delay
            setTimeout(() => {
                if (gameState.securityScore <= 30) {
                    triggerRansomware();
                }
            }, 2000);
            break;
    }

    showScenarioResult(message, isCorrect);
    checkRansomwareTrigger();
}

/**
 * Show scenario result modal
 * @param {string} message - Result message
 * @param {boolean} isCorrect - Whether the choice was correct
 */
function showScenarioResult(message, isCorrect) {
    const dialog = document.createElement('div');
    dialog.className = 'scenario-dialog';

    const content = document.createElement('div');
    content.className = 'scenario-content';
    content.innerHTML = `
        <h2 class="scenario-title">${isCorrect ? '✓ Correct Decision' : '❌ Wrong Decision'}</h2>
        <div class="scenario-description" style="white-space: pre-line;">${message}</div>
        <button class="btn-primary" onclick="this.closest('.scenario-dialog').remove()">Continue</button>
    `;

    dialog.appendChild(content);
    document.body.appendChild(dialog);

    dialog.querySelector('button').focus();
}

/**
 * Trigger ransomware event
 */
function triggerRansomware() {
    if (gameState.ransomwareTriggered) return;

    gameState.ransomwareTriggered = true;

    // Hide all windows
    Object.values(windows).forEach(win => {
        win.element.style.display = 'none';
    });

    const ransomwareScreen = document.createElement('div');
    ransomwareScreen.className = 'ransomware-screen';
    ransomwareScreen.id = 'ransomware-screen';

    const content = document.createElement('div');
    content.className = 'ransomware-content';
    content.innerHTML = `
        <div class="ransomware-title">SYSTEM LOCKED!</div>
        <div class="ransomware-message">
            Your files have been encrypted by ransomware.<br>
            Pay 500 BITCOIN to unlock your files!<br>
            (This is a simulation - no actual encryption occurred)
        </div>
        <div class="ransomware-timer" id="ransomware-timer">30:00</div>
        <div class="ransomware-buttons">
            <button class="btn-danger" onclick="event.stopPropagation()">Pay Now</button>
            <button class="btn-secondary" onclick="attemptRestore()">Restore from Backup</button>
            <button class="btn-secondary" onclick="shutdownComputer()">Shutdown</button>
        </div>
    `;

    ransomwareScreen.appendChild(content);
    document.getElementById('desktop').appendChild(ransomwareScreen);

    // Countdown timer
    let timeLeft = 30 * 60; // 30 minutes
    const timerDisplay = document.getElementById('ransomware-timer');

    const timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGameLoss('Time expired! Files permanently lost.');
        }
    }, 1000);
}

/**
 * Attempt to restore from backup
 */
function attemptRestore() {
    const ransomwareScreen = document.getElementById('ransomware-screen');

    if (gameState.securityScore >= 40) {
        // Successful restore
        ransomwareScreen.style.display = 'none';

        // Show all windows again
        Object.values(windows).forEach(win => {
            win.element.style.display = 'flex';
        });

        const dialog = document.createElement('div');
        dialog.className = 'scenario-dialog';
        dialog.innerHTML = `
            <div class="scenario-content">
                <h2 class="scenario-title">✓ System Restored!</h2>
                <div class="scenario-description">
                    Your backup was successful! You managed to restore your files.<br>
                    Thanks to your good security practices, you had a recent backup.
                </div>
                <button class="btn-primary" onclick="this.closest('.scenario-dialog').remove()">Continue</button>
            </div>
        `;
        document.body.appendChild(dialog);

        gameState.ransomwareTriggered = false;
        updateSecurityScore(-10); // Small penalty for being infected
        checkGameEnd();
    } else {
        // Backup failed
        const dialog = document.createElement('div');
        dialog.className = 'scenario-dialog';
        dialog.innerHTML = `
            <div class="scenario-content">
                <h2 class="scenario-title">❌ Backup Corrupted!</h2>
                <div class="scenario-description">
                    Your backup was also encrypted by the ransomware.<br>
                    Your files are permanently lost.<br>
                    This could have been prevented with better security practices.
                </div>
                <button class="btn-primary" onclick="endGameLoss('Backup corrupted. Game Over.')">Game Over</button>
            </div>
        `;
        document.body.appendChild(dialog);
    }
}

/**
 * Shutdown computer
 */
function shutdownComputer() {
    endGameLoss('You shut down the computer. Some files may still be encrypted.');
}

/**
 * Check if ransomware should be triggered
 */
function checkRansomwareTrigger() {
    const badDecisions = gameState.decisions.filter(d => {
        if (d.scenario === 'phishing' && d.choice === 'click') return true;
        if (d.scenario === 'software' && d.choice === 'cracked') return true;
        return false;
    }).length;

    // Trigger ransomware if player made multiple bad decisions
    if (badDecisions >= 2 && Math.random() < 0.7) {
        setTimeout(triggerRansomware, 1500);
    }
}

/**
 * Update security score
 * @param {number} delta - Change amount
 */
function updateSecurityScore(delta) {
    gameState.securityScore = Math.max(0, Math.min(gameState.maxSecurityScore, gameState.securityScore + delta));
    const percentage = (gameState.securityScore / gameState.maxSecurityScore) * 100;

    const scoreBar = document.getElementById('security-score-bar');
    scoreBar.style.width = percentage + '%';

    const scoreText = document.getElementById('security-score-text');
    scoreText.textContent = `${gameState.securityScore}/${gameState.maxSecurityScore}`;
}

/**
 * Update stress level
 * @param {number} delta - Change amount
 */
function updateStress(delta) {
    gameState.stressLevel = Math.max(0, Math.min(100, gameState.stressLevel + delta));

    const stressBar = document.getElementById('stress-bar');
    stressBar.style.width = gameState.stressLevel + '%';

    const stressText = document.getElementById('stress-text');
    stressText.textContent = gameState.stressLevel + '%';

    // High stress = bad gameplay
    if (gameState.stressLevel > 80) {
        updateSecurityScore(-2); // Stress affects decision making
    }
}

// ========== START MENU & APP LAUNCHERS ==========

/**
 * Toggle start menu
 */
function toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    startMenu.classList.toggle('hidden');

    // Close menu when clicking outside
    if (!startMenu.classList.contains('hidden')) {
        document.addEventListener('click', closeStartMenuOnClick);
    }
}

/**
 * Close start menu when clicking outside
 */
function closeStartMenuOnClick(event) {
    const startMenu = document.getElementById('start-menu');
    const startButton = document.querySelector('.start-button');

    if (!startMenu.contains(event.target) && event.target !== startButton) {
        startMenu.classList.add('hidden');
        document.removeEventListener('click', closeStartMenuOnClick);
    }
}

/**
 * Open email application
 */
function openEmail() {
    toggleStartMenu();
    createWindow('Email Client', 'email', 800, 500);
}

/**
 * Open browser application
 */
function openBrowser() {
    toggleStartMenu();
    createWindow('Web Browser', 'browser', 900, 600);
}

/**
 * Open file explorer
 */
function openFileExplorer() {
    toggleStartMenu();
    createWindow('File Explorer', 'explorer', 700, 450);
}

/**
 * Browser navigation functions
 */
function browserBack(event) {
    const window = event.target.closest('.window');
    const windowId = window.id;
    const state = windows[windowId].browserState;

    if (state.historyIndex > 0) {
        state.historyIndex--;
        loadBrowserPage(windowId, state.history[state.historyIndex]);
    }
}

function browserForward(event) {
    const window = event.target.closest('.window');
    const windowId = window.id;
    const state = windows[windowId].browserState;

    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        loadBrowserPage(windowId, state.history[state.historyIndex]);
    }
}

function browserRefresh(event) {
    const window = event.target.closest('.window');
    const windowId = window.id;
    const state = windows[windowId].browserState;
    loadBrowserPage(windowId, state.currentPage);
}

// ========== GAME TIMER ==========

/**
 * Start the game timer
 */
function startGameTimer() {
    const timerDisplay = document.getElementById('deadline-timer');

    const timerInterval = setInterval(() => {
        gameState.timeLeft--;

        const hours = Math.floor(gameState.timeLeft / 3600);
        const minutes = Math.floor((gameState.timeLeft % 3600) / 60);
        const seconds = gameState.timeLeft % 60;

        timerDisplay.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Increase stress as time runs out
        if (gameState.timeLeft % 5 === 0) {
            updateStress(1);
        }

        // Game over when time runs out
        if (gameState.timeLeft <= 0) {
            clearInterval(timerInterval);
            checkGameEnd();
        }
    }, 1000);
}

// ========== GAME ENDING ==========

/**
 * Check if game should end
 */
function checkGameEnd() {
    const allScenariosCompleted = Object.values(gameState.scenariosCompleted).filter(Boolean).length >= 2;

    if (allScenariosCompleted || gameState.timeLeft <= 0) {
        endGame();
    }
}

/**
 * End game with loss
 * @param {string} reason - Reason for loss
 */
function endGameLoss(reason) {
    gameState.gameOver = true;

    const endScreen = document.createElement('div');
    endScreen.className = 'end-screen';
    endScreen.innerHTML = `
        <div class="end-screen-content">
            <h1 class="end-title">GAME OVER - SECURITY BREACH</h1>
            <div class="end-message">${reason}</div>
            <div class="end-stats">
                <p>Final Security Score: <strong>${gameState.securityScore}/100</strong></p>
                <p>Final Stress Level: <strong>${gameState.stressLevel}%</strong></p>
            </div>
            <button class="end-button" onclick="restartGame()">Play Again</button>
        </div>
    `;

    document.body.appendChild(endScreen);
}

/**
 * End game with results based on score
 */
function endGame() {
    if (gameState.gameOver) return;
    gameState.gameOver = true;

    let title = '';
    let message = '';

    if (gameState.securityScore >= 80) {
        title = '🏆 EXCELLENT! YOU SURVIVED!';
        message = `You made excellent security decisions and protected your system!\n\nYou completed your deadline project safely with no security breaches.\n\nYour knowledge of cybersecurity threats has been proven valuable.`;
    } else if (gameState.securityScore >= 60) {
        title = '✓ GOOD JOB!';
        message = `You made mostly good security decisions.\n\nYour system had some minor issues but you managed to complete your work.\n\nContinue improving your security awareness.`;
    } else if (gameState.securityScore >= 40) {
        title = '⚠️ YOU STRUGGLED';
        message = `You made several poor security decisions.\n\nYour system was compromised multiple times.\n\nYou need to learn more about cybersecurity threats.`;
    } else {
        title = '❌ SECURITY FAILURE';
        message = `Your poor security choices led to system compromise.\n\nYou failed to complete your project safely.\n\nAlways be vigilant against cyber threats!`;
    }

    const endScreen = document.createElement('div');
    endScreen.className = 'end-screen';
    endScreen.innerHTML = `
        <div class="end-screen-content">
            <h1 class="end-title">${title}</h1>
            <div class="end-message">${message}</div>
            <div class="end-stats">
                <p>Final Security Score: <strong>${gameState.securityScore}/100</strong></p>
                <p>Final Stress Level: <strong>${gameState.stressLevel}%</strong></p>
                <p>Good Decisions: <strong>${gameState.decisions.filter(d => {
                    if (d.scenario === 'phishing' && d.choice === 'report') return true;
                    if (d.scenario === 'phishing' && d.choice === 'ignore') return true;
                    if (d.scenario === 'software' && d.choice === 'legitimate') return true;
                    return false;
                }).length}</strong></p>
                <p>Bad Decisions: <strong>${gameState.decisions.filter(d => {
                    if (d.scenario === 'phishing' && d.choice === 'click') return true;
                    if (d.scenario === 'software' && d.choice === 'cracked') return true;
                    return false;
                }).length}</strong></p>
            </div>
            <button class="end-button" onclick="restartGame()">Play Again</button>
        </div>
    `;

    document.body.appendChild(endScreen);
}

// ========== GAME INITIALIZATION & RESTART ==========

/**
 * Initialize the game
 */
function initializeGame() {
    console.log('🎮 Initializing Deadline 23:59...');

    // Reset game state
    gameState.securityScore = 50;
    gameState.stressLevel = 30;
    gameState.timeLeft = 23 * 60 + 59;
    gameState.gameOver = false;
    gameState.scenariosCompleted = {
        phishing: false,
        software: false,
        ransomware: false
    };
    gameState.decisions = [];
    gameState.ransomwareTriggered = false;

    // Update UI
    updateSecurityScore(0);
    updateStress(0);

    // Start timer
    startGameTimer();

    // Update clock
    updateClock();
    setInterval(updateClock, 1000);

    console.log('✓ Game initialized. Welcome to Deadline 23:59!');
}

/**
 * Update the system clock
 */
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clock-time').textContent = `${hours}:${minutes}`;
}

/**
 * Restart the game
 */
function restartGame() {
    // Remove all windows
    Object.keys(windows).forEach(id => {
        windows[id].element.remove();
    });
    windows = {};
    windowCounter = 0;
    zIndexCounter = 100;

    // Remove taskbar items
    document.getElementById('taskbar-windows').innerHTML = '';

    // Remove end screen
    const endScreen = document.querySelector('.end-screen');
    if (endScreen) {
        endScreen.remove();
    }

    // Remove ransomware screen
    const ransomwareScreen = document.getElementById('ransomware-screen');
    if (ransomwareScreen) {
        ransomwareScreen.remove();
    }

    // Remove any scenario dialogs
    document.querySelectorAll('.scenario-dialog').forEach(dialog => {
        dialog.remove();
    });

    // Reinitialize game
    initializeGame();
}

// ========== START GAME ON PAGE LOAD ==========

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();

    // Auto-open email app for first scenario
    setTimeout(() => {
        openEmail();
    }, 500);
});
