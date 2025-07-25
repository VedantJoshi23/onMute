import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddChatDialogProps {
  visible: boolean;
  onClose: () => void;
  onCreateChat: (title: string) => Promise<void>;
}

export const AddChatDialog: React.FC<AddChatDialogProps> = ({
  visible,
  onClose,
  onCreateChat,
}) => {
  const [chatTitle, setChatTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleCreate = async () => {
    const trimmedTitle = chatTitle.trim();

    if (!trimmedTitle) {
      Alert.alert("Invalid Title", "Please enter a chat title");
      return;
    }

    if (trimmedTitle.length < 2) {
      Alert.alert(
        "Invalid Title",
        "Chat title must be at least 2 characters long"
      );
      return;
    }

    if (trimmedTitle.length > 50) {
      Alert.alert(
        "Invalid Title",
        "Chat title must be less than 50 characters"
      );
      return;
    }

    try {
      setIsCreating(true);
      Keyboard.dismiss();
      await onCreateChat(trimmedTitle);
      setChatTitle("");
      onClose();
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "Failed to create chat. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setChatTitle("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>New Chat</Text>

          <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
            Enter a name for your new chat
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5",
                borderColor: colors.tabIconDefault,
                color: colors.text,
              },
            ]}
            value={chatTitle}
            onChangeText={setChatTitle}
            placeholder="e.g., Work Team, Family, Friends..."
            placeholderTextColor={colors.tabIconDefault}
            maxLength={50}
            autoFocus
            onSubmitEditing={handleCreate}
            returnKeyType="done"
            editable={!isCreating}
          />

          <View style={styles.characterCount}>
            <Text
              style={[
                styles.characterCountText,
                { color: colors.tabIconDefault },
              ]}
            >
              {chatTitle.length}/50
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: colors.tabIconDefault },
              ]}
              onPress={handleCancel}
              disabled={isCreating}
            >
              <Text
                style={[styles.buttonText, { color: colors.tabIconDefault }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                {
                  backgroundColor: colors.tint,
                  opacity:
                    chatTitle.trim().length >= 2 && !isCreating ? 1 : 0.5,
                },
              ]}
              onPress={handleCreate}
              disabled={chatTitle.trim().length < 2 || isCreating}
            >
              <Text style={[styles.buttonText, { color: "white" }]}>
                {isCreating ? "Creating..." : "Create"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  characterCount: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  characterCountText: {
    fontSize: 12,
    opacity: 0.6,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  createButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
