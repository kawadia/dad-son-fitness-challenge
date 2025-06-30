# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React TypeScript fitness tracking application for a dad and son challenge with real-time cloud synchronization. It tracks daily workout progress toward a 141-rep goal and syncs data across multiple devices using Firebase Firestore.

## Architecture

- **React TypeScript**: Modern component-based architecture with full type safety
- **Component Design**: Modular React components for maintainability and reusability  
- **Cloud Storage**: Uses Firebase Firestore for real-time data synchronization
- **Family-Based Sharing**: Multiple devices can sync using a shared Family ID
- **Build Process**: Optimized production builds with Create React App
- **Responsive Design**: Mobile-friendly layout with CSS Grid and Flexbox

## File Structure

```
/
├── fitness-tracker-react/     # React TypeScript application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Header.tsx     # Family connection UI
│   │   │   ├── ProgressSection.tsx  # Progress bars and stats
│   │   │   ├── WorkoutLogger.tsx    # Exercise logging form
│   │   │   ├── SessionsList.tsx     # Daily workout sessions
│   │   │   ├── ProgressChart.tsx    # Chart.js visualization
│   │   │   └── ExportButton.tsx     # CSV export functionality
│   │   ├── hooks/
│   │   │   └── useFitnessData.ts    # Custom React hook for state management
│   │   ├── services/
│   │   │   └── firebase.ts          # TypeScript Firebase service
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── App.tsx                  # Main application component
│   │   └── App.css                  # Application styles
│   ├── build/                       # Production build output
│   └── package.json                 # Dependencies and scripts
├── firebase.json                    # Firebase hosting configuration
├── deploy.sh                        # Deployment script
├── config.js                        # Firebase configuration
└── CLAUDE.md                        # This documentation file
```

## Key Components

- **Family ID System**: Simple identification system for syncing between devices
- **Progress Tracking**: Visual progress bars and stats for both users
- **Workout Logger**: Form to add exercises with rep counts
- **Session History**: Today's workout sessions displayed per user
- **Data Export**: CSV export functionality for all historical data
- **User Switching**: Toggle between Dad and Son for logging workouts
- **Real-time Sync**: Automatic updates when data changes on other devices
- **Progress Chart**: 14-day progress visualization with Chart.js

## Firebase Integration

- **Database**: Uses Firebase Firestore in test mode
- **Project ID**: `dad-v-son-fitness-challenge`
- **Data Structure**: Documents stored under `families/{familyId}` collection
- **Real-time Listeners**: Automatic UI updates when data changes
- **TypeScript Integration**: Fully typed Firebase service and data structures

## Data Structure

Workout data is stored in Firestore with the following structure:
```typescript
interface WorkoutData {
  Dad: UserData;
  Son: UserData;
  lastUpdated?: string;
}

interface UserData {
  [date: string]: DayData;
}

interface DayData {
  sessions: WorkoutSession[];
  totalReps: number;
  goalMet: boolean;
}
```

## Development

- **Local Development**: 
  - `cd fitness-tracker-react && npm start` (http://localhost:3000)
- **Production Build**: `cd fitness-tracker-react && npm run build`
- **TypeScript**: Full type checking and IntelliSense support
- **Local Storage**: Family ID and user selection stored locally for convenience
- **Firebase Console**: Monitor data at https://console.firebase.google.com
- **React DevTools**: Use for debugging components and state

## Deployment

- **Command**: `./deploy.sh` from root directory
- **Process**: Builds React app → Deploys to Firebase Hosting
- **Live URL**: https://dad-v-son-fitness-challenge.web.app

## Key Technologies

- **Frontend**: React 18 with TypeScript
- **Charts**: Chart.js with react-chartjs-2
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **Build Tool**: Create React App
- **Styling**: CSS with responsive design

## Features

- Daily 141-rep goal tracking
- 5 exercise types: squats, sit-ups, pushups, Bulgarian squats, lunges
- Streak calculation based on consecutive goal completions
- Real-time progress updates
- CSV data export with complete workout history