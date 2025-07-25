import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSpeechIntegration } from "@/hooks/useSpeechIntegration";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const SpeechIntegrationDemo: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [inputText, setInputText] = useState("");
  const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>(
    []
  );

  const {
    isListening,
    isSpeaking,
    isProcessing,
    currentTranscript,
    error,
    transcribeAudioFile,
    startListening,
    stopListening,
    speak,
    speakChatMessage,
    stopSpeaking,
    queueSpeech,
    isSupported,
    clearError,
    reset,
  } = useSpeechIntegration({
    speechRecognitionLanguage: "en-US",
    textToSpeechLanguage: "en-US",
    speechRate: 0.8,
    speechPitch: 1.0,
    speechVolume: 1.0,
    continuous: false,
    interim: true,
  });

  const handleStartListening = async () => {
    try {
      await startListening();
    } catch (error) {
      Alert.alert("Error", "Failed to start speech recognition");
    }
  };

  const handleStopListening = () => {
    stopListening();
    if (currentTranscript.trim()) {
      setTranscriptionHistory((prev) => [...prev, currentTranscript]);
    }
  };

  const handleSpeak = async () => {
    if (!inputText.trim()) {
      Alert.alert("No Text", "Please enter some text to speak");
      return;
    }

    try {
      await speak(inputText);
    } catch (error) {
      Alert.alert("Error", "Failed to speak text");
    }
  };

  const handleSpeakAsMessage = async () => {
    if (!inputText.trim()) {
      Alert.alert("No Text", "Please enter some text to speak");
      return;
    }

    try {
      await speakChatMessage(inputText, "Demo User", false);
    } catch (error) {
      Alert.alert("Error", "Failed to speak message");
    }
  };

  const handleQueueMultiple = () => {
    if (!inputText.trim()) {
      Alert.alert("No Text", "Please enter some text to queue");
      return;
    }

    const sentences = inputText.split(".").filter((s) => s.trim());
    sentences.forEach((sentence, index) => {
      queueSpeech(`${sentence.trim()}.`, {
        rate: 0.7 + index * 0.1,
        pitch: 1.0 + index * 0.1,
      });
    });
  };

  const handleStopSpeaking = async () => {
    try {
      await stopSpeaking();
    } catch (error) {
      Alert.alert("Error", "Failed to stop speaking");
    }
  };

  const handleClearError = () => {
    clearError();
  };

  const handleReset = () => {
    reset();
    setInputText("");
    setTranscriptionHistory([]);
  };

  const supportInfo = isSupported();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Speech Integration Demo
        </Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          Test speech recognition and text-to-speech
        </Text>
      </View>

      {/* Support Status */}
      <View style={[styles.section, { borderColor: colors.tabIconDefault }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Platform Support
        </Text>
        <Text style={[styles.supportText, { color: colors.text }]}>
          Speech Recognition:{" "}
          {supportInfo.speechRecognition ? "✅ Supported" : "❌ Not Supported"}
        </Text>
        <Text style={[styles.supportText, { color: colors.text }]}>
          Text-to-Speech:{" "}
          {supportInfo.textToSpeech ? "✅ Supported" : "❌ Not Supported"}
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: "#ffebee", borderColor: "#f44336" },
          ]}
        >
          <Text style={[styles.errorText, { color: "#c62828" }]}>
            Error: {error}
          </Text>
          <TouchableOpacity
            style={[styles.errorButton, { backgroundColor: "#f44336" }]}
            onPress={handleClearError}
          >
            <Text style={styles.errorButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Text Input Section */}
      <View style={[styles.section, { borderColor: colors.tabIconDefault }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Text Input for TTS
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colorScheme === "dark" ? "#333" : "#f5f5f5",
              borderColor: colors.tabIconDefault,
              color: colors.text,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter text to speak..."
          placeholderTextColor={colors.tabIconDefault}
          multiline
          maxLength={500}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isSpeaking ? "#ff4444" : colors.tint },
            ]}
            onPress={isSpeaking ? handleStopSpeaking : handleSpeak}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isSpeaking ? "🔇 Stop" : "🔊 Speak"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleSpeakAsMessage}
            disabled={isSpeaking || isProcessing}
          >
            <Text style={styles.buttonText}>💬 As Message</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#FF9800" }]}
          onPress={handleQueueMultiple}
          disabled={isSpeaking || isProcessing}
        >
          <Text style={styles.buttonText}>📝 Queue Sentences</Text>
        </TouchableOpacity>
      </View>

      {/* Speech Recognition Section */}
      {supportInfo.speechRecognition && (
        <View style={[styles.section, { borderColor: colors.tabIconDefault }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Speech Recognition (Web Only)
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: isListening ? "#ff4444" : "#4CAF50" },
              ]}
              onPress={isListening ? handleStopListening : handleStartListening}
              disabled={isProcessing || isSpeaking}
            >
              <Text style={styles.buttonText}>
                {isListening ? "🔇 Stop Listening" : "🎤 Start Listening"}
              </Text>
            </TouchableOpacity>
          </View>

          {(isListening || isProcessing) && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color={colors.tint} />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {isListening ? "Listening..." : "Processing..."}
              </Text>
            </View>
          )}

          {currentTranscript && (
            <View
              style={[
                styles.transcriptContainer,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.tabIconDefault,
                },
              ]}
            >
              <Text
                style={[
                  styles.transcriptLabel,
                  { color: colors.tabIconDefault },
                ]}
              >
                Current Transcript:
              </Text>
              <Text style={[styles.transcriptText, { color: colors.text }]}>
                {currentTranscript}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Transcription History */}
      {transcriptionHistory.length > 0 && (
        <View style={[styles.section, { borderColor: colors.tabIconDefault }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Transcription History
          </Text>
          {transcriptionHistory.map((transcript, index) => (
            <View
              key={index}
              style={[
                styles.historyItem,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.tabIconDefault,
                },
              ]}
            >
              <Text style={[styles.historyText, { color: colors.text }]}>
                {transcript}
              </Text>
              <TouchableOpacity
                style={[
                  styles.speakHistoryButton,
                  { backgroundColor: colors.tint },
                ]}
                onPress={() => speak(transcript)}
                disabled={isSpeaking || isProcessing}
              >
                <Text style={styles.speakHistoryButtonText}>🔊</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Control Buttons */}
      <View style={[styles.section, { borderColor: colors.tabIconDefault }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Controls
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#ff4444" }]}
            onPress={handleStopSpeaking}
          >
            <Text style={styles.buttonText}>⏹️ Stop All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#9E9E9E" }]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>🔄 Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Display */}
      <View style={[styles.section, { borderColor: colors.tabIconDefault }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Current Status
        </Text>
        <Text style={[styles.statusItem, { color: colors.text }]}>
          Listening: {isListening ? "🟢 Active" : "🔴 Inactive"}
        </Text>
        <Text style={[styles.statusItem, { color: colors.text }]}>
          Speaking: {isSpeaking ? "🟢 Active" : "🔴 Inactive"}
        </Text>
        <Text style={[styles.statusItem, { color: colors.text }]}>
          Processing: {isProcessing ? "🟢 Active" : "🔴 Inactive"}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  supportText: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  errorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  errorButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
  },
  transcriptContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 14,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyText: {
    flex: 1,
    fontSize: 14,
  },
  speakHistoryButton: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  speakHistoryButtonText: {
    color: "white",
    fontSize: 12,
  },
  statusItem: {
    fontSize: 14,
    marginBottom: 4,
  },
});
