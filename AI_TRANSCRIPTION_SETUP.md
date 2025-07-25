# AI Transcription with Gemma 3n Integration

This document explains how to integrate your local Gemma 3n AI model with the onMute app for audio transcription.

## Overview

The speech recognition service has been enhanced to support local AI transcription using your Gemma 3n model. The system includes:

- **Primary**: Local AI transcription using Gemma 3n
- **Fallback**: Mock transcription if AI is unavailable
- **Configuration**: Easy setup for different AI environments
- **Error Handling**: Graceful degradation when AI fails

## Setup Requirements

### 1. Local AI Model Setup

Make sure your Gemma 3n model is running locally. The most common setup is using Ollama:

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the Gemma model
ollama pull gemma2:2b

# Start Ollama server (usually runs on http://localhost:11434)
ollama serve
```

### 2. Configuration

The AI configuration is in `/services/aiConfig.ts`. Update it to match your setup:

```typescript
export const gemma3nConfig: SpeechRecognitionConfig = {
  language: "en-US",
  localAI: {
    enabled: true,
    endpoint: "http://localhost:11434/api/generate", // Your AI endpoint
    model: "gemma2:2b", // Your model name
    timeout: 30000,
    // apiKey: 'your-key', // If authentication required
  },
};
```

### 3. Testing Your Setup

Use the helper functions to test your AI connection:

```typescript
import { testAIConnection, validateModel } from "./services/aiConfig";

// Test if AI server is accessible
const isConnected = await testAIConnection(gemma3nConfig);

// Test if your model is available
const isModelReady = await validateModel(gemma3nConfig);
```

## Usage Examples

### Basic Transcription

```typescript
import { SpeechRecognitionService } from "./services/speechRecognitionService";
import { gemma3nConfig } from "./services/aiConfig";

const speechService = new SpeechRecognitionService(gemma3nConfig);

// Transcribe an audio file
const transcript = await speechService.transcribeAudio(audioUri);
console.log("Transcribed text:", transcript);
```

### With Event Handlers

```typescript
const speechService = new SpeechRecognitionService(gemma3nConfig);

// Set up event handlers
speechService.onResult((result) => {
  console.log("Transcript:", result.transcript);
  console.log("Confidence:", result.confidence);
});

speechService.onError((error) => {
  console.error("Error:", error.message);
});

speechService.onEnd(() => {
  console.log("Transcription completed");
});

// Start transcription
await speechService.transcribeAudio(audioUri);
```

### Custom Configuration

```typescript
const customConfig = {
  language: "en-US",
  localAI: {
    enabled: true,
    endpoint: "http://your-server:8080/api/v1/generate",
    model: "gemma:3b-instruct-q4_0",
    timeout: 45000,
  },
};

const customService = new SpeechRecognitionService(customConfig);
```

## Integration with Chat System

The service integrates seamlessly with your existing chat system:

```typescript
import { ChatTranscriptionService } from "./examples/aiTranscriptionExamples";

const chatTranscription = new ChatTranscriptionService();

// Transcribe voice message for chat
await chatTranscription.transcribeForChat(audioUri);
```

## Configuration Options

### AI Configuration Parameters

| Parameter  | Type    | Default                               | Description                     |
| ---------- | ------- | ------------------------------------- | ------------------------------- |
| `enabled`  | boolean | `true`                                | Enable/disable AI transcription |
| `endpoint` | string  | `http://localhost:11434/api/generate` | AI server endpoint              |
| `model`    | string  | `gemma2:2b`                           | Model name                      |
| `timeout`  | number  | `30000`                               | Request timeout in milliseconds |
| `apiKey`   | string  | `undefined`                           | API key for authentication      |

### Language Support

Set the `language` parameter to match your content:

```typescript
const config = {
  language: "en-US", // English (US)
  // language: "es-ES", // Spanish (Spain)
  // language: "fr-FR", // French (France)
  localAI: {
    /* ... */
  },
};
```

## Troubleshooting

### Common Issues

1. **"Local AI transcription failed: Request timeout"**

   - Increase the timeout value in configuration
   - Check if your AI model is running
   - Verify the endpoint URL

2. **"Local AI API error: 404 Not Found"**

   - Check the endpoint URL
   - Ensure your AI server is running
   - Verify the API path

3. **"Invalid response format from local AI model"**

   - Check if your model supports the expected response format
   - Update the response parsing in `transcribeWithGemma3n` method

4. **"Speech recognition not supported on this platform"**
   - This is expected on native platforms for live recognition
   - Audio file transcription should work correctly

### Debugging Steps

1. Test AI connection:

   ```typescript
   const isConnected = await testAIConnection(gemma3nConfig);
   console.log("AI Connected:", isConnected);
   ```

2. Validate model:

   ```typescript
   const isValidModel = await validateModel(gemma3nConfig);
   console.log("Model Available:", isValidModel);
   ```

3. Check console logs for detailed error messages

4. Try with fallback disabled to isolate AI issues:
   ```typescript
   const config = { ...gemma3nConfig, localAI: { enabled: false } };
   ```

## Performance Considerations

- **Response Time**: AI transcription typically takes 1-5 seconds depending on audio length and model speed
- **Accuracy**: Confidence scores are calculated based on transcript characteristics
- **Fallback**: System automatically falls back to mock transcription if AI fails
- **Timeout**: Default 30-second timeout prevents hanging requests

## API Response Format

Your Gemma 3n model should return responses in one of these formats:

```json
{
  "response": "transcribed text here"
}
```

or

```json
{
  "text": "transcribed text here"
}
```

or

```json
{
  "transcription": "transcribed text here"
}
```

The system will automatically detect and use the appropriate field.

## Advanced Features

### Batch Processing

```typescript
import { batchTranscription } from "./examples/aiTranscriptionExamples";

const audioFiles = ["file1.m4a", "file2.m4a", "file3.m4a"];
const transcripts = await batchTranscription(audioFiles);
```

### Performance Monitoring

```typescript
import { TranscriptionPerformanceMonitor } from "./examples/aiTranscriptionExamples";

const monitor = new TranscriptionPerformanceMonitor();
const transcript = await monitor.transcribeWithMetrics(audioUri);
const metrics = monitor.getMetrics();
```

## Security Notes

- Keep API keys secure if using authentication
- Use HTTPS endpoints for remote AI servers
- Consider network security when accessing local AI services
- Audio data is sent as base64 - ensure your AI server handles this securely

## Next Steps

1. Set up your Gemma 3n model with the correct endpoint
2. Update the configuration in `aiConfig.ts`
3. Test the connection using the provided helper functions
4. Integrate with your chat system using the examples
5. Monitor performance and adjust timeout/configuration as needed

For more examples and advanced usage, see `/examples/aiTranscriptionExamples.ts`.
