import { SpeechIntegrationDemo } from "@/components/SpeechIntegrationDemo";
import { useAuth } from "@/contexts/AuthContext";
import { chatStorage } from "@/services/chatStorage";
import { clearAllChatData, inspectChatStorage } from "@/utils/devUtils";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DebugScreen() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [chatStorageInfo, setChatStorageInfo] = useState<string>("Not checked");
  const [showSpeechDemo, setShowSpeechDemo] = useState<boolean>(false);

  useEffect(() => {
    const info = [
      `Auth Loading: ${isLoading}`,
      `Is Authenticated: ${isAuthenticated}`,
      `User: ${user ? JSON.stringify(user) : "null"}`,
      `Document Directory: ${FileSystem.documentDirectory}`,
    ];
    setDebugInfo(info);
  }, [user, isLoading, isAuthenticated]);

  const checkChatStorage = async () => {
    try {
      const hasChats = await chatStorage.hasExistingChats();
      const allChats = await chatStorage.getAllChats();
      const info = `Has Chats: ${hasChats}, Count: ${allChats.length}`;
      setChatStorageInfo(info);
    } catch (error) {
      setChatStorageInfo(`Error: ${error}`);
    }
  };

  const runInspection = async () => {
    try {
      await inspectChatStorage();
      Alert.alert("Inspection Complete", "Check console logs for details");
    } catch (error) {
      Alert.alert("Error", `Inspection failed: ${error}`);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all chats and user data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllChatData();
              Alert.alert("Success", "All data cleared");
            } catch (error) {
              Alert.alert("Error", `Failed to clear data: ${error}`);
            }
          },
        },
      ]
    );
  };

  if (showSpeechDemo) {
    return (
      <View style={styles.container}>
        <View style={styles.demoHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowSpeechDemo(false)}
          >
            <Text style={styles.backButtonText}>← Back to Debug</Text>
          </TouchableOpacity>
        </View>
        <SpeechIntegrationDemo />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Information</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication State</Text>
        {debugInfo.map((info, index) => (
          <Text key={index} style={styles.info}>
            {info}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chat Storage</Text>
        <Text style={styles.info}>{chatStorageInfo}</Text>
        <TouchableOpacity style={styles.button} onPress={checkChatStorage}>
          <Text style={styles.buttonText}>Check Chat Storage</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Development Tools</Text>
        <TouchableOpacity style={styles.button} onPress={runInspection}>
          <Text style={styles.buttonText}>Inspect Storage</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearAllData}
        >
          <Text style={styles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#4CAF50" }]}
          onPress={() => setShowSpeechDemo(true)}
        >
          <Text style={styles.buttonText}>Speech Integration Demo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  info: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#667eea",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  dangerButton: {
    backgroundColor: "#d32f2f",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  demoHeader: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
});
