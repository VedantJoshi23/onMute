import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { chatListData, getChatMessages } from '@/data/chatData';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { GiftedChat, IMessage, User } from 'react-native-gifted-chat';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [chatTitle, setChatTitle] = useState('Chat');

  useEffect(() => {
    if (id) {
      // Load initial messages
      const initialMessages = getChatMessages(id);
      setMessages(initialMessages);
      
      // Set chat title
      const chat = chatListData.find(c => c.id === id);
      if (chat) {
        setChatTitle(chat.title);
      }
    }
  }, [id]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
  }, []);

  const user: User = {
    _id: 1,
    name: 'You',
    avatar: 'https://i.pravatar.cc/150?img=10',
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee' }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{chatTitle}</ThemedText>
        <View style={styles.headerRight} />
      </ThemedView>
      
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={user}
        placeholder="Type a message..."
        alwaysShowSend
        showUserAvatar
        messagesContainerStyle={[styles.messagesContainer, { backgroundColor: colors.background }]}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
  },
});
