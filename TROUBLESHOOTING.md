# Troubleshooting Audio Transcription Issues

## Problem: Transcription not appearing in chat

### Quick Test
I've added a test button (🧪) next to the microphone button that simulates an audio transcription without requiring actual audio recording. Try this first:

1. Open the chat app
2. Navigate to "Audio Demo Chat 🎤" (Chat ID: 4)
3. Look for the red test button (🧪) next to the microphone button
4. Tap the test button
5. You should see a test transcription message appear

### If the test button works:
The issue is with audio recording/permissions. Check:
- Are you testing on a physical device? (Simulator doesn't support microphone)
- Have you granted microphone permissions?
- Check the console logs for audio recording errors

### If the test button doesn't work:
The issue is with message handling. Check:
- Console logs for the `onAudioMessage` flow
- Verify the message is being added to the state

## Debugging Steps

### 1. Check Console Logs
Open the developer tools and look for these logs when testing:
```
- "Test audio transcription button pressed"
- "onAudioMessage called with: ..."
- "Formatted transcription: ..."
- "Created audio message: ..."
- "Updated messages: [number]"
```

### 2. Verify Component Props
Ensure `onAudioMessage` is passed correctly:
```tsx
<CustomChat
  messages={messages}
  onSend={onSend}
  user={user}
  placeholder="Type a message..."
  onAudioMessage={onAudioMessage} // ← This should be present
/>
```

### 3. Check Message Structure
Audio transcription messages should have:
```typescript
{
  _id: "audio-[timestamp]-[random]",
  text: "Transcribed text",
  createdAt: Date,
  user: {
    _id: "audio-user",
    name: "Voice Assistant"
  },
  isAudioTranscription: true,
  audioUri: "file://path/to/audio"
}
```

### 4. Verify Message Display
Audio messages should show:
- On the left side (not current user)
- With "Voice Assistant" as sender name
- With a microphone icon (🎤) next to the name

## Common Issues

### 1. Simulator Testing
**Problem**: Audio recording doesn't work in simulator
**Solution**: Test on a physical device

### 2. Permission Denied
**Problem**: Microphone permission not granted
**Solution**: 
- Check device settings
- Try uninstalling and reinstalling the app
- Grant permissions when prompted

### 3. State Not Updating
**Problem**: Messages not appearing in UI
**Solution**:
- Check if `setMessages` is being called
- Verify React state updates
- Check for any re-rendering issues

### 4. Audio Recording Fails
**Problem**: Recording doesn't start/stop properly
**Solution**:
- Check `expo-av` installation
- Verify audio permissions in app.json
- Check for device compatibility

## Testing Checklist

- [ ] Test button (🧪) creates a transcription message
- [ ] Messages appear on the left side
- [ ] "Voice Assistant" appears as sender
- [ ] Microphone icon (🎤) is visible
- [ ] Console logs show successful flow
- [ ] Audio recording button (🎤) responds to taps
- [ ] Recording state changes (visual feedback)
- [ ] Permissions are requested on first use

## Next Steps

1. **First**: Test the 🧪 button to isolate the issue
2. **If UI works**: Focus on audio recording permissions/device issues
3. **If UI doesn't work**: Check console logs and component props
4. **If still stuck**: Share the console logs for further diagnosis

The test button will help us determine if this is a UI/state issue or an audio recording issue specifically.
