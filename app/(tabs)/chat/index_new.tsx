import { AddChatDialog } from '@/components/AddChatDialog';
import { ChatLoading } from '@/components/LoadingComponent';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { chatStorage, ChatListItem as StoredChatListItem } from '@/services/chatStorage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ChatListItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

export default function ChatListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [chats, setChats] = useState<StoredChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      console.log('Loading chats...');
      const loadedChats = await chatStorage.getAllChats();
      console.log('Loaded chats:', loadedChats.length);
      setChats(loadedChats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Error', 'Failed to load chats');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadChats();
  }, [loadChats]);

  const handleCreateChat = useCallback(async (title: string) => {
    try {
      console.log('Creating chat:', title);
      const chatId = await chatStorage.createChat(title);
      console.log('Chat created with ID:', chatId);
      await loadChats(); // Reload the chat list
      router.push(`/(tabs)/chat/${chatId}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }, [loadChats]);

  const handleChatPress = useCallback((chatId: string) => {
    router.push(`/(tabs)/chat/${chatId}`);
  }, []);

  const handleDeleteChat = useCallback(async (chatId: string, chatTitle: string) => {
    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete "${chatTitle}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatStorage.deleteChat(chatId);
              await loadChats();
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Error', 'Failed to delete chat');
            }
          },
        },
      ]
    );
  }, [loadChats]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const renderChatItem = ({ item }: { item: StoredChatListItem }) => (
    <TouchableOpacity
      style={[styles.chatItem, { borderBottomColor: colors.tabIconDefault }]}
      onPress={() => handleChatPress(item.id)}
      onLongPress={() => handleDeleteChat(item.id, item.title)}
    >
      <View style={styles.chatItemContent}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={styles.avatarText}>
            {item.title.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <ThemedText style={styles.chatTitle} numberOfLines={1}>
              {item.title}
            </ThemedText>
            <ThemedText style={[styles.timestamp, { color: colors.tabIconDefault }]}>
              {item.timestamp}
            </ThemedText>
          </View>
          <View style={styles.chatFooter}>
            <ThemedText 
              style={[styles.lastMessage, { color: colors.tabIconDefault }]} 
              numberOfLines={1}
            >
              {item.lastMessage}
            </ThemedText>
            {item.unreadCount && item.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Chats Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.tabIconDefault }]}>
        Create your first chat to get started
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.tint }]}
        onPress={() => setShowAddDialog(true)}
      >
        <Text style={styles.emptyButtonText}>Create Chat</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <ChatLoading message="Loading your chats..." />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.tabIconDefault }]}>
        <ThemedText style={styles.headerTitle}>Chats</ThemedText>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => setShowAddDialog(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={chats.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <AddChatDialog
        visible={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onCreateChat={handleCreateChat}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  list: {
    padding: 0,
  },
  emptyList: {
    flexGrow: 1,
  },
  chatItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  chatItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 32,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
