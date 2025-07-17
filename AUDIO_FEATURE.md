# Audio Recording and Transcription Feature

This document explains the audio recording and transcription feature integrated into the onMute chat application.

## Features

- **Audio Recording**: Record audio messages using the device's microphone
- **Real-time Visual Feedback**: Animated recording indicator with duration display
- **Audio Transcription**: Transcribe recorded audio to text (currently simulated)
- **Permission Handling**: Automatic microphone permission requests for iOS and Android
- **Message Integration**: Audio transcriptions appear as messages from a "Voice Assistant" user

## Components

### 1. CustomChat Component (`components/CustomChat.tsx`)

Enhanced the existing chat component with:
- Audio recording button (🎤 icon)
- Recording state management with visual feedback
- Transcription loading indicator
- Audio transcription message display

### 2. useAudioRecording Hook (`hooks/useAudioRecording.ts`)

A custom hook that manages:
- Audio permission requests
- Recording state (start/stop/cancel)
- Audio configuration for iOS/Android/Web
- Duration tracking
- Simulated transcription service

### 3. Audio Utilities (`utils/audioUtils.ts`)

Helper functions for:
- Creating audio transcription messages
- Formatting transcription text
- Validating audio URIs
- Mock "Voice Assistant" user creation

## Usage

### Starting Audio Recording

1. Tap the microphone button (🎤) in the chat input area
2. Grant microphone permission if prompted
3. Recording begins with visual feedback:
   - Animated red recording dot
   - Real-time duration display
   - Cancel and Stop buttons

### Stopping Audio Recording

1. Tap the "Stop" button to end recording and transcribe
2. The audio is processed and transcribed
3. A transcription message appears in the chat from "Voice Assistant"

### Canceling Audio Recording

1. Tap the "Cancel" button to discard the recording
2. Returns to normal chat input mode

## Permissions Setup

### iOS (`app.json`)
```json
"ios": {
  "infoPlist": {
    "NSMicrophoneUsageDescription": "This app needs access to the microphone to record audio messages for transcription."
  }
}
```

### Android (`app.json`)
```json
"android": {
  "permissions": [
    "android.permission.RECORD_AUDIO",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.READ_EXTERNAL_STORAGE"
  ]
}
```

### Expo Plugins (`app.json`)
```json
"plugins": [
  [
    "expo-av",
    {
      "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone to record audio messages for transcription."
    }
  ]
]
```

## Dependencies

The following packages were added to support audio recording:

```json
{
  "expo-av": "^15.1.7",
  "expo-speech": "^13.1.7",
  "expo-media-library": "^17.1.7",
  "@react-native-async-storage/async-storage": "^2.2.0"
}
```

## Audio Configuration

The hook configures audio recording with optimal settings:

- **Format**: M4A (iOS/Android), WebM (Web)
- **Quality**: Maximum quality on iOS, 128kbps bitrate
- **Sample Rate**: 44.1kHz
- **Channels**: Stereo (2 channels)

## Transcription Service Integration

Currently, the transcription is simulated with sample responses. To integrate a real transcription service:

1. Replace the `transcribeAudio` function in `useAudioRecording.ts`
2. Add your preferred transcription service (Google Speech-to-Text, AWS Transcribe, etc.)
3. Handle API keys and authentication securely

### Example Integration Points:

```typescript
// Replace this function in useAudioRecording.ts
const transcribeAudio = async (audioUri: string): Promise<string> => {
  // Your transcription service integration here
  // Example: Google Speech-to-Text, AssemblyAI, etc.
};
```

## UI States

### Normal State
- Microphone button visible
- Text input enabled
- Send button available

### Recording State
- Animated recording indicator
- Duration display
- Cancel and Stop buttons
- Text input hidden

### Transcribing State
- Loading spinner
- "Transcribing audio..." message
- All controls disabled

## Message Types

Audio transcription messages include:
- `isAudioTranscription: true` flag
- `audioUri` containing the recorded audio file path
- Special "Voice Assistant" user
- Microphone icon (🎤) indicator

## Testing

To test the audio recording feature:

1. Run the app on a physical device (audio recording requires real hardware)
2. Navigate to any chat screen
3. Tap the microphone button
4. Grant permissions when prompted
5. Record a short audio message
6. Observe the transcription appearing as a message

## Future Enhancements

- Real transcription service integration
- Audio playback functionality
- Voice recognition language selection
- Audio message compression
- Offline transcription capabilities
- Custom transcription accuracy settings

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Ensure microphone permissions are granted in device settings
2. **No Audio Recording**: Test on physical device, not simulator
3. **Transcription Fails**: Check network connectivity for real transcription services
4. **Audio Quality Issues**: Adjust recording configuration in `useAudioRecording.ts`

### Platform-Specific Notes:

- **iOS**: Requires physical device for microphone access
- **Android**: May require additional permissions for storage access
- **Web**: Limited browser support for audio recording APIs
