import { CustomChat } from '@/components/CustomChat';
import { ChatLoading } from '@/components/LoadingComponent';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { chatStorage } from '@/services/chatStorage';
import { ChatMessage, ChatUser } from '@/types/chat';
import { createAudioTranscriptionMessage, formatTranscription } from '@/utils/audioUtils';
import { ChatUtils } from '@/utils/chatUtils';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatTitle, setChatTitle] = useState('Chat');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const user: ChatUser = {
    _id: 1,
    name: 'You',
  };

  const loadChat = useCallback(async () => {
    if (!chatId) {
      Alert.alert('Error', 'Chat ID not found');
      router.back();
      return;
    }

    try {
      setIsLoadingChat(true);
      console.log('Loading chat:', chatId);
      
      const chatData = await chatStorage.getChatById(chatId);
      
      if (!chatData) {
        Alert.alert('Error', 'Chat not found');
        router.back();
        return;
      }

      console.log('Chat loaded:', chatData.title, 'with', chatData.messages.length, 'messages');
      setMessages(chatData.messages);
      setChatTitle(chatData.title);
    } catch (error) {
      console.error('Error loading chat:', error);
      Alert.alert('Error', 'Failed to load chat');
      router.back();
    } finally {
      setIsLoading(false);
      setIsLoadingChat(false);
    }
  }, [chatId]);

  const saveMessages = useCallback(async (updatedMessages: ChatMessage[]) => {
    if (!chatId) return;

    try {
      await chatStorage.updateChatMessages(chatId, updatedMessages);
      console.log('Messages saved for chat:', chatId);
    } catch (error) {
      console.error('Error saving messages:', error);
      Alert.alert('Error', 'Failed to save message');
    }
  }, [chatId]);

  const onSend = useCallback(async (text: string) => {
    const validation = ChatUtils.validateMessage(text);
    if (!validation.isValid) {
      return; // CustomChat component will handle validation display
    }

    const newMessage = ChatUtils.createMessage(text, user);
    const updatedMessages = [...messages, newMessage];
    
    setMessages(updatedMessages);
    await saveMessages(updatedMessages);
  }, [user, messages, saveMessages]);

  const onAudioMessage = useCallback(async (transcription: string, audioUri: string) => {
    console.log('onAudioMessage called with:', { transcription, audioUri });
    const formattedTranscription = formatTranscription(transcription);
    console.log('Formatted transcription:', formattedTranscription);
    const audioMessage = createAudioTranscriptionMessage(formattedTranscription, audioUri);
    console.log('Created audio message:', audioMessage);
    
    const updatedMessages = [...messages, audioMessage];
    setMessages(updatedMessages);
    await saveMessages(updatedMessages);
    console.log('Audio message saved');
  }, [messages, saveMessages]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  if (isLoading) {
    return <ChatLoading message="Loading chat..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: chatTitle,
          headerShown: true,
        }} 
      />
      {isLoadingChat ? (
        <ChatLoading message="Loading messages..." />
      ) : (
        <CustomChat
          messages={messages}
          onSend={onSend}
          user={user}
          placeholder="Type a message..."
          onAudioMessage={onAudioMessage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
