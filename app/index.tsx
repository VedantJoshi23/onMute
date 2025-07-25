import { useAuth } from "@/contexts/AuthContext";
import { Redirect, router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugButton}
            onPress={() => router.push("/debug")}
          >
            <Text style={styles.debugText}>Debug Info</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  debugButton: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "#667eea",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  debugText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
