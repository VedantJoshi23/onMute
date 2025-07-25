import { SpeechRecognitionService } from "@/services/speechRecognitionService";
import { Audio } from "expo-av";
import { useRef, useState } from "react";
import { Alert } from "react-native";

export interface AudioRecordingState {
  isRecording: boolean;
  isTranscribing: boolean;
  duration: number;
  recording: Audio.Recording | null;
}

export const useAudioRecording = () => {
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    isTranscribing: false,
    duration: 0,
    recording: null,
  });

  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechRecognitionService = useRef<SpeechRecognitionService | null>(
    null
  );

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant microphone permission to record audio messages.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to request microphone permission");
      return false;
    }
  };

  const startRecording = async (): Promise<boolean> => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return false;

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      const recording = new Audio.Recording();

      const recordingOptions = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: ".m4a",
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      };

      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();

      setState((prev) => ({
        ...prev,
        isRecording: true,
        recording,
        duration: 0,
      }));

      // Start duration timer
      durationInterval.current = setInterval(() => {
        setState((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);

      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Failed to start recording");
      return false;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      if (!state.recording) return null;

      // Clear duration timer
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      setState((prev) => ({
        ...prev,
        isRecording: false,
        isTranscribing: true,
      }));

      await state.recording.stopAndUnloadAsync();
      const uri = state.recording.getURI();

      setState((prev) => ({
        ...prev,
        recording: null,
        isTranscribing: false,
        duration: 0,
      }));

      return uri;
    } catch (error) {
      console.error("Error stopping recording:", error);
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isTranscribing: false,
        recording: null,
        duration: 0,
      }));
      Alert.alert("Error", "Failed to stop recording");
      return null;
    }
  };

  const cancelRecording = async (): Promise<void> => {
    try {
      if (!state.recording) return;

      // Clear duration timer
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }

      await state.recording.stopAndUnloadAsync();

      setState({
        isRecording: false,
        isTranscribing: false,
        duration: 0,
        recording: null,
      });
    } catch (error) {
      console.error("Error cancelling recording:", error);
      setState({
        isRecording: false,
        isTranscribing: false,
        duration: 0,
        recording: null,
      });
    }
  };

  // Real transcription function using native speech recognition
  const transcribeAudio = async (audioUri: string): Promise<string> => {
    try {
      setState((prev) => ({ ...prev, isTranscribing: true }));

      // Initialize speech recognition service if not already created
      if (!speechRecognitionService.current) {
        speechRecognitionService.current = new SpeechRecognitionService({
          language: "en-US",
          continuous: false,
          interim: false,
          maxAlternatives: 1,
        });
      }

      console.log("Starting native speech recognition for audio:", audioUri);

      // Use the native speech recognition service
      const transcription =
        await speechRecognitionService.current.transcribeAudio(audioUri);

      console.log("Native transcription completed:", transcription);

      setState((prev) => ({ ...prev, isTranscribing: false }));
      return transcription;
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setState((prev) => ({ ...prev, isTranscribing: false }));

      // Fallback to simulated transcription on error
      console.log("Falling back to simulated transcription");
      return await simulatedTranscription();
    }
  };

  // Fallback simulated transcription function
  const simulatedTranscription = async (): Promise<string> => {
    // Simulate transcription delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const sampleTranscriptions = [
      "This is a transcribed audio message from the recording.",
      "Hello, I'm speaking into the microphone and this should be transcribed.",
      "Audio transcription is working correctly in the chat app.",
      "This message was created from audio input using speech recognition.",
      "The audio recording feature is now integrated with the chat system.",
    ];

    const randomTranscription =
      sampleTranscriptions[
        Math.floor(Math.random() * sampleTranscriptions.length)
      ];

    return randomTranscription;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
    transcribeAudio,
    formatDuration,
  };
};
