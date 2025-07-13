# onMute Authentication System

This project now includes a complete authentication system with secure storage capabilities.

## Features

- **Secure Login/Registration**: Beautiful, minimal UI for user authentication
- **Expo SecureStore Integration**: User credentials and session data are securely stored
- **Automatic Route Protection**: Users are automatically redirected based on authentication status
- **Persistent Sessions**: Users remain logged in between app launches
- **Modern UI Design**: Clean, gradient-based design with smooth animations

## How to Use

### Starting the App

1. Run `npm start` or `npx expo start` to launch the development server
2. The app will automatically show the login screen if no user is authenticated
3. If a user is already logged in, they'll be redirected to the main tabs

### Authentication Flow

1. **First Time Users**: Select "Sign Up" to create a new account
   - Enter your full name, email, and password
   - Account data is securely stored using Expo SecureStore

2. **Returning Users**: Use "Sign In" with your existing credentials
   - The app remembers your login state securely

3. **Logout**: From the home tab, tap the "Logout" button to sign out

### File Structure

```
contexts/
  AuthContext.tsx          # Authentication context and secure storage logic
app/
  _layout.tsx             # Root layout with AuthProvider
  index.tsx               # Entry point with authentication routing
  auth.tsx                # Login/Registration screen
  (tabs)/
    index.tsx             # Protected home screen with user info and logout
```

## Security Features

- **Expo SecureStore**: All sensitive data is encrypted and stored securely
- **Session Management**: Automatic session restoration on app restart
- **Route Protection**: Unauthenticated users cannot access protected routes

## UI Design

The authentication screen features:
- Beautiful gradient background with purple/blue theme
- Clean, minimal form design with subtle shadows
- Smooth transitions between login/registration modes
- Responsive design that works on all screen sizes
- Modern input styling with focus states

## Dependencies Added

- `expo-secure-store`: For secure credential storage
- `expo-linear-gradient`: For beautiful gradient backgrounds

The authentication system is now ready to use! Users can register, login, and their sessions will persist securely across app launches.
