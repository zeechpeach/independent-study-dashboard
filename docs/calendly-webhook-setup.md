# Calendly Webhook Integration Setup

## Overview
This integration allows the Independent Study Dashboard to automatically sync meeting data from Calendly webhooks. When students book, reschedule, or cancel meetings through Calendly, the system will automatically update the dashboard with real-time meeting information.

## Features
- **Automatic Meeting Sync**: Meetings booked through Calendly appear in the dashboard instantly
- **Status Updates**: Cancellations and rescheduling are automatically reflected
- **Student Matching**: System attempts to match Calendly bookings with existing student profiles
- **Audit Trail**: All webhook events are stored for debugging and analytics

## Setup Instructions

### 1. Firebase Cloud Functions Deployment

First, deploy the Cloud Functions that will handle Calendly webhooks:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy functions
firebase deploy --only functions
```

### 2. Environment Variables

#### For Firebase Functions
Set the following environment variable in Firebase Functions:

```bash
# Set the webhook secret for signature verification
firebase functions:config:set calendly.webhook_secret="your_calendly_webhook_secret_here"
```

#### For Vercel Deployment
Add the following environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
CALENDLY_WEBHOOK_SECRET=your_calendly_webhook_secret_here
```

**Note**: The React app environment variables (REACT_APP_*) should already be configured from the main setup.

### 3. Calendly Webhook Configuration

1. **Login to Calendly**
   - Go to [Calendly Developer Console](https://calendly.com/integrations/api_webhooks)
   - Log in with your Calendly account

2. **Create a Webhook**
   - Click "Create Webhook"
   - Set the webhook URL to: `https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/calendlyWebhook`
   - Replace `YOUR_PROJECT_ID` with your Firebase project ID

3. **Configure Events**
   Select the following events to monitor:
   - `invitee.created` (when someone books a meeting)
   - `invitee.canceled` (when someone cancels a meeting)

4. **Set Signing Secret**
   - Generate a secure random string for the signing secret
   - Use this same secret in your environment variables above
   - Example: `openssl rand -hex 32`

### 4. Testing the Integration

#### Test Webhook Endpoint
You can test the webhook endpoint using curl:

```bash
curl -X POST https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/calendlyWebhook \\
  -H "Content-Type: application/json" \\
  -H "Calendly-Webhook-Signature: your_test_signature" \\
  -d '{"event": "test", "payload": {"test": true}}'
```

#### Monitor Function Logs
```bash
firebase functions:log --only calendlyWebhook
```

## Data Models

### Calendly Events Collection
The system stores raw webhook events in `calendly_events` collection:

```javascript
{
  eventType: "invitee.created",
  payload: {
    uuid: "CALENDLY_EVENT_UUID",
    email: "student@bwscampus.com",
    name: "Student Name",
    scheduled_event: {
      start_time: "2024-01-01T10:00:00.000000Z",
      end_time: "2024-01-01T11:00:00.000000Z",
      name: "Meeting Name"
    }
  },
  processedAt: timestamp,
  createdAt: timestamp
}
```

### Updated Meetings Collection
Existing meetings collection is enhanced with Calendly data:

```javascript
{
  // Existing fields...
  source: "calendly",                    // Identifies Calendly-sourced meetings
  calendlyEventUuid: "UUID",            // Links to Calendly event
  calendlyEventUri: "calendly://...",   // Calendly event URI
  lastSyncAt: timestamp,                // Last sync with Calendly
  // Standard meeting fields...
}
```

## Security Considerations

### Webhook Signature Verification
- All webhook requests are verified using HMAC-SHA256 signatures
- Only requests with valid signatures are processed
- The signing secret should be kept secure and rotated periodically

### Access Control
- Webhook endpoints are public but protected by signature verification
- Student data is only linked to existing authenticated users
- No sensitive data is exposed through the webhook responses

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Verify the webhook URL is correct
   - Check Firebase Function logs for errors
   - Ensure the function is deployed and accessible

2. **Signature verification failing**
   - Verify the signing secret matches between Calendly and Firebase
   - Check the environment variable is set correctly
   - Ensure the secret doesn't contain extra whitespace

3. **Student matching not working**
   - Verify student email addresses match between Calendly and the dashboard
   - Check that students are using their @bwscampus.com email addresses
   - Review the user matching logic in the webhook handler

### Debugging Commands

```bash
# View function logs
firebase functions:log --only calendlyWebhook

# Test function locally (requires Firebase emulator)
firebase emulators:start --only functions

# Check environment variables
firebase functions:config:get
```

## Admin Dashboard Integration

Administrators can view Calendly integration status through the dashboard:

1. **Calendly Events Panel**: Shows recent webhook events and their processing status
2. **Meeting Synchronization**: Displays which meetings came from Calendly
3. **Error Monitoring**: Alerts for failed webhook processing

## Support

For technical issues:
1. Check the function logs in Firebase Console
2. Review Calendly webhook delivery logs
3. Verify environment variables are correctly set
4. Contact the development team with specific error messages and timestamps