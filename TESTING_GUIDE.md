# Testing Persistent Login

## How to Test Persistent Login

1. **First Run**:
   - Start the app with `npm start` or `npx expo start`
   - You should see the login/registration screen

2. **Register a New User**:
   - Tap "Sign Up" 
   - Enter your details (name, email, password)
   - You should be redirected to the home screen

3. **Test Persistence**:
   - **Close the app completely** (not just minimize)
   - **Reopen the app**
   - You should be automatically redirected to the home screen WITHOUT seeing the login screen

4. **Test Logout**:
   - From the home screen, tap "Logout"
   - You should be redirected back to the login screen
   - Close and reopen the app - you should see the login screen again

5. **Test Login with Existing User**:
   - Enter the same email and password you registered with
   - You should be logged in and redirected to home screen
   - Close and reopen - should go directly to home screen again

## What Happens Behind the Scenes

- **On Registration/Login**: User data is stored in secure storage with keys:
  - `userData`: Current user session info
  - `authToken`: Authentication token
  - `user_${email}`: User credentials for login verification

- **On App Start**: 
  - AuthContext checks for existing `userData` and `authToken`
  - If both exist, user is automatically logged in
  - If either is missing, user sees login screen

- **On Logout**:
  - Only session data (`userData` and `authToken`) is cleared
  - User credentials remain for future logins

## Console Logs to Watch

Open the developer console to see authentication flow logs:
- "Loading user data..."
- "Stored userData: Found/Not found"
- "Restoring user session for: [email]"
- "Authentication check complete"
