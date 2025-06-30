# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fitness tracking application for a dad and son challenge with real-time cloud synchronization. It's a single-page HTML application with embedded CSS and JavaScript that tracks daily workout progress toward a 141-rep goal and syncs data across multiple devices using Firebase Firestore.

## Architecture

- **Modular Design**: Application split into separate files for maintainability
- **Cloud Storage**: Uses Firebase Firestore for real-time data synchronization
- **Family-Based Sharing**: Multiple devices can sync using a shared Family ID
- **No Build Process**: Static files that can be served directly from any web server
- **Responsive Design**: Mobile-friendly layout with CSS Grid and Flexbox

## File Structure

```
/
├── index.html          # Main entry point with HTML structure
├── styles.css          # All CSS styles and responsive design
├── app.js             # Main application logic and UI interactions
├── firebase.js        # Firebase configuration and database operations
└── CLAUDE.md          # This documentation file
```

## Key Components

- **Family ID System**: Simple identification system for syncing between devices
- **Progress Tracking**: Visual progress bars and stats for both users
- **Workout Logger**: Form to add exercises with rep counts
- **Session History**: Today's workout sessions displayed per user
- **Data Export**: CSV export functionality for all historical data
- **User Switching**: Toggle between Dad and Son for logging workouts
- **Real-time Sync**: Automatic updates when data changes on other devices

## Firebase Integration

- **Database**: Uses Firebase Firestore in test mode
- **Project ID**: `dad-v-son-fitness-challenge`
- **Data Structure**: Documents stored under `families/{familyId}` collection
- **Real-time Listeners**: Automatic UI updates when data changes

## Data Structure

Workout data is stored in Firestore with the following structure:
```javascript
{
  "Dad": {
    "2024-01-01": {
      "sessions": [{ exercise, reps, time, timestamp }],
      "totalReps": 150,
      "goalMet": false
    }
  },
  "Son": { /* same structure */ },
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

## Development

- **Local Development**: Serve files from a local web server (required for ES6 modules)
  - `python -m http.server 8000` or `npx serve .`
- **File Dependencies**: `app.js` imports `firebase.js` using ES6 modules
- **Local Storage**: Family ID and user selection stored locally for convenience
- **Firebase Console**: Monitor data at https://console.firebase.google.com
- **Browser DevTools**: Use for debugging Firestore operations and module imports

## Key Files

- **`index.html`**: Clean HTML structure with minimal inline styles
- **`styles.css`**: Complete CSS with responsive design and component styles
- **`firebase.js`**: Firebase service class with all database operations
- **`app.js`**: Main application logic, event handlers, and UI updates

## Features

- Daily 141-rep goal tracking
- 5 exercise types: squats, sit-ups, pushups, Bulgarian squats, lunges
- Streak calculation based on consecutive goal completions
- Real-time progress updates
- CSV data export with complete workout history