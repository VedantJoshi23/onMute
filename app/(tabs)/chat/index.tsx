import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ChatListItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

const sampleChats: ChatListItem[] = [
  {
    id: '1',
    title: 'John Doe',
    lastMessage: 'Hey! How are you doing?',
    timestamp: '2:30 PM',
    unreadCount: 2,
  },
  {
    id: '2',
    title: 'Jane Smith',
    lastMessage: 'Thanks for the help yesterday!',
    timestamp: '1:15 PM',
  },
  {
    id: '3',
    title: 'Team Chat',
    lastMessage: 'Meeting at 3 PM today',
    timestamp: '12:45 PM',
    unreadCount: 5,
  },
  {
    id: '4',
    title: 'Mom',
    lastMessage: 'Call me when you get home',
    timestamp: '11:30 AM',
    unreadCount: 1,
  },
  {
    id: '5',
    title: 'Alex Johnson',
    lastMessage: 'The project looks great!',
    timestamp: 'Yesterday',
  },
  {
    id: '6',
    title: 'Study Group',
    lastMessage: 'Exam is next week, let\'s prepare',
    timestamp: 'Yesterday',
    unreadCount: 3,
  },
];

export default function ChatListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderChatItem = ({ item }: { item: ChatListItem }) => (
    <TouchableOpacity
      style={[styles.chatItem, { borderBottomColor: colors.tabIconDefault }]}
      onPress={() => router.push(`/(tabs)/chat/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.avatarText}>
            {item.title.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <ThemedText style={styles.chatTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={[styles.timestamp, { color: colors.tabIconDefault }]}>
            {item.timestamp}
          </ThemedText>
        </View>
        
        <View style={styles.messageRow}>
          <ThemedText 
            style={[styles.lastMessage, { color: colors.tabIconDefault }]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </ThemedText>
          {item.unreadCount && item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]}>
              <ThemedText style={styles.unreadText}>
                {item.unreadCount}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={sampleChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
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
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
