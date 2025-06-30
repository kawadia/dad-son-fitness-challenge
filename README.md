# 💪 Dad & Son Fitness Challenge

A real-time fitness tracking application for families to motivate each other and track daily workout progress together. Features cloud synchronization, progress charts, and friendly competition!

## ✨ Features

- 🎯 **Daily Goal Tracking**: 141 reps per day target
- 👨‍👦 **Dual User Support**: Separate tracking for Dad and Son
- ☁️ **Real-time Sync**: Data syncs instantly across all devices
- 📊 **Progress Charts**: Visual 2-week progress comparison
- 🔥 **Streak Tracking**: Consecutive days of goal completion
- 📱 **Mobile Friendly**: Responsive design for all devices
- 📈 **Historical Data**: Complete workout history with CSV export

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/dad-son-fitness-challenge.git
cd dad-son-fitness-challenge
```

### 2. Serve the Application
```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx serve .

# Or using any other local server
```

### 3. Open in Browser
Navigate to `http://localhost:8000`

## 🔧 Firebase Setup (For Your Own Instance)

If you want to create your own version:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database in "Test mode"
4. Get your Firebase config from Project Settings
5. Replace the values in `config.js` with your credentials
6. Set up the security rules shown in the Security section

## 🏗️ File Structure

```
/
├── index.html              # Main application entry point
├── styles.css              # All CSS styles and responsive design
├── app.js                  # Main application logic and UI interactions
├── firebase.js             # Firebase service and database operations
├── config.js               # Firebase credentials (gitignored)
├── config.example.js       # Template for Firebase setup
├── .gitignore             # Git ignore rules
├── CLAUDE.md              # Development documentation
└── README.md              # This file
```

## 🎮 How to Use

1. **Family Setup**: Enter a shared family name to sync data across devices
2. **Select User**: Choose between Dad or Son for logging workouts
3. **Log Workouts**: Select exercise type and enter reps completed
4. **Track Progress**: View real-time progress bars and daily goals
5. **View History**: Check the 2-week progress chart and session history
6. **Export Data**: Download complete workout history as CSV

## 🏋️ Exercise Types

- 🏋️ Squats
- 🤸 Sit-ups  
- 💪 Pushups
- 🦵 Bulgarian squats
- 🏃 Lunges

## 🔧 Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6 modules)
- **Database**: Firebase Firestore
- **Charts**: Chart.js
- **Hosting**: GitHub Pages compatible
- **No Build Process**: Direct file serving

## 🛡️ Security

- **Client-side credentials**: Firebase config is public (standard for web apps)
- **Database security**: Protected via Firestore security rules
- **Family-based access**: Each family can only access their own data
- **No authentication required**: Simple family ID system for ease of use

### Recommended Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{familyId} {
      // Allow access only to valid family IDs (3-50 characters, alphanumeric)
      allow read, write: if familyId.matches('^[a-z0-9]+$') && 
                           familyId.size() >= 3 && 
                           familyId.size() <= 50;
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Goals & Motivation

Built to encourage family fitness through:
- **Accountability**: Real-time progress sharing
- **Competition**: Visual progress comparisons
- **Consistency**: Daily goal tracking and streaks
- **Motivation**: Celebrating achievements together

---

💪 **Stay Strong Together!** 🔥