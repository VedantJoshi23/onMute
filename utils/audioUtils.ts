import { ChatMessage, ChatUser } from '@/types/chat';

// Simulated other user for audio transcriptions
export const AUDIO_TRANSCRIPTION_USER: ChatUser = {
  _id: 'audio-user',
  name: 'Voice Assistant',
  avatar: undefined,
};

// Utility to create an audio transcription message
export const createAudioTranscriptionMessage = (
  transcription: string,
  audioUri: string
): ChatMessage => {
  return {
    _id: `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text: transcription,
    createdAt: new Date(),
    user: AUDIO_TRANSCRIPTION_USER,
    isAudioTranscription: true,
    audioUri,
  };
};

// Utility to validate audio URI
export const isValidAudioUri = (uri: string): boolean => {
  return !!(uri && (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http')));
};

// Utility to format transcription text
export const formatTranscription = (text: string): string => {
  if (!text || text.trim().length === 0) {
    return 'Unable to transcribe audio';
  }
  
  // Capitalize first letter and ensure proper punctuation
  const trimmed = text.trim();
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  
  // Add period if no ending punctuation
  if (!/[.!?]$/.test(capitalized)) {
    return capitalized + '.';
  }
  
  return capitalized;
};
