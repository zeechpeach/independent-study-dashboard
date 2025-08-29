# Independent Study Dashboard

A React-based web application for managing independent study programs, built for BCIL. Students can track goals, book meetings, submit reflections, and view important dates. Administrators can monitor student progress and manage the system.

## Features

### For Students

- 📝 **Reflection Forms**: Pre-meeting and post-meeting reflections
- 🎯 **Goal Tracking**: Set and monitor learning objectives
- 📅 **Meeting Management**: Book meetings and view history
- 📋 **Important Dates**: View competitions, deadlines, and events
- 📊 **Progress Visualization**: Track learning journey over time

### For Administrators

- 👥 **Student Overview**: Monitor all students' progress
- 📈 **Analytics Dashboard**: Track engagement and outcomes
- 📅 **Calendar Integration**: Manage meetings and scheduling
- 🗓️ **Important Dates**: Add and manage system-wide dates
- 📊 **Reporting**: Export data and generate reports

## Tech Stack

- **Frontend**: React 18, React Router, Lucide Icons
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **APIs**: Google Calendar API for meeting management
- **Styling**: Custom CSS with utility classes
- **Deployment**: GitHub Pages / Firebase Hosting

## Getting Started

### Prerequisites

- Node.js 16 or higher
- Firebase project
- Google Cloud Console project (for Calendar API)

### Installation

1. **Clone and install dependencies**

   ```bash
   npm install
   ```

2. **Set up Firebase**

   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Google sign-in)
   - Enable Firestore Database
   - Get your Firebase config values

3. **Set up Google Calendar API**

   - Go to Google Cloud Console
   - Enable Calendar API
   - Create credentials (API key and OAuth client)

4. **Configure environment variables**

   - Update `.env.local` with your Firebase and Google API credentials
   - Set the admin email address

5. **Run the development server**
   ```bash
   npm start
   ```

### Environment Variables

Create a `.env.local` file with:

```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

REACT_APP_GOOGLE_CALENDAR_API_KEY=your_calendar_api_key
REACT_APP_GOOGLE_CALENDAR_ID=your_calendar_id

REACT_APP_ADMIN_EMAIL=zchien@bwscampus.com
```

## Deployment

### GitHub Pages

```bash
npm run build
npm run deploy
```

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin-specific components
│   ├── student/        # Student-specific components
│   └── shared/         # Shared UI components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Main page components
├── services/           # API services and utilities
└── styles/             # CSS styles
```

## Data Models

### User

```javascript
{
  email: string,
  name: string,
  photoURL: string,
  isAdmin: boolean,
  createdAt: timestamp,
  lastLoginAt: timestamp
}
```

### Reflection

```javascript
{
  userId: string,
  type: 'pre-meeting' | 'post-meeting',
  accomplishments: string,
  challenges: string,
  questions: string,
  goals: string,
  createdAt: timestamp
}
```

### Goal

```javascript
{
  userId: string,
  title: string,
  description: string,
  targetDate: timestamp,
  status: 'active' | 'completed' | 'paused',
  progress: number,
  createdAt: timestamp
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For technical issues or feature requests, contact the development team or create an issue in the repository.

## License

This project is proprietary software developed for BCIL educational use.
