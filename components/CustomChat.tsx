import { Colors } from "@/constants/Colors";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ChatMessage, ChatUser } from "@/types/chat";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatBubbleProps {
  message: ChatMessage;
  currentUser: ChatUser;
  colors: any;
  colorScheme: "light" | "dark" | null | undefined;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  currentUser,
  colors,
  colorScheme,
}) => {
  const isCurrentUser = message.user._id === currentUser._id;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ago`;
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isCurrentUser ? colors.tint : colors.background,
            borderColor: colors.tabIconDefault,
            shadowColor: colors.text,
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          },
        ]}
      >
        {!isCurrentUser && (
          <Text style={[styles.senderName, { color: colors.tint }]}>
            {message.user.name}
            {message.isAudioTranscription && (
              <Text style={[styles.audioIndicator, { color: colors.tint }]}>
                {" "}
                🎤
              </Text>
            )}
          </Text>
        )}
        {message.isAudioTranscription && isCurrentUser && (
          <Text
            style={[
              styles.audioIndicator,
              {
                color:
                  colorScheme === "dark"
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.8)",
              },
            ]}
          >
            🎤 Audio transcription
          </Text>
        )}
        <Text
          style={[
            styles.messageText,
            { color: isCurrentUser ? "white" : colors.text },
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            {
              color: isCurrentUser
                ? "rgba(255,255,255,0.7)"
                : colors.tabIconDefault,
            },
          ]}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
};

interface CustomChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  user: ChatUser;
  placeholder?: string;
  maxLength?: number;
  onAudioMessage?: (transcription: string, audioUri: string) => void;
}

export const CustomChat: React.FC<CustomChatProps> = ({
  messages,
  onSend,
  user,
  placeholder = "Type a message...",
  maxLength = 1000,
  onAudioMessage,
}) => {
  const [inputText, setInputText] = React.useState("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const scrollViewRef = React.useRef<ScrollView>(null);
  const textInputRef = React.useRef<TextInput>(null);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const {
    isRecording,
    isTranscribing,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
    transcribeAudio,
    formatDuration,
  } = useAudioRecording();

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (trimmedText) {
      if (trimmedText.length > maxLength) {
        Alert.alert(
          "Message too long",
          `Please keep your message under ${maxLength} characters.`
        );
        return;
      }
      onSend(trimmedText);
      setInputText("");
    }
  };

  const handleInputChange = (text: string) => {
    if (text.length <= maxLength) {
      setInputText(text);
    }
  };

  const handleAudioRecording = async () => {
    console.log("handleAudioRecording called, isRecording:", isRecording);
    if (isRecording) {
      // Stop recording and transcribe
      try {
        console.log("Stopping recording...");
        const audioUri = await stopRecording();
        console.log("Recording stopped, audioUri:", audioUri);
        if (audioUri) {
          console.log("Starting transcription...");
          const transcription = await transcribeAudio(audioUri);
          console.log("Transcription completed:", transcription);
          if (onAudioMessage) {
            console.log("Calling onAudioMessage...");
            onAudioMessage(transcription, audioUri);
          } else {
            console.log("onAudioMessage is not provided");
          }
        }
      } catch (error) {
        console.error("Error processing audio:", error);
        Alert.alert("Error", "Failed to process audio recording");
      }
    } else {
      // Start recording
      console.log("Starting recording...");
      const success = await startRecording();
      console.log("Recording start result:", success);
      if (success) {
        // Start pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  };

  const handleCancelRecording = async () => {
    await cancelRecording();
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  React.useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  React.useEffect(() => {
    // Stop pulse animation when recording stops
    if (!isRecording) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // Add keyboard listeners for better scroll behavior
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        // Optional: Handle keyboard hide if needed
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Sort messages by creation date (oldest first for proper chat order)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const canSend =
    inputText.trim().length > 0 && inputText.trim().length <= maxLength;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 120}
      enabled={true}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onContentSizeChange={() => {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }}
      >
        {sortedMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        ) : (
          sortedMessages.map((message) => (
            <ChatBubble
              key={`${message._id}-${message.createdAt.getTime()}`}
              message={message}
              currentUser={user}
              colors={colors}
              colorScheme={colorScheme}
            />
          ))
        )}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.tabIconDefault,
          },
        ]}
      >
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <Animated.View
              style={[
                styles.recordingIndicator,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View
                style={[
                  styles.recordingDot,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#ff6b6b" : "#ff4444",
                  },
                ]}
              />
            </Animated.View>
            <View style={styles.recordingInfo}>
              <Text style={[styles.recordingText, { color: colors.text }]}>
                Recording... {formatDuration(duration)}
              </Text>
              <Text
                style={[styles.recordingHint, { color: colors.tabIconDefault }]}
              >
                Tap stop to transcribe, or cancel to discard
              </Text>
            </View>
            <View style={styles.recordingActions}>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  { backgroundColor: colors.tabIconDefault },
                ]}
                onPress={handleCancelRecording}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.stopButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#ff6b6b" : "#ff4444",
                  },
                ]}
                onPress={handleAudioRecording}
              >
                <Text style={styles.stopButtonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isTranscribing ? (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator size="small" color={colors.tint} />
            <Text style={[styles.transcribingText, { color: colors.text }]}>
              Transcribing audio...
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.audioButton,
                {
                  backgroundColor: colors.tint,
                  opacity: 0.9,
                },
              ]}
              onPress={handleAudioRecording}
              disabled={isTranscribing}
            >
              <Text style={styles.audioButtonText}>🎤</Text>
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={textInputRef}
                style={[
                  styles.textInput,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#333333" : "#f8f8f8",
                    borderColor: colors.tabIconDefault,
                    color: colors.text,
                  },
                ]}
                value={inputText}
                onChangeText={handleInputChange}
                placeholder={placeholder}
                placeholderTextColor={colors.tabIconDefault}
                multiline
                maxLength={maxLength}
                onSubmitEditing={handleSend}
                onFocus={() => {
                  // Scroll to bottom when text input is focused
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
                returnKeyType="send"
                blurOnSubmit={false}
              />
              {inputText.length > maxLength * 0.8 && (
                <Text
                  style={[
                    styles.characterCount,
                    {
                      color:
                        inputText.length >= maxLength
                          ? colorScheme === "dark"
                            ? "#ff6b6b"
                            : "#ff4444"
                          : colors.tabIconDefault,
                    },
                  ]}
                >
                  {inputText.length}/{maxLength}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: canSend
                    ? colors.tint
                    : colors.tabIconDefault,
                  opacity: canSend ? 1 : 0.6,
                },
              ]}
              onPress={handleSend}
              disabled={!canSend}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.6,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  currentUserMessage: {
    alignSelf: "flex-end",
  },
  otherUserMessage: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  audioIndicator: {
    fontSize: 10,
    fontWeight: "500",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: "flex-end",
    minHeight: 60,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  characterCount: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
    paddingHorizontal: 8,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  audioButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  audioButtonText: {
    fontSize: 20,
  },
  recordingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  recordingIndicator: {
    marginRight: 12,
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  recordingInfo: {
    flex: 1,
    marginRight: 12,
  },
  recordingText: {
    fontSize: 16,
    fontWeight: "600",
  },
  recordingHint: {
    fontSize: 12,
    marginTop: 2,
  },
  recordingActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  stopButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stopButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  transcribingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  transcribingText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
  },
});
