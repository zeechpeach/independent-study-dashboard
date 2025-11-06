# Independent Study Dashboard

A React-based web application for managing independent study programs, built for BCIL. Students can track goals, book meetings, submit reflections, and view important dates. Administrators can monitor student progress and manage the system.

## Features

### For Students

- 📝 **Reflection Forms**: Pre-meeting and post-meeting reflections
- 🎯 **Goal Tracking**: Set and monitor learning objectives
- 📅 **Meeting Management**: Book meetings and view history
- 🔗 **Calendly Integration**: Automatic meeting sync from Calendly webhooks
- 📋 **Important Dates**: View competitions, deadlines, and events
- 📊 **Progress Visualization**: Track learning journey over time

### For Administrators

- 👥 **Student Overview**: Monitor all students' progress
- 📈 **Analytics Dashboard**: Track engagement and outcomes
- 📅 **Calendar Integration**: Manage meetings and scheduling (including Calendly webhooks)
- 🗓️ **Important Dates**: Add and manage system-wide dates
- 📊 **Reporting**: Export data and generate reports

## Tech Stack

- **Frontend**: React 18, React Router, Lucide Icons
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **APIs**: Google Calendar API for meeting management
- **Styling**: Custom CSS with utility classes
- **Deployment**: Vercel / Firebase Hosting

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

Create a `.env.local` file with:
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
REACT_APP_ADMIN_EMAIL=admin@example.com
```

**Environment Variables:**
- `REACT_APP_FIREBASE_*`: Firebase project configuration (client-side config, safe to expose)
- `REACT_APP_ADMIN_EMAIL`: Email address of the application administrator

**Note:** All environment variables must start with `REACT_APP_` to be accessible in the React application.

### Calendly Integration Setup

For automatic meeting synchronization with Calendly, see the detailed setup guide:
[Calendly Webhook Integration Setup](docs/calendly-webhook-setup.md)

This includes:
- Firebase Cloud Functions deployment
- Calendly webhook configuration  
- Environment variable setup for Vercel
- Testing and troubleshooting guides

## Deployment

### Vercel (Recommended)

This application is configured for deployment on Vercel:

1. **Connect your repository** to Vercel
2. **Build settings:**
   - Build Command: `npm run build`
   - Output Directory: `build`
3. **Environment Variables:** Add all required variables from `.env.example`
4. **Deploy:** Vercel will automatically deploy on push to main branch

### Firebase Hosting

```bash
npm run build
firebase deploy
```

### Firebase Storage CORS Configuration

To enable media uploads from the Vercel app and local development, you need to configure CORS for your Firebase Storage bucket:

1. **Install Google Cloud SDK** (if not already installed):
   ```bash
   # Follow instructions at: https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   ```

3. **Apply CORS configuration**:
   ```bash
   gsutil cors set cors.json gs://YOUR_PROJECT_ID.appspot.com
   ```
   Replace `YOUR_PROJECT_ID` with your actual Firebase project ID.

4. **Verify CORS configuration**:
   ```bash
   gsutil cors get gs://YOUR_PROJECT_ID.appspot.com
   ```

The `cors.json` file is already configured to allow requests from:
- Production: `https://independent-study-dashboard.vercel.app`
- Local development: `http://localhost:3000`

**Note:** CORS configuration is required for the media upload feature to work properly. Without it, file uploads will fail with CORS policy errors.

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
