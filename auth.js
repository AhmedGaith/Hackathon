// auth.js - Handles sign up and log in using localStorage

function getAccounts() {
    return JSON.parse(localStorage.getItem('accounts') || '{}');
}

function saveAccounts(accounts) {
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

// SIGN UP
if (document.getElementById('signup-form')) {
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value;
        const message = document.getElementById('signup-message');
        let accounts = getAccounts();
        if (accounts[username]) {
            message.textContent = 'Username already exists!';
            message.style.color = '#c62828';
            return;
        }
        accounts[username] = { password };
        saveAccounts(accounts);
        message.textContent = 'Account created! You can now log in.';
        message.style.color = '#2e7d32';
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    });
}

// LOG IN
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const message = document.getElementById('login-message');
        let accounts = getAccounts();
        if (!accounts[username] || accounts[username].password !== password) {
            message.textContent = 'Invalid username or password!';
            message.style.color = '#c62828';
            return;
        }
        // Save session
        localStorage.setItem('currentUser', username);
        message.textContent = 'Login successful! Redirecting...';
        message.style.color = '#2e7d32';
        setTimeout(() => { window.location.href = 'main.html'; }, 1200);
    });
}

// Optional: Add a logout function for main.html
window.logout = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
};
