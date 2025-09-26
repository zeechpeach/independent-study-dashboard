# Firebase Setup Quick Checklist

Use this checklist to quickly verify your Firebase setup is complete:

## ✅ Pre-Setup Verification
- [ ] Firebase project created in console
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Logged into Firebase CLI: `firebase login`
- [ ] Project selected: `firebase use YOUR-PROJECT-ID`

## ✅ Environment Configuration  
- [ ] `.env.local` file created with all required variables:
  - [ ] `REACT_APP_FIREBASE_API_KEY`
  - [ ] `REACT_APP_FIREBASE_AUTH_DOMAIN` 
  - [ ] `REACT_APP_FIREBASE_PROJECT_ID`
  - [ ] `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - [ ] `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `REACT_APP_FIREBASE_APP_ID`
  - [ ] `REACT_APP_ADMIN_EMAIL=zchien@bwscampus.com`

## ✅ Authentication Setup
- [ ] Google authentication enabled in Firebase Console → Authentication
- [ ] Support email configured 
- [ ] Authorized domains added (your domain + localhost)
- [ ] Test: Can sign in with @bwscampus.com email

## ✅ Firestore Database
- [ ] Firestore database created (production mode)
- [ ] Security rules deployed: `firebase deploy --only firestore:rules`
- [ ] Indexes deployed: `firebase deploy --only firestore:indexes`
- [ ] Test: Admin can create important dates
- [ ] Test: Students can create reflections

## ✅ Cloud Functions (Optional - for Calendly)
- [ ] Functions deployed: `firebase deploy --only functions`
- [ ] Webhook secret configured: `firebase functions:config:set calendly.webhook_secret="YOUR_SECRET"`
- [ ] Test: Function logs show no errors: `firebase functions:log`

## ✅ Final Testing
- [ ] Application builds successfully: `npm run build`
- [ ] No console errors when signing in
- [ ] Admin user (zchien@bwscampus.com) has full access
- [ ] Student users can access their own data only
- [ ] Deployed application works on production domain

## 🚨 Common Issues Quick Fix

**"Permission denied" errors:**
```bash
firebase deploy --only firestore:rules
```

**"Missing environment variables":**
- Check `.env.local` file exists and has all variables
- Restart dev server after adding variables

**Authentication errors:**
- Add your domain to Firebase → Authentication → Settings → Authorized domains

**Functions not working:**
```bash
firebase deploy --only functions
firebase functions:config:set calendly.webhook_secret="YOUR_SECRET"  
```

**Database access errors:**
- Ensure user email ends with @bwscampus.com
- Verify admin email is exactly: zchien@bwscampus.com