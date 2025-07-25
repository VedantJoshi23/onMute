# Audio Recording and Speech Integration

This document provides a comprehensive guide to the audio recording, speech-to-text (STT), and text-to-speech (TTS) features implemented in the onMute application using Expo's native capabilities.

## Overview

The onMute app implements a complete speech integration system that enables:

1. **Audio Recording**: Record voice messages using device microphone
2. **Speech-to-Text (STT)**: Transcribe recorded audio to text
3. **Text-to-Speech (TTS)**: Convert text messages to spoken audio
4. **Real-time Speech Recognition**: Live speech recognition (web platform)
5. **Accessibility Features**: Enhanced support for deaf and mute users

## Architecture

### Core Services

#### 1. SpeechRecognitionService (`services/speechRecognitionService.ts`)

- **Web Platform**: Uses Web Speech API for real-time recognition
- **Native Platforms**: Processes recorded audio files with simulated transcription
- **Features**: Language support, confidence scoring, error handling

#### 2. TextToSpeechService (`services/textToSpeechService.ts`)

- **Cross-Platform**: Uses `expo-speech` for all platforms
- **Features**: Voice selection, rate/pitch control, text preprocessing
- **Smart Processing**: Handles abbreviations, emojis, and URLs

#### 3. SpeechIntegrationHook (`hooks/useSpeechIntegration.ts`)

- **Unified Interface**: Combines STT and TTS in a single hook
- **State Management**: Tracks recording, speaking, and processing states
- **Error Handling**: Comprehensive error management and recovery

### Chat Integration

#### Enhanced CustomChat Component

- **Audio Recording Button**: 🎤 Record voice messages
- **Text-to-Speech Button**: 🔊 Speak typed messages
- **Message Speaker Icons**: Speak any message in the chat
- **Visual Feedback**: Recording animations and status indicators

## Usage Guide

### Basic Chat Features

#### Recording Audio Messages

1. Tap the 🎤 microphone button in chat input
2. Grant microphone permission if prompted
3. Speak your message while recording indicator shows
4. Tap "Stop" to transcribe or "Cancel" to discard
5. Transcribed message appears automatically in chat

#### Speaking Text Messages

1. Type your message in the text input
2. Tap the 🔊 speaker button to hear it spoken
3. Or tap the speaker icon on any message to hear it

#### Text-to-Speech for Received Messages

- Each message bubble has a speaker button 🔊
- Tap to hear the message spoken aloud
- Audio transcription messages are marked with 🎤

### Advanced Features

#### Live Speech Recognition (Web Only)

```typescript
import { useSpeechIntegration } from "@/hooks/useSpeechIntegration";

const { startListening, stopListening, currentTranscript } =
  useSpeechIntegration();

// Start listening
await startListening();

// Stop and get transcript
stopListening();
console.log(currentTranscript);
```

#### Custom TTS Configuration

```typescript
import { TextToSpeechService } from "@/services/textToSpeechService";

const ttsService = new TextToSpeechService({
  language: "en-US",
  rate: 0.8,
  pitch: 1.2,
  volume: 0.9,
});

await ttsService.speak("Hello, this is a test message");
```

#### Batch Speech Processing

```typescript
// Queue multiple messages for sequential playback
const { queueSpeech } = useSpeechIntegration();

queueSpeech("First message");
queueSpeech("Second message");
queueSpeech("Third message");
```

## Platform Support

### iOS

- ✅ Audio Recording (`expo-av`)
- ✅ Text-to-Speech (`expo-speech`)
- ✅ File-based Speech Recognition (simulated)
- ❌ Real-time Speech Recognition

### Android

- ✅ Audio Recording (`expo-av`)
- ✅ Text-to-Speech (`expo-speech`)
- ✅ File-based Speech Recognition (simulated)
- ❌ Real-time Speech Recognition

### Web

- ✅ Audio Recording (`expo-av`)
- ✅ Text-to-Speech (`expo-speech`)
- ✅ Real-time Speech Recognition (Web Speech API)
- ✅ File-based Speech Recognition

## Configuration

### Permissions Setup

#### iOS (`app.json`)

```json
{
  "ios": {
    "infoPlist": {
      "NSMicrophoneUsageDescription": "This app needs access to the microphone to record audio messages for transcription."
    }
  }
}
```

#### Android (`app.json`)

```json
{
  "android": {
    "permissions": [
      "android.permission.RECORD_AUDIO",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.MODIFY_AUDIO_SETTINGS"
    ]
  }
}
```

#### Expo Plugins (`app.json`)

```json
{
  "plugins": [
    [
      "expo-av",
      {
        "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone to record audio messages for transcription."
      }
    ]
  ]
}
```

### Dependencies

```json
{
  "expo-av": "^15.1.7",
  "expo-speech": "^13.1.7",
  "expo-file-system": "^18.1.11"
}
```

## API Reference

### useSpeechIntegration Hook

#### State Properties

```typescript
interface SpeechIntegrationState {
  isListening: boolean; // Currently recording/listening
  isSpeaking: boolean; // Currently speaking text
  isProcessing: boolean; // Processing audio/transcription
  currentTranscript: string; // Current transcription text
  error: string | null; // Error message if any
}
```

#### Methods

```typescript
// Speech Recognition
transcribeAudioFile(audioUri: string): Promise<string>
startListening(): Promise<void>  // Web only
stopListening(): void

// Text-to-Speech
speak(text: string, options?: TextToSpeechOptions): Promise<void>
speakChatMessage(message: string, senderName?: string, isAudio?: boolean): Promise<void>
stopSpeaking(): Promise<void>
queueSpeech(text: string, options?: TextToSpeechOptions): void

// Utility
getAvailableVoices(): Promise<SpeechVoice[]>
updateTTSSettings(options: Partial<TextToSpeechOptions>): void
isSupported(): { speechRecognition: boolean; textToSpeech: boolean }
clearError(): void
reset(): void
```

### TextToSpeechOptions

```typescript
interface TextToSpeechOptions {
  voice?: string; // Voice identifier
  pitch?: number; // 0.5 to 2.0 (default: 1.0)
  rate?: number; // 0.1 to 10.0 (default: 0.75)
  volume?: number; // 0.0 to 1.0 (default: 1.0)
  language?: string; // Language code (default: 'en-US')
}
```

## Text Preprocessing

The TTS service automatically preprocesses text for better speech synthesis:

### Abbreviation Expansion

- "lol" → "laugh out loud"
- "omg" → "oh my god"
- "brb" → "be right back"
- "fyi" → "for your information"

### Emoji Conversion

- 😀 → "happy face"
- ❤️ → "heart"
- 👍 → "thumbs up"
- 🔥 → "fire"

### URL/Email Handling

- URLs → "link"
- Email addresses → "email address"

### Punctuation Normalization

- Removes excessive punctuation
- Ensures proper spacing
- Improves speech rhythm

## Error Handling

### Common Error Scenarios

#### Permission Errors

```typescript
// Handle microphone permission denial
try {
  await startRecording();
} catch (error) {
  if (error.message.includes("permission")) {
    Alert.alert("Permission Required", "Please enable microphone access");
  }
}
```

#### Platform Limitations

```typescript
// Check platform support before using features
const support = isSupported();
if (!support.speechRecognition) {
  console.warn("Speech recognition not supported on this platform");
}
```

#### Network Issues

```typescript
// Fallback for transcription failures
try {
  const transcript = await transcribeAudioFile(audioUri);
} catch (error) {
  // Fallback to simulated transcription
  const fallback = "Audio message recorded";
  return fallback;
}
```

## Testing

### Manual Testing Steps

1. **Audio Recording Test**

   - Tap microphone button in chat
   - Record 3-5 second message
   - Verify transcription appears
   - Check audio file is saved

2. **Text-to-Speech Test**

   - Type message with various content types
   - Tap speaker button
   - Verify speech output
   - Test with emojis and abbreviations

3. **Message Playback Test**

   - Send multiple messages
   - Tap speaker icon on each message
   - Verify correct speech for each

4. **Permission Test**
   - Deny microphone permission
   - Verify graceful error handling
   - Grant permission and retry

### Automated Testing

```typescript
// Example test for speech integration
describe("Speech Integration", () => {
  it("should transcribe audio successfully", async () => {
    const { transcribeAudioFile } = useSpeechIntegration();
    const mockAudioUri = "file://test-audio.m4a";

    const result = await transcribeAudioFile(mockAudioUri);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should speak text successfully", async () => {
    const { speak } = useSpeechIntegration();
    const testText = "Hello world";

    await expect(speak(testText)).resolves.not.toThrow();
  });
});
```

## Accessibility Features

### For Deaf Users

- **Audio-to-Text**: All audio messages are automatically transcribed
- **Visual Indicators**: Clear visual feedback for all audio states
- **Text Display**: Large, readable text with high contrast

### For Mute Users

- **Text-to-Speech**: Type messages and have them spoken aloud
- **Quick TTS**: Instant speech for typed messages
- **Message Replay**: Tap any message to hear it spoken

### For Deaf-Mute Users

- **Complete Workflow**: Record → Transcribe → Type → Speak
- **Bidirectional**: Both STT and TTS in the same interface
- **Seamless Integration**: Works within existing chat flow

## Performance Optimization

### Audio File Management

- Automatic cleanup of temporary audio files
- Optimized audio quality settings
- Minimal memory footprint

### Speech Processing

- Lazy loading of speech services
- Background processing for transcription
- Queue management for sequential TTS

### UI Responsiveness

- Non-blocking speech operations
- Smooth animations during recording
- Immediate visual feedback

## Troubleshooting

### Common Issues

#### "Microphone permission denied"

**Solution**: Check device settings and grant microphone permission

#### "Speech recognition not working"

**Solution**: Ensure you're on a supported platform (web for live recognition)

#### "Text-to-speech not audible"

**Solution**: Check device volume and ensure audio is not muted

#### "Transcription returns empty text"

**Solution**: Speak clearly and ensure good microphone quality

### Debug Mode

Enable detailed logging:

```typescript
// Add to your app configuration
const DEBUG_SPEECH = __DEV__;

if (DEBUG_SPEECH) {
  console.log("Speech recognition state:", speechState);
}
```

## Future Enhancements

### Planned Features

- **Real Native STT**: Integration with device's native speech recognition
- **Offline Transcription**: Local speech recognition without network
- **Multi-language Support**: Automatic language detection and switching
- **Voice Training**: Personalized voice recognition accuracy
- **Custom Wake Words**: Voice activation for hands-free operation

### Integration Opportunities

- **AssemblyAI**: Professional transcription service
- **Google Speech-to-Text**: Cloud-based recognition
- **AWS Transcribe**: Enterprise-grade transcription
- **Azure Speech Services**: Microsoft's speech platform

## Contributing

When contributing to speech features:

1. Test on multiple platforms (iOS, Android, Web)
2. Verify accessibility compliance
3. Handle permission scenarios gracefully
4. Provide fallback mechanisms
5. Update documentation for new features

## Security Considerations

### Audio Data

- Audio files are stored locally only
- Automatic cleanup after transcription
- No cloud upload without explicit consent

### Privacy

- Microphone access only when actively recording
- Clear user indication of recording state
- Option to disable features if desired

### Permissions

- Minimal required permissions
- Clear permission descriptions
- Graceful degradation without permissions
