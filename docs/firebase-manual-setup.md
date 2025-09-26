# Firebase Manual Setup Guide

## Overview

This guide walks you through the manual Firebase configuration needed to make your Independent Study Dashboard fully functional. After the recent code fixes, you'll need to configure several Firebase services manually.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- A Firebase project already created
- Admin access to your Firebase project

## Step 1: Firebase Project Configuration

### 1.1 Verify Your Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Note down your Project ID (you'll need this)

### 1.2 Get Firebase Configuration Values
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. If you haven't created a web app yet:
   - Click "Add app" → Web app icon
   - Register your app with a name
4. Copy the configuration values for your `.env.local` file:

```
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_ADMIN_EMAIL=zchien@bwscampus.com
```

## Step 2: Authentication Setup

### 2.1 Enable Google Authentication
1. In Firebase Console → **Authentication**
2. Click **Get started** if not already enabled
3. Go to **Sign-in method** tab
4. Click **Google** → **Enable**
5. Set support email (use your admin email)
6. **Important**: Add your domain to authorized domains:
   - Add your production domain (e.g., `yourdomain.com`)
   - Add `localhost` for development

### 2.2 Configure Authorized Domains
1. In Authentication → Settings → Authorized domains
2. Add your deployment domains:
   - Your production domain
   - Your Vercel deployment domain (if using Vercel)
   - `localhost` (for development)

## Step 3: Firestore Database Setup

### 3.1 Create Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in production mode** (security rules will be deployed)
3. Select your preferred region (recommend same as your users)

### 3.2 Deploy Firestore Security Rules
```bash
# From your project root
firebase login
firebase use your-project-id
firebase deploy --only firestore:rules
```

### 3.3 Create Required Collections Structure
The app expects these collections to exist (they'll be created automatically when first used):
- `users` - User profiles and onboarding data
- `meetings` - Student-advisor meetings
- `reflections` - Student reflections
- `goals` - Student goals
- `importantDates` - Important dates and deadlines
- `advisor_pathways` - Advisor pathway assignments
- `calendly_events` - Calendly webhook events

### 3.4 Set Up Firestore Indexes (if needed)
If you encounter composite index errors in the console, create this file:

```bash
# Create firestore.indexes.json if it doesn't exist
echo '{"indexes": [], "fieldOverrides": []}' > firestore.indexes.json
firebase deploy --only firestore:indexes
```

## Step 4: Cloud Functions Setup

### 4.1 Initialize Functions (if not done)
```bash
cd functions/
npm install
```

### 4.2 Deploy Cloud Functions
```bash
# From project root
firebase deploy --only functions
```

### 4.3 Configure Function Environment Variables
```bash
# Set Calendly webhook secret for Cloud Functions
firebase functions:config:set calendly.webhook_secret="your_calendly_webhook_secret_here"

# Redeploy functions to apply config
firebase deploy --only functions
```

## Step 5: Calendly Integration (Optional)

### 5.1 Set Up Calendly Webhook
1. Go to [Calendly Developer Console](https://calendly.com/integrations/api_webhooks)
2. Create a new webhook with URL: `https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/calendlyWebhook`
3. Subscribe to events: `invitee.created`, `invitee.canceled`
4. Generate a webhook secret and use it in the function config above

## Step 6: Common Console Errors and Solutions

### Error: "Missing required Firebase environment variables"
**Solution**: Ensure all environment variables are set in your `.env.local` file

### Error: "Permission denied" 
**Solutions**:
1. Deploy security rules: `firebase deploy --only firestore:rules`
2. Ensure user is authenticated with @bwscampus.com email
3. Check that zchien@bwscampus.com is set as admin email

### Error: "Failed to get document" or "QuerySnapshot errors"
**Solutions**:
1. Create collections by adding a test document manually in Firestore Console
2. Ensure Firestore is in production mode, not test mode
3. Check security rules are deployed

### Error: "Auth domain not authorized"
**Solution**: Add your domain to authorized domains in Authentication settings

### Error: "Function not found" (for Calendly webhooks)
**Solutions**:
1. Deploy functions: `firebase deploy --only functions`
2. Check function URL format matches your project ID
3. Verify webhook secret is configured

## Step 7: Testing Your Setup

### 7.1 Test Authentication
1. Try signing in with a @bwscampus.com Google account
2. Check browser console for any auth errors
3. Verify user document is created in `users` collection

### 7.2 Test Firestore Access
1. As admin (zchien@bwscampus.com), try creating important dates
2. As student, try creating reflections/goals
3. Check Firestore Console to see data is being saved

### 7.3 Test Functions
```bash
# View function logs
firebase functions:log

# Test webhook endpoint (optional)
curl -X POST https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/calendlyWebhook \
  -H "Content-Type: application/json" \
  -d '{"event": "test"}'
```

## Troubleshooting

### If you see permission-denied errors:
1. Verify security rules are deployed: `firebase deploy --only firestore:rules`
2. Check user email domain matches @bwscampus.com requirement
3. Ensure admin email is exactly: `zchien@bwscampus.com`

### If authentication fails:
1. Check authorized domains include your hosting domain
2. Verify Google sign-in is enabled in Authentication
3. Check console for CORS errors

### If functions aren't working:
1. Ensure functions are deployed: `firebase deploy --only functions`
2. Check function logs: `firebase functions:log`
3. Verify environment variables: `firebase functions:config:get`

## Final Verification

After completing all steps:
1. Build and test locally: `npm run build && npm start`
2. Deploy to your hosting platform
3. Test with real @bwscampus.com email accounts
4. Monitor browser console for any remaining errors

## Need Help?

If you encounter errors not covered here:
1. Check browser console for specific error messages
2. Review Firebase Function logs: `firebase functions:log`
3. Check Firestore security rules simulator in Firebase Console
4. Verify all environment variables are correctly set