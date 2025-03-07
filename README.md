# Subbaiah Multi Brand Auto - Service Management System

A comprehensive mechanic's service record management system built with React, Firebase, and modern web technologies.

## Features

- 🚗 Real-time service record tracking
- 📊 Advanced service history analytics
- 📅 Daily and monthly service statistics
- 📱 Mobile-friendly interface
- 🔍 Vehicle number-based search
- 💰 Cost tracking and analysis

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or later)
- npm (included with Node.js)
- A Firebase account and project

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Realtime Database:
   - Go to "Realtime Database" in the sidebar
   - Click "Create Database"
   - Start in test mode
4. Get your Firebase configuration:
   - Go to Project Settings (gear icon)
   - Under "Your apps", click the web icon (</>)
   - Register your app
   - Copy the configuration values

## Environment Setup

1. Clone the repository
2. Create a `.env` file in the root directory with the following variables:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_APP_ID=your_app_id
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

1. **Home Page**:
   - Enter vehicle number to search records
   - Access analytics dashboard
   - View service history

2. **Service Entry**:
   - Add new service records
   - Record spare parts and costs
   - Calculate total service cost

3. **Service History**:
   - View complete service timeline
   - Track all services for a vehicle
   - Monitor costs and parts

4. **Analytics**:
   - View today's service summary
   - Check date-wise analytics
   - Monitor monthly revenue trends

## Technology Stack

- Frontend: React with TypeScript
- UI Components: shadcn/ui
- State Management: TanStack Query
- Routing: wouter
- Database: Firebase Realtime Database
- Charts: Recharts
- Forms: React Hook Form
- Validation: Zod

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Firebase and utility functions
│   │   ├── pages/        # Application pages
│   │   └── App.tsx       # Main application component
├── server/               # Backend server files
├── shared/              # Shared types and schemas
└── package.json         # Project dependencies
```

## Firebase Database Rules

For development, use these rules in your Firebase Console:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Note: For production, implement proper authentication and security rules.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

For any questions or issues, please open an issue in the repository.
