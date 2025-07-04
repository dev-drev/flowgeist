# Deployment Guide - Flowgeist

## 🔒 Security Setup

### 1. Environment Variables
Create a `.env.local` file in the root directory with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 2. Firebase Storage Rules
Ensure your Firebase Storage rules allow public read access:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Option 2: Netlify
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy automatically

### Option 3: Manual Build
```bash
npm run build
npm start
```

## 📁 File Structure
```
flowgeist/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   └── lib/          # Utilities (Firebase, etc.)
├── public/           # Static files
├── .env.local        # Environment variables (not in git)
└── .gitignore        # Protects sensitive files
```

## 🔧 Pre-deployment Checklist

- [ ] Firebase Storage rules configured
- [ ] Environment variables set up
- [ ] Audio files uploaded to Firebase Storage
- [ ] Build test successful (`npm run build`)
- [ ] Local test successful (`npm run dev`)

## 🎵 Audio Files
Make sure all audio files are uploaded to Firebase Storage with the correct names:
- Void You Hide.wav
- The Scarecrow.wav
- Fatal Faith.wav
- Like a Bug.wav
- Veiled Strophes.wav
- Amarcord.wav
- Prophets of Lies.wav
- Meaningful Quest.wav

## 📊 Analytics
Firebase Analytics is configured and will track:
- Page views
- Music playback events
- Admin actions
- File uploads

## 🔍 Troubleshooting

### Common Issues:
1. **Audio not loading**: Check Firebase Storage rules and file names
2. **Build errors**: Ensure all environment variables are set
3. **Analytics not working**: Check Firebase configuration

### Debug Commands:
```bash
# Test Firebase connection
npm run dev
# Then visit /admin and click "Test Firebase"

# Build test
npm run build

# Production test
npm start
``` 