import { CustomChat } from '@/components/CustomChat';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ChatData, ChatMessage, ChatUser } from '@/types/chat';
import { ChatUtils } from '@/utils/chatUtils';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const sampleChatData: ChatData = {
  '1': {
    title: 'John Doe',
    messages: [
      {
        _id: 1,
        text: 'Hello there! How are you doing?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'John Doe',
          avatar: undefined,
        },
      },
      {
        _id: 2,
        text: 'Hey John! I\'m doing great, thanks for asking. How about you?',
        createdAt: new Date(Date.now() - 60000),
        user: {
          _id: 1,
          name: 'You',
        },
      },
      {
        _id: 3,
        text: 'I\'m doing well too! Just working on some new projects.',
        createdAt: new Date(Date.now() - 120000),
        user: {
          _id: 2,
          name: 'John Doe',
          avatar: undefined,
        },
      },
    ],
  },
  '2': {
    title: 'Jane Smith',
    messages: [
      {
        _id: 1,
        text: 'Thanks for the help yesterday! Really appreciated it.',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Jane Smith',
          avatar: undefined,
        },
      },
      {
        _id: 2,
        text: 'No problem at all! Happy to help anytime.',
        createdAt: new Date(Date.now() - 30000),
        user: {
          _id: 1,
          name: 'You',
        },
      },
    ],
  },
  '3': {
    title: 'Team Chat',
    messages: [
      {
        _id: 1,
        text: 'Meeting at 3 PM today in the conference room',
        createdAt: new Date(),
        user: {
          _id: 3,
          name: 'Team Lead',
          avatar: undefined,
        },
      },
      {
        _id: 2,
        text: 'Got it, I\'ll be there!',
        createdAt: new Date(Date.now() - 15000),
        user: {
          _id: 1,
          name: 'You',
        },
      },
      {
        _id: 3,
        text: 'Perfect! See you all there.',
        createdAt: new Date(Date.now() - 45000),
        user: {
          _id: 3,
          name: 'Team Lead',
          avatar: undefined,
        },
      },
    ],
  },
  '4': {
    title: 'Mom',
    messages: [
      {
        _id: 1,
        text: 'Call me when you get home, sweetie',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Mom',
          avatar: undefined,
        },
      },
      {
        _id: 2,
        text: 'Sure mom, I\'ll call you in about an hour',
        createdAt: new Date(Date.now() - 30000),
        user: {
          _id: 1,
          name: 'You',
        },
      },
    ],
  },
  '5': {
    title: 'Alex Johnson',
    messages: [
      {
        _id: 1,
        text: 'The project looks great! Really impressed with your work.',
        createdAt: new Date(Date.now() - 86400000), // Yesterday
        user: {
          _id: 2,
          name: 'Alex Johnson',
          avatar: undefined,
        },
      },
      {
        _id: 2,
        text: 'Thank you so much! I put a lot of effort into it.',
        createdAt: new Date(Date.now() - 86460000),
        user: {
          _id: 1,
          name: 'You',
        },
      },
    ],
  },
  '6': {
    title: 'Study Group',
    messages: [
      {
        _id: 1,
        text: 'Exam is next week, let\'s prepare together',
        createdAt: new Date(Date.now() - 86400000),
        user: {
          _id: 3,
          name: 'Sarah',
          avatar: undefined,
        },
      },
      {
        _id: 2,
        text: 'Sounds good! What time works for everyone?',
        createdAt: new Date(Date.now() - 86430000),
        user: {
          _id: 1,
          name: 'You',
        },
      },
      {
        _id: 3,
        text: 'How about tomorrow at 2 PM?',
        createdAt: new Date(Date.now() - 86470000),
        user: {
          _id: 4,
          name: 'Mike',
          avatar: undefined,
        },
      },
    ],
  },
};

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const chatData = sampleChatData[chatId || '1'];
  const [messages, setMessages] = useState<ChatMessage[]>(chatData?.messages || []);

  const user: ChatUser = {
    _id: 1,
    name: 'You',
  };

  useEffect(() => {
    if (chatData) {
      setMessages(chatData.messages);
    }
  }, [chatData]);

  const onSend = useCallback((text: string) => {
    const validation = ChatUtils.validateMessage(text);
    if (!validation.isValid) {
      return; // CustomChat component will handle validation display
    }

    const newMessage = ChatUtils.createMessage(text, user);
    setMessages(previousMessages => [...previousMessages, newMessage]);
  }, [user]);

  if (!chatData) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          title: chatData.title,
          headerShown: true,
        }} 
      />
      <CustomChat
        messages={messages}
        onSend={onSend}
        user={user}
        placeholder="Type a message..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
