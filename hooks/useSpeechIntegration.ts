import {
  SpeechRecognitionError,
  SpeechRecognitionResult,
  SpeechRecognitionService,
} from "@/services/speechRecognitionService";
import {
  TextToSpeechOptions,
  TextToSpeechService,
} from "@/services/textToSpeechService";
import { useCallback, useRef, useState } from "react";
import { Platform } from "react-native";

export interface SpeechIntegrationState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  error: string | null;
}

export interface SpeechIntegrationConfig {
  speechRecognitionLanguage?: string;
  textToSpeechLanguage?: string;
  speechRate?: number;
  speechPitch?: number;
  speechVolume?: number;
  continuous?: boolean;
  interim?: boolean;
}

export const useSpeechIntegration = (config: SpeechIntegrationConfig = {}) => {
  const [state, setState] = useState<SpeechIntegrationState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    currentTranscript: "",
    error: null,
  });

  const speechRecognitionService = useRef<SpeechRecognitionService | null>(
    null
  );
  const textToSpeechService = useRef<TextToSpeechService | null>(null);

  // Initialize services
  const initializeServices = useCallback(() => {
    if (!speechRecognitionService.current) {
      speechRecognitionService.current = new SpeechRecognitionService({
        language: config.speechRecognitionLanguage || "en-US",
        continuous: config.continuous || false,
        interim: config.interim || true,
        maxAlternatives: 1,
      });

      // Set up speech recognition callbacks
      speechRecognitionService.current.onResult(
        (result: SpeechRecognitionResult) => {
          setState((prev) => ({
            ...prev,
            currentTranscript: result.transcript,
            error: null,
          }));
        }
      );

      speechRecognitionService.current.onError(
        (error: SpeechRecognitionError) => {
          setState((prev) => ({
            ...prev,
            error: error.message,
            isListening: false,
            isProcessing: false,
          }));
        }
      );

      speechRecognitionService.current.onEnd(() => {
        setState((prev) => ({
          ...prev,
          isListening: false,
          isProcessing: false,
        }));
      });
    }

    if (!textToSpeechService.current) {
      textToSpeechService.current = new TextToSpeechService({
        language: config.textToSpeechLanguage || "en-US",
        rate: config.speechRate || 0.75,
        pitch: config.speechPitch || 1.0,
        volume: config.speechVolume || 1.0,
      });
    }
  }, [config]);

  // Transcribe audio file (for recorded audio)
  const transcribeAudioFile = useCallback(
    async (audioUri: string): Promise<string> => {
      try {
        initializeServices();
        setState((prev) => ({ ...prev, isProcessing: true, error: null }));

        if (!speechRecognitionService.current) {
          throw new Error("Speech recognition service not initialized");
        }

        const transcription =
          await speechRecognitionService.current.transcribeAudio(audioUri);

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          currentTranscript: transcription,
        }));

        return transcription;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown transcription error";
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [initializeServices]
  );

  // Start live speech recognition (web only)
  const startListening = useCallback(async (): Promise<void> => {
    try {
      if (Platform.OS !== "web") {
        throw new Error(
          "Live speech recognition only supported on web platform"
        );
      }

      initializeServices();
      setState((prev) => ({
        ...prev,
        isListening: true,
        error: null,
        currentTranscript: "",
      }));

      if (!speechRecognitionService.current) {
        throw new Error("Speech recognition service not initialized");
      }

      await speechRecognitionService.current.startLiveRecognition();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to start listening";
      setState((prev) => ({
        ...prev,
        isListening: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [initializeServices]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (speechRecognitionService.current) {
      speechRecognitionService.current.stop();
    }
    setState((prev) => ({
      ...prev,
      isListening: false,
    }));
  }, []);

  // Speak text
  const speak = useCallback(
    async (text: string, options?: TextToSpeechOptions): Promise<void> => {
      try {
        initializeServices();
        setState((prev) => ({ ...prev, isSpeaking: true, error: null }));

        if (!textToSpeechService.current) {
          throw new Error("Text-to-speech service not initialized");
        }

        await textToSpeechService.current.speak(text, options);

        setState((prev) => ({ ...prev, isSpeaking: false }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to speak text";
        setState((prev) => ({
          ...prev,
          isSpeaking: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [initializeServices]
  );

  // Speak chat message with context
  const speakChatMessage = useCallback(
    async (
      message: string,
      senderName?: string,
      isAudioTranscription?: boolean
    ): Promise<void> => {
      try {
        initializeServices();
        setState((prev) => ({ ...prev, isSpeaking: true, error: null }));

        if (!textToSpeechService.current) {
          throw new Error("Text-to-speech service not initialized");
        }

        await textToSpeechService.current.speakChatMessage(
          message,
          senderName,
          isAudioTranscription
        );

        setState((prev) => ({ ...prev, isSpeaking: false }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to speak message";
        setState((prev) => ({
          ...prev,
          isSpeaking: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [initializeServices]
  );

  // Stop speaking
  const stopSpeaking = useCallback(async (): Promise<void> => {
    try {
      if (textToSpeechService.current) {
        await textToSpeechService.current.stop();
      }
      setState((prev) => ({ ...prev, isSpeaking: false }));
    } catch (error) {
      console.error("Error stopping speech:", error);
      setState((prev) => ({ ...prev, isSpeaking: false }));
    }
  }, []);

  // Queue speech for sequential playback
  const queueSpeech = useCallback(
    (text: string, options?: TextToSpeechOptions): void => {
      initializeServices();

      if (textToSpeechService.current) {
        textToSpeechService.current.queueSpeech(text, options);
      }
    },
    [initializeServices]
  );

  // Get available TTS voices
  const getAvailableVoices = useCallback(async () => {
    initializeServices();

    if (textToSpeechService.current) {
      return await textToSpeechService.current.getAvailableVoices();
    }
    return [];
  }, [initializeServices]);

  // Update TTS settings
  const updateTTSSettings = useCallback(
    (options: Partial<TextToSpeechOptions>) => {
      initializeServices();

      if (textToSpeechService.current) {
        textToSpeechService.current.updateOptions(options);
      }
    },
    [initializeServices]
  );

  // Check if services are supported
  const isSupported = useCallback(() => {
    initializeServices();

    return {
      speechRecognition:
        speechRecognitionService.current?.isSupported() || false,
      textToSpeech: true, // expo-speech is generally supported
    };
  }, [initializeServices]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isListening: false,
      isSpeaking: false,
      isProcessing: false,
      currentTranscript: "",
      error: null,
    });
  }, []);

  return {
    // State
    ...state,

    // Speech Recognition methods
    transcribeAudioFile,
    startListening,
    stopListening,

    // Text-to-Speech methods
    speak,
    speakChatMessage,
    stopSpeaking,
    queueSpeech,

    // Utility methods
    getAvailableVoices,
    updateTTSSettings,
    isSupported,
    clearError,
    reset,
  };
};
