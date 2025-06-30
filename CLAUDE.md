# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fitness tracking application for a dad and son challenge with real-time cloud synchronization. It's a single-page HTML application with embedded CSS and JavaScript that tracks daily workout progress toward a 141-rep goal and syncs data across multiple devices using Firebase Firestore.

## Architecture

- **Single File Application**: The entire app is contained in `index.html`
- **Cloud Storage**: Uses Firebase Firestore for real-time data synchronization
- **Family-Based Sharing**: Multiple devices can sync using a shared Family ID
- **No Build Process**: Static HTML file that can be opened directly in a browser
- **Responsive Design**: Mobile-friendly layout with CSS Grid and Flexbox

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

- **Testing**: Open `index.html` in a web browser
- **Local Storage**: Family ID and user selection stored locally for convenience
- **Firebase Console**: Monitor data at https://console.firebase.google.com
- **Browser DevTools**: Use for debugging Firestore operations

## Features

- Daily 141-rep goal tracking
- 5 exercise types: squats, sit-ups, pushups, Bulgarian squats, lunges
- Streak calculation based on consecutive goal completions
- Real-time progress updates
- CSV data export with complete workout history