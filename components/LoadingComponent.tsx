import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingComponentProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({ 
  message = 'Loading...', 
  size = 'large' 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.tint} />
      <Text style={[styles.message, { color: colors.text }]}>
        {message}
      </Text>
    </View>
  );
};

interface ChatLoadingProps {
  message?: string;
}

export const ChatLoading: React.FC<ChatLoadingProps> = ({ 
  message = 'Loading chats...' 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.chatLoadingContainer, { backgroundColor: colors.background }]}>
      <View style={styles.chatLoadingContent}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.chatLoadingTitle, { color: colors.text }]}>
          {message}
        </Text>
        <Text style={[styles.chatLoadingSubtitle, { color: colors.tabIconDefault }]}>
          Accessing your saved conversations...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  chatLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  chatLoadingContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  chatLoadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  chatLoadingSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
});
