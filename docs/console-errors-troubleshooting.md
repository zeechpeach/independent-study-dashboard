# Common Firebase Console Errors & Solutions

This document addresses the specific console errors you're likely encountering after the recent code fixes.

## Error Category 1: Environment Configuration

### Error: "Firebase configuration incomplete. Missing: [variables]"
```
Missing required Firebase environment variables: REACT_APP_FIREBASE_API_KEY, REACT_APP_FIREBASE_AUTH_DOMAIN...
```

**Cause**: Environment variables not set or incorrectly named.

**Solution**:
1. Create `.env.local` file in project root (not `.env`)
2. Add all required variables with `REACT_APP_` prefix:
   ```
   REACT_APP_FIREBASE_API_KEY=AIzaSyC...
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
   REACT_APP_ADMIN_EMAIL=zchien@bwscampus.com
   ```
3. Restart development server: `npm start`

---

## Error Category 2: Authentication Issues

### Error: "Auth domain 'localhost' is not authorized"
```
Firebase: Error (auth/unauthorized-domain)
```

**Solution**:
1. Go to Firebase Console → Authentication → Settings
2. Scroll to "Authorized domains"
3. Add your domains:
   - `localhost` (for development)
   - Your production domain
   - Your Vercel deployment domain

### Error: "Access denied. Please use your @bwscampus.com email address"
**Cause**: User trying to sign in with non-@bwscampus.com email

**Solution**: This is expected behavior. Only @bwscampus.com emails are allowed.

---

## Error Category 3: Firestore Permission Errors

### Error: "Missing or insufficient permissions"
```
FirebaseError: Missing or insufficient permissions.
```

**Cause**: Security rules not deployed or user doesn't have proper access

**Solutions**:
1. **Deploy security rules**:
   ```bash
   firebase use YOUR-PROJECT-ID
   firebase deploy --only firestore:rules
   ```

2. **Verify admin user**: Admin must be exactly `zchien@bwscampus.com`

3. **Check user authentication**: Ensure user is signed in with @bwscampus.com email

### Error: "Document doesn't exist" or "QuerySnapshot is empty"
**Cause**: Collections don't exist yet or security rules blocking access

**Solutions**:
1. **Create initial collections** in Firestore Console:
   - Create `users` collection with a test document
   - Create `importantDates` collection with a test document
   
2. **Test with admin user first** (zchien@bwscampus.com)

---

## Error Category 4: Composite Index Errors

### Error: "The query requires an index"
```
9 FAILED_PRECONDITION: The query requires an index. You can create it here: https://console.firebase.google.com/...
```

**Solution**:
1. **Auto-create**: Click the provided link to auto-create the index
2. **Or deploy indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

---

## Error Category 5: Cloud Functions Errors

### Error: "Function not found" (Calendly webhooks)
**Cause**: Cloud Functions not deployed

**Solution**:
```bash
cd functions/
npm install
cd ..
firebase deploy --only functions
```

### Error: "Environment variable not set" (in function logs)
**Solution**:
```bash
firebase functions:config:set calendly.webhook_secret="your-secret-here"
firebase deploy --only functions
```

---

## Error Category 6: Build/Deployment Errors

### Error: "Failed to load resource" (404 on Firebase config)
**Cause**: Firebase app not registered or config values incorrect

**Solution**:
1. Go to Firebase Console → Project Settings
2. Scroll to "Your apps" section
3. If no web app exists, click "Add app" → Web
4. Copy the correct config values

### Error: CORS errors in browser
**Cause**: Domain not authorized or incorrect auth domain

**Solution**:
1. Check `REACT_APP_FIREBASE_AUTH_DOMAIN` matches your Firebase project
2. Add domain to authorized domains in Authentication settings

---

## Quick Diagnostic Commands

Run these to diagnose your setup:

```bash
# Check if Firebase CLI is working
firebase --version

# Check current project
firebase use

# Check if rules are valid
firebase deploy --only firestore:rules --dry-run

# Check function logs
firebase functions:log

# Test local build
npm run build
```

## Emergency Reset Steps

If everything seems broken:

1. **Clear browser data** (Application → Storage → Clear site data)
2. **Reset Firebase project**:
   ```bash
   firebase use --clear
   firebase use YOUR-PROJECT-ID
   ```
3. **Redeploy everything**:
   ```bash
   firebase deploy
   ```
4. **Restart dev server**:
   ```bash
   npm start
   ```

## Still Having Issues?

1. **Check browser console** for specific error messages
2. **Check Firebase Console logs** for backend errors
3. **Verify environment variables** are exactly as specified
4. **Test with admin email first** (zchien@bwscampus.com)
5. **Check Firebase project billing** (some features require Blaze plan)

Remember: After the recent code fixes, most errors should be configuration-related rather than code issues.