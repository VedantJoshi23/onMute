import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ChatMessage, ChatUser } from '@/types/chat';
import React from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ChatBubbleProps {
  message: ChatMessage;
  currentUser: ChatUser;
  colors: any;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, currentUser, colors }) => {
  const isCurrentUser = message.user._id === currentUser._id;
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days}d ago`;
    }
    
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  return (
    <View style={[
      styles.messageContainer,
      isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
    ]}>
      <View style={[
        styles.messageBubble,
        {
          backgroundColor: isCurrentUser ? colors.tint : colors.background,
          borderColor: colors.tabIconDefault,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }
      ]}>
        {!isCurrentUser && (
          <Text style={[styles.senderName, { color: colors.tint }]}>
            {message.user.name}
          </Text>
        )}
        <Text style={[
          styles.messageText,
          { color: isCurrentUser ? 'white' : colors.text }
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : colors.tabIconDefault }
        ]}>
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
}

export const CustomChat: React.FC<CustomChatProps> = ({
  messages,
  onSend,
  user,
  placeholder = "Type a message...",
  maxLength = 1000
}) => {
  const [inputText, setInputText] = React.useState('');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleSend = () => {
    const trimmedText = inputText.trim();
    if (trimmedText) {
      if (trimmedText.length > maxLength) {
        Alert.alert('Message too long', `Please keep your message under ${maxLength} characters.`);
        return;
      }
      onSend(trimmedText);
      setInputText('');
    }
  };

  const handleInputChange = (text: string) => {
    if (text.length <= maxLength) {
      setInputText(text);
    }
  };

  React.useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Sort messages by creation date (oldest first for proper chat order)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const canSend = inputText.trim().length > 0 && inputText.trim().length <= maxLength;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
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
            />
          ))
        )}
      </ScrollView>
      
      <View style={[styles.inputContainer, { 
        backgroundColor: colors.background,
        borderTopColor: colors.tabIconDefault 
      }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
              borderColor: colors.tabIconDefault,
              color: colors.text 
            }]}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder={placeholder}
            placeholderTextColor={colors.tabIconDefault}
            multiline
            maxLength={maxLength}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          {inputText.length > maxLength * 0.8 && (
            <Text style={[styles.characterCount, { 
              color: inputText.length >= maxLength ? '#ff4444' : colors.tabIconDefault 
            }]}>
              {inputText.length}/{maxLength}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.sendButton, { 
            backgroundColor: canSend ? colors.tint : colors.tabIconDefault,
            opacity: canSend ? 1 : 0.6,
          }]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
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
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: 'flex-end',
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
    textAlign: 'right',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
