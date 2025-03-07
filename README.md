# Subbaiah Multi Brand Auto - Service Management System

A comprehensive vehicle service management system built with React, Firebase, Express, and modern web technologies. This application helps automotive service centers manage their service records, track vehicle history, and analyze service data.

## Features

- 🚗 Real-time service record tracking
- 📊 Advanced service history analytics
- 📅 Daily and monthly service statistics
- 📱 Mobile-friendly interface
- 🔍 Vehicle number-based search
- 💰 Cost tracking and analysis
- 🔄 Real-time updates with Firebase
- 🎨 Modern UI with shadcn/ui components

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or later)
- npm (included with Node.js)
- A Firebase account and project

## Project Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd VehicleServiceTracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Realtime Database:
     - Go to "Realtime Database" in the sidebar
     - Click "Create Database"
     - Choose your preferred location
     - Start in test mode

4. Configure environment variables:
   - Create a `.env` file in the `client` directory
   - Add the following configuration (replace with your Firebase project values):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
├── client/                  # Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   ├── pages/         # Application pages
│   │   └── App.tsx        # Main application component
│   └── .env               # Frontend environment variables
├── server/                 # Backend server
│   ├── routes/            # API routes
│   ├── index.ts           # Server entry point
│   └── vite.ts            # Vite server integration
├── shared/                # Shared types and utilities
└── package.json           # Project dependencies

## Technology Stack

- **Frontend**:
  - React with TypeScript
  - TanStack Query for data fetching
  - shadcn/ui for UI components
  - Tailwind CSS for styling
  - wouter for routing
  - Firebase SDK for real-time data

- **Backend**:
  - Express.js
  - Firebase Admin SDK
  - TypeScript

- **Database**:
  - Firebase Realtime Database

## Features in Detail

### 1. Service Record Management
- Create and update service records
- Track service status
- Record parts and labor costs
- Add service notes and recommendations

### 2. Vehicle History
- Complete service history by vehicle
- Previous service details
- Cost history
- Service intervals

### 3. Analytics Dashboard
- Daily service summary
- Monthly revenue trends
- Popular services
- Customer statistics

### 4. Search and Filters
- Search by vehicle number
- Filter by date range
- Filter by service type
- Sort by various parameters

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Security Notes

- For production deployment, ensure proper Firebase security rules are in place
- Never commit `.env` files to version control
- Implement proper authentication before deployment
- Regular security audits are recommended

## Support

For issues and feature requests, please create an issue in the repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
