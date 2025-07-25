import * as Speech from "expo-speech";
import { Platform } from "react-native";

export interface TextToSpeechOptions {
  voice?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  language?: string;
}

export interface SpeechVoice {
  identifier: string;
  name: string;
  quality: string;
  language: string;
}

export class TextToSpeechService {
  private currentSpeechOptions: TextToSpeechOptions;
  private isSpeaking: boolean = false;
  private speechQueue: Array<{ text: string; options?: TextToSpeechOptions }> =
    [];

  constructor(defaultOptions: TextToSpeechOptions = {}) {
    this.currentSpeechOptions = {
      pitch: 1.0,
      rate: 0.75,
      volume: 1.0,
      language: "en-US",
      ...defaultOptions,
    };
  }

  /**
   * Speak the given text using text-to-speech
   */
  async speak(text: string, options?: TextToSpeechOptions): Promise<void> {
    try {
      const speechOptions = { ...this.currentSpeechOptions, ...options };

      // Clean and prepare text for speech
      const cleanText = this.preprocessText(text);

      if (!cleanText.trim()) {
        console.warn("TextToSpeech: Empty text provided");
        return;
      }

      console.log("Speaking text:", cleanText);

      const speechConfig: Speech.SpeechOptions = {
        language: speechOptions.language,
        pitch: speechOptions.pitch,
        rate: speechOptions.rate,
        volume: speechOptions.volume,
      };

      // Add voice if specified and supported
      if (speechOptions.voice && Platform.OS !== "web") {
        speechConfig.voice = speechOptions.voice;
      }

      this.isSpeaking = true;

      await Speech.speak(cleanText, {
        ...speechConfig,
        onStart: () => {
          console.log("Speech started");
        },
        onDone: () => {
          console.log("Speech completed");
          this.isSpeaking = false;
          this.processQueue();
        },
        onStopped: () => {
          console.log("Speech stopped");
          this.isSpeaking = false;
          this.processQueue();
        },
        onError: (error) => {
          console.error("Speech error:", error);
          this.isSpeaking = false;
          this.processQueue();
        },
      });
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      this.isSpeaking = false;
      throw new Error(`Text-to-speech failed: ${error}`);
    }
  }

  /**
   * Add text to speech queue for sequential playback
   */
  queueSpeech(text: string, options?: TextToSpeechOptions): void {
    this.speechQueue.push({ text, options });

    if (!this.isSpeaking) {
      this.processQueue();
    }
  }

  /**
   * Process the speech queue
   */
  private async processQueue(): Promise<void> {
    if (this.speechQueue.length === 0 || this.isSpeaking) {
      return;
    }

    const nextItem = this.speechQueue.shift();
    if (nextItem) {
      await this.speak(nextItem.text, nextItem.options);
    }
  }

  /**
   * Stop current speech and clear queue
   */
  async stop(): Promise<void> {
    try {
      this.speechQueue = [];
      this.isSpeaking = false;
      await Speech.stop();
      console.log("Speech stopped and queue cleared");
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  }

  /**
   * Pause current speech (iOS only)
   */
  async pause(): Promise<void> {
    try {
      if (Platform.OS === "ios") {
        await Speech.pause();
        console.log("Speech paused");
      } else {
        console.warn("Pause not supported on this platform");
      }
    } catch (error) {
      console.error("Error pausing speech:", error);
    }
  }

  /**
   * Resume paused speech (iOS only)
   */
  async resume(): Promise<void> {
    try {
      if (Platform.OS === "ios") {
        await Speech.resume();
        console.log("Speech resumed");
      } else {
        console.warn("Resume not supported on this platform");
      }
    } catch (error) {
      console.error("Error resuming speech:", error);
    }
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<SpeechVoice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.map((voice) => ({
        identifier: voice.identifier,
        name: voice.name,
        quality: voice.quality,
        language: voice.language,
      }));
    } catch (error) {
      console.error("Error getting available voices:", error);
      return [];
    }
  }

  /**
   * Get voices for a specific language
   */
  async getVoicesForLanguage(language: string): Promise<SpeechVoice[]> {
    const allVoices = await this.getAvailableVoices();
    return allVoices.filter((voice) => voice.language.startsWith(language));
  }

  /**
   * Check if text-to-speech is available
   */
  async isSpeechAvailable(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error("Error checking speech availability:", error);
      return false;
    }
  }

  /**
   * Check if currently speaking
   */
  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get current speech options
   */
  getCurrentOptions(): TextToSpeechOptions {
    return { ...this.currentSpeechOptions };
  }

  /**
   * Update default speech options
   */
  updateOptions(options: Partial<TextToSpeechOptions>): void {
    this.currentSpeechOptions = { ...this.currentSpeechOptions, ...options };
  }

  /**
   * Preprocess text for better speech synthesis
   */
  private preprocessText(text: string): string {
    // Remove excessive whitespace
    let cleanText = text.replace(/\s+/g, " ").trim();

    // Replace common chat abbreviations
    const abbreviations: { [key: string]: string } = {
      lol: "laugh out loud",
      omg: "oh my god",
      brb: "be right back",
      ttyl: "talk to you later",
      fyi: "for your information",
      btw: "by the way",
      tbh: "to be honest",
      imo: "in my opinion",
      imho: "in my humble opinion",
      asap: "as soon as possible",
      aka: "also known as",
      etc: "et cetera",
      vs: "versus",
      "w/": "with",
      "w/o": "without",
    };

    // Replace abbreviations (case insensitive)
    Object.entries(abbreviations).forEach(([abbr, expansion]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, "gi");
      cleanText = cleanText.replace(regex, expansion);
    });

    // Replace URLs with "link"
    cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, "link");

    // Replace email addresses with "email address"
    cleanText = cleanText.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "email address"
    );

    // Replace emojis with their description (basic ones)
    const emojiReplacements: { [key: string]: string } = {
      "😀": "happy face",
      "😃": "happy face",
      "😄": "happy face",
      "😊": "smiling face",
      "😂": "laughing",
      "😢": "sad face",
      "😭": "crying",
      "😍": "heart eyes",
      "😘": "blowing kiss",
      "👍": "thumbs up",
      "👎": "thumbs down",
      "❤️": "heart",
      "💯": "one hundred",
      "🔥": "fire",
      "👏": "clapping",
      "🤝": "handshake",
      "🙏": "prayer hands",
      "✅": "check mark",
      "❌": "cross mark",
      "⭐": "star",
      "🌟": "star",
      "🎉": "party",
      "🎊": "celebration",
    };

    Object.entries(emojiReplacements).forEach(([emoji, description]) => {
      cleanText = cleanText.replace(new RegExp(emoji, "g"), ` ${description} `);
    });

    // Remove remaining emojis and special characters that might not be pronounced well
    cleanText = cleanText.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      ""
    );

    // Normalize punctuation for better speech rhythm
    cleanText = cleanText.replace(/([.!?])\1+/g, "$1"); // Remove repeated punctuation
    cleanText = cleanText.replace(/[^\w\s.!?,-]/g, ""); // Remove special characters except basic punctuation

    // Ensure proper spacing around punctuation
    cleanText = cleanText.replace(/([.!?])([A-Za-z])/g, "$1 $2");

    return cleanText.trim();
  }

  /**
   * Speak a chat message with appropriate formatting
   */
  async speakChatMessage(
    message: string,
    senderName?: string,
    isAudioTranscription?: boolean
  ): Promise<void> {
    let textToSpeak = message;

    // Add context for audio transcriptions
    if (isAudioTranscription) {
      textToSpeak = `Voice message: ${textToSpeak}`;
    }

    // Add sender name for better context
    if (senderName && senderName !== "You") {
      textToSpeak = `${senderName} says: ${textToSpeak}`;
    }

    await this.speak(textToSpeak);
  }

  /**
   * Quick announcement for accessibility
   */
  async announce(message: string): Promise<void> {
    await this.speak(message, {
      rate: 0.9,
      pitch: 1.1,
      volume: 0.8,
    });
  }
}

// Default instance for easy usage
export const defaultTextToSpeech = new TextToSpeechService({
  language: "en-US",
  rate: 0.75,
  pitch: 1.0,
  volume: 1.0,
});

// Utility functions for common TTS operations
export const speakText = (text: string, options?: TextToSpeechOptions) => {
  return defaultTextToSpeech.speak(text, options);
};

export const stopSpeaking = () => {
  return defaultTextToSpeech.stop();
};

export const speakChatMessage = (
  message: string,
  senderName?: string,
  isAudioTranscription?: boolean
) => {
  return defaultTextToSpeech.speakChatMessage(
    message,
    senderName,
    isAudioTranscription
  );
};
