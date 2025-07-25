import {
  gemma3nConfig,
  testAIConnection,
  validateModel,
} from "../services/aiConfig";
import { SpeechRecognitionService } from "../services/speechRecognitionService";

/**
 * Example of how to use the enhanced speech recognition service with Gemma 3n
 */

// Example 1: Basic usage with AI transcription
export async function basicAITranscription(audioUri: string): Promise<string> {
  const speechService = new SpeechRecognitionService(gemma3nConfig);

  try {
    const transcript = await speechService.transcribeAudio(audioUri);
    console.log("Transcription result:", transcript);
    return transcript;
  } catch (error) {
    console.error("Transcription failed:", error);
    throw error;
  }
}

// Example 2: Usage with event handlers and validation
export async function advancedAITranscription(
  audioUri: string
): Promise<string> {
  // First, test if AI is available
  const isAIAvailable = await testAIConnection(gemma3nConfig);
  const isModelAvailable = await validateModel(gemma3nConfig);

  if (!isAIAvailable || !isModelAvailable) {
    console.warn("AI not available, will use fallback transcription");
  }

  const speechService = new SpeechRecognitionService(gemma3nConfig);

  // Set up event handlers
  speechService.onResult((result) => {
    console.log("Transcription result:", result.transcript);
    console.log("Confidence:", result.confidence);
    console.log("Is final:", result.isFinal);
  });

  speechService.onError((error) => {
    console.error("Transcription error:", error.code, error.message);
  });

  speechService.onEnd(() => {
    console.log("Transcription completed");
  });

  return await speechService.transcribeAudio(audioUri);
}

// Example 3: Custom configuration for different AI setups
export function createCustomAIService(aiEndpoint: string, modelName: string) {
  const customConfig = {
    language: "en-US",
    localAI: {
      enabled: true,
      endpoint: aiEndpoint,
      model: modelName,
      timeout: 45000, // 45 seconds for slower models
    },
  };

  return new SpeechRecognitionService(customConfig);
}

// Example 4: Batch transcription with progress tracking
export async function batchTranscription(
  audioUris: string[]
): Promise<string[]> {
  const speechService = new SpeechRecognitionService(gemma3nConfig);
  const results: string[] = [];

  for (let i = 0; i < audioUris.length; i++) {
    try {
      console.log(`Processing audio ${i + 1}/${audioUris.length}`);
      const transcript = await speechService.transcribeAudio(audioUris[i]);
      results.push(transcript);
    } catch (error) {
      console.error(`Failed to transcribe audio ${i + 1}:`, error);
      results.push(`[Transcription failed: ${error}]`);
    }
  }

  return results;
}

// Example 5: Integration with chat system
export class ChatTranscriptionService {
  private speechService: SpeechRecognitionService;

  constructor() {
    this.speechService = new SpeechRecognitionService(gemma3nConfig);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.speechService.onResult((result) => {
      // Process the transcription result for chat
      if (result.isFinal && result.confidence > 0.7) {
        this.addMessageToChat(result.transcript);
      }
    });

    this.speechService.onError((error) => {
      this.showTranscriptionError(error.message);
    });
  }

  async transcribeForChat(audioUri: string): Promise<void> {
    try {
      await this.speechService.transcribeAudio(audioUri);
    } catch (error) {
      console.error("Chat transcription failed:", error);
      this.showTranscriptionError("Failed to transcribe audio message");
    }
  }

  private addMessageToChat(transcript: string) {
    // This would integrate with your chat system
    console.log("Adding message to chat:", transcript);
    // Example: chatStore.addMessage({ text: transcript, type: 'voice' });
  }

  private showTranscriptionError(message: string) {
    // Show error to user
    console.error("Transcription error:", message);
    // Example: showToast('Voice message transcription failed');
  }

  updateAIConfig(newConfig: any) {
    this.speechService = new SpeechRecognitionService(newConfig);
    this.setupEventHandlers();
  }
}

// Example 6: Performance monitoring
export class TranscriptionPerformanceMonitor {
  private speechService: SpeechRecognitionService;
  private metrics: {
    totalTranscriptions: number;
    successfulTranscriptions: number;
    averageConfidence: number;
    averageResponseTime: number;
  } = {
    totalTranscriptions: 0,
    successfulTranscriptions: 0,
    averageConfidence: 0,
    averageResponseTime: 0,
  };

  constructor() {
    this.speechService = new SpeechRecognitionService(gemma3nConfig);
  }

  async transcribeWithMetrics(audioUri: string): Promise<string> {
    const startTime = Date.now();
    this.metrics.totalTranscriptions++;

    try {
      const transcript = await this.speechService.transcribeAudio(audioUri);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.metrics.successfulTranscriptions++;
      this.updateAverageResponseTime(responseTime);

      console.log("Performance metrics:", {
        responseTime: `${responseTime}ms`,
        successRate: `${(
          (this.metrics.successfulTranscriptions /
            this.metrics.totalTranscriptions) *
          100
        ).toFixed(1)}%`,
        averageResponseTime: `${this.metrics.averageResponseTime}ms`,
      });

      return transcript;
    } catch (error) {
      console.error("Transcription failed:", error);
      throw error;
    }
  }

  private updateAverageResponseTime(responseTime: number) {
    const currentAverage = this.metrics.averageResponseTime;
    const count = this.metrics.successfulTranscriptions;
    this.metrics.averageResponseTime =
      (currentAverage * (count - 1) + responseTime) / count;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
