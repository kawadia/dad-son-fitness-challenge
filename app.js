// Main application JavaScript
import { firebaseService } from './firebase.js';

// Global state
let currentUser = 'Dad';
let workoutData = {};
let familyId = null;
let dateTimeInterval;

const exercises = {
    'squats': '🏋️',
    'sit-ups': '🤸',
    'pushups': '💪',
    'Bulgarian squats': '🦵',
    'lunges': '🏃'
};

const today = new Date().toISOString().split('T')[0];

// Connect to family
async function connectFamily() {
    const familyIdInput = document.getElementById('family-id-input');
    const inputValue = familyIdInput.value.trim();
    
    if (!inputValue) {
        alert('Please enter a family ID');
        return;
    }
    
    familyId = inputValue.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    try {
        // Save family ID locally
        localStorage.setItem('familyId', familyId);
        
        // Set family ID in Firebase service
        firebaseService.setFamilyId(familyId);
        
        // Initialize data structure
        const loadedData = await firebaseService.initializeData();
        if (loadedData) {
            workoutData = loadedData;
        }
        
        // Ensure today's data exists
        ensureTodaysData();
        
        // Set up real-time listener
        setupRealtimeListener();
        
        // Load saved user selection
        loadSavedUserSelection();
        
        // Update UI
        document.getElementById('family-setup').style.display = 'none';
        document.getElementById('connected-status').style.display = 'block';
        document.getElementById('current-family-id').textContent = inputValue;
        
        updateDisplay();
        selectUser(currentUser);
        updateUndoButton();
        
    } catch (error) {
        console.error('Error connecting to family:', error);
        alert('Error connecting: ' + error.message + '. Please check the browser console for details.');
    }
}

// Ensure today's data exists for both users
function ensureTodaysData() {
    ['Dad', 'Son'].forEach(user => {
        if (!workoutData[user]) workoutData[user] = {};
        if (!workoutData[user][today]) {
            workoutData[user][today] = {
                sessions: [],
                totalReps: 0,
                goalMet: false
            };
        }
    });
}

// Load saved user selection
function loadSavedUserSelection() {
    try {
        const savedUser = localStorage.getItem('selectedUser');
        if (savedUser && (savedUser === 'Dad' || savedUser === 'Son')) {
            currentUser = savedUser;
        }
    } catch (error) {
        console.error('Error loading saved user:', error);
    }
}

// Set up real-time listener
function setupRealtimeListener() {
    firebaseService.setupRealtimeListener((data) => {
        workoutData = data;
        ensureTodaysData();
        updateDisplay();
        updateUndoButton();
    });
}

// Select user for logging
function selectUser(user) {
    currentUser = user;
    document.getElementById('dad-tab').classList.toggle('active', user === 'Dad');
    document.getElementById('son-tab').classList.toggle('active', user === 'Son');
    document.getElementById('current-user').textContent = user;
    updateUndoButton();
    
    // Save user selection to localStorage
    try {
        localStorage.setItem('selectedUser', user);
    } catch (error) {
        console.error('Error saving user selection:', error);
    }
}

// Add workout
async function addWorkout() {
    if (!familyId) {
        alert('Please connect to your family first!');
        return;
    }
    
    const exercise = document.getElementById('exercise-select').value;
    const repsInput = document.getElementById('reps-input');
    const reps = parseInt(repsInput.value);
    
    if (!reps || reps <= 0) return;

    const session = {
        exercise: exercise,
        reps: reps,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString()
    };

    if (!workoutData[currentUser][today]) {
        workoutData[currentUser][today] = { sessions: [], totalReps: 0, goalMet: false };
    }
    
    const userToday = workoutData[currentUser][today];
    userToday.sessions.push(session);
    userToday.totalReps += reps;
    userToday.goalMet = userToday.totalReps >= 141;

    repsInput.value = '';
    
    // Save to Firestore
    await firebaseService.saveData(workoutData);
    
    // Update display immediately for responsiveness
    updateDisplay();
    updateUndoButton();
}

// Undo last workout
async function undoLastWorkout() {
    if (!familyId) {
        alert('Please connect to your family first!');
        return;
    }
    
    const userToday = workoutData[currentUser][today];
    if (!userToday || userToday.sessions.length === 0) {
        return; // No sessions to undo
    }
    
    // Remove the last session
    const lastSession = userToday.sessions.pop();
    userToday.totalReps -= lastSession.reps;
    userToday.goalMet = userToday.totalReps >= 141;
    
    // Save to Firestore
    await firebaseService.saveData(workoutData);
    
    // Update display immediately for responsiveness
    updateDisplay();
    updateUndoButton();
}

// Get today's progress for user
function getTodaysProgress(user) {
    const todayData = workoutData[user] && workoutData[user][today];
    return todayData ? todayData.totalReps : 0;
}

// Get today's sessions for user
function getTodaysSessions(user) {
    const todayData = workoutData[user] && workoutData[user][today];
    return todayData ? todayData.sessions : [];
}

// Calculate streak for user
function calculateStreak(user) {
    const userData = workoutData[user] || {};
    const dates = Object.keys(userData).sort().reverse();
    let streak = 0;
    
    for (const date of dates) {
        if (userData[date] && userData[date].goalMet) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

// Update display
function updateDisplay() {
    ['Dad', 'Son'].forEach(user => {
        const progress = getTodaysProgress(user);
        const sessions = getTodaysSessions(user);
        const streak = calculateStreak(user);
        const percentage = Math.min((progress / 141) * 100, 100);
        
        const userLower = user.toLowerCase();
        
        // Update progress
        document.getElementById(`${userLower}-progress`).textContent = `${progress}/141 💪`;
        document.getElementById(`${userLower}-progress-fill`).style.width = `${percentage}%`;
        document.getElementById(`${userLower}-goal`).style.display = progress >= 141 ? 'block' : 'none';
        
        // Update stats
        document.getElementById(`${userLower}-streak`).textContent = `${streak} days 🏆`;
        document.getElementById(`${userLower}-sessions`).textContent = `${sessions.length} 💯`;
        
        // Update sessions list
        const sessionsList = document.getElementById(`${userLower}-sessions-list`);
        if (sessions.length === 0) {
            sessionsList.innerHTML = '<div class="empty-sessions">😴 No workouts logged today</div>';
        } else {
            sessionsList.innerHTML = sessions.map(session => `
                <div class="session-item">
                    <div class="session-info">
                        <span class="session-emoji">${exercises[session.exercise] || '💪'}</span>
                        <span class="session-exercise">${session.exercise}</span>
                        <span class="session-reps">${session.reps} reps</span>
                    </div>
                    <span class="session-time">⏰ ${session.time}</span>
                </div>
            `).join('');
        }
    });
}

// Update undo button state
function updateUndoButton() {
    const undoButton = document.getElementById('undo-button');
    const userToday = workoutData[currentUser] && workoutData[currentUser][today];
    const hasWorkouts = userToday && userToday.sessions && userToday.sessions.length > 0;
    
    undoButton.disabled = !hasWorkouts;
}

// Update date and time info
function updateDateTime() {
    try {
        const now = new Date();
        
        // Format date
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = now.toLocaleDateString('en-US', dateOptions);
        
        // Format current time
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        };
        const currentTime = now.toLocaleTimeString('en-US', timeOptions);
        
        // Calculate time left in day
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const timeLeft = endOfDay - now;
        
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        const timeLeftString = `${hoursLeft}h ${minutesLeft}m`;
        
        // Update the display
        const dateTimeInfo = document.getElementById('date-time-info');
        if (dateTimeInfo) {
            dateTimeInfo.innerHTML = `📅 ${formattedDate} | ⏰ ${currentTime} | ⏳ ${timeLeftString} left today`;
        }
    } catch (error) {
        console.error('Error updating date/time:', error);
        const dateTimeInfo = document.getElementById('date-time-info');
        if (dateTimeInfo) {
            dateTimeInfo.innerHTML = '📅 Error loading date/time';
        }
    }
}

// Start date/time updates
function startDateTimeUpdates() {
    updateDateTime(); // Update immediately
    dateTimeInterval = setInterval(updateDateTime, 1000); // Update every second
}

// Stop date/time updates
function stopDateTimeUpdates() {
    if (dateTimeInterval) {
        clearInterval(dateTimeInterval);
    }
}

// Export to CSV
function exportToCSV() {
    const csvData = [];
    csvData.push(['Date', 'User', 'Exercise', 'Reps', 'Time', 'Daily Total', 'Goal Met']);

    ['Dad', 'Son'].forEach(user => {
        const userData = workoutData[user] || {};
        const sortedDates = Object.keys(userData).sort();
        
        sortedDates.forEach(date => {
            const dayData = userData[date];
            if (dayData.sessions.length === 0) {
                csvData.push([date, user, 'No workouts', 0, '', dayData.totalReps, dayData.goalMet ? 'Yes' : 'No']);
            } else {
                dayData.sessions.forEach((session, index) => {
                    csvData.push([
                        date, user, session.exercise, session.reps, session.time,
                        index === 0 ? dayData.totalReps : '', 
                        index === 0 ? (dayData.goalMet ? 'Yes' : 'No') : ''
                    ]);
                });
            }
        });
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fitness-data-${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize data
function initializeData() {
    // Check if family ID is already saved
    try {
        const savedFamilyId = localStorage.getItem('familyId');
        if (savedFamilyId) {
            familyId = savedFamilyId;
            document.getElementById('family-id-input').value = savedFamilyId;
            connectFamily();
        }
    } catch (error) {
        console.error('Error loading saved family ID:', error);
    }
}

// Event listeners setup
function setupEventListeners() {
    // Reps input validation
    document.getElementById('reps-input').addEventListener('input', function() {
        const hasValue = this.value && parseInt(this.value) > 0;
        document.getElementById('add-button').disabled = !hasValue;
    });

    // Enter key support
    document.getElementById('reps-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addWorkout();
        }
    });

    document.getElementById('family-id-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            connectFamily();
        }
    });
}

// Make functions available globally for HTML onclick handlers
window.connectFamily = connectFamily;
window.selectUser = selectUser;
window.addWorkout = addWorkout;
window.undoLastWorkout = undoLastWorkout;
window.exportToCSV = exportToCSV;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    initializeData();
    startDateTimeUpdates();
});