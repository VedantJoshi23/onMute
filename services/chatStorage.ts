import { ChatMessage } from '@/types/chat';
import * as FileSystem from 'expo-file-system';

const CHATS_DIRECTORY = `${FileSystem.documentDirectory}chats/`;
const CHAT_LIST_FILE = `${FileSystem.documentDirectory}chatList.json`;

export interface ChatListItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  createdAt: Date;
}

export interface StoredChatData {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

class ChatStorageService {
  private static instance: ChatStorageService;
  private isInitialized = false;

  static getInstance(): ChatStorageService {
    if (!ChatStorageService.instance) {
      ChatStorageService.instance = new ChatStorageService();
    }
    return ChatStorageService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create chats directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(CHATS_DIRECTORY);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CHATS_DIRECTORY, { intermediates: true });
        console.log('Created chats directory');
      }

      // Create chat list file if it doesn't exist
      const listInfo = await FileSystem.getInfoAsync(CHAT_LIST_FILE);
      if (!listInfo.exists) {
        await FileSystem.writeAsStringAsync(CHAT_LIST_FILE, JSON.stringify([]));
        console.log('Created chat list file');
      }

      this.isInitialized = true;
      console.log('ChatStorageService initialized');
    } catch (error) {
      console.error('Error initializing ChatStorageService:', error);
      throw error;
    }
  }

  async getAllChats(): Promise<ChatListItem[]> {
    try {
      await this.initialize();
      
      // Check if chat list file exists and has content
      const listInfo = await FileSystem.getInfoAsync(CHAT_LIST_FILE);
      if (!listInfo.exists) {
        console.log('Chat list file does not exist - fresh installation');
        return [];
      }
      
      const chatListContent = await FileSystem.readAsStringAsync(CHAT_LIST_FILE);
      const chatList: ChatListItem[] = JSON.parse(chatListContent);
      
      // Convert string dates back to Date objects
      return chatList.map(chat => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
      }));
    } catch (error) {
      console.error('Error getting all chats:', error);
      return [];
    }
  }

  async hasExistingChats(): Promise<boolean> {
    try {
      await this.initialize();
      
      // Quick check without loading all chat data
      const listInfo = await FileSystem.getInfoAsync(CHAT_LIST_FILE);
      if (!listInfo.exists) {
        return false;
      }
      
      const chatListContent = await FileSystem.readAsStringAsync(CHAT_LIST_FILE);
      const chatList: ChatListItem[] = JSON.parse(chatListContent);
      return chatList.length > 0;
    } catch (error) {
      console.error('Error checking existing chats:', error);
      return false;
    }
  }

  async getChatById(chatId: string): Promise<StoredChatData | null> {
    try {
      await this.initialize();
      
      const chatFilePath = `${CHATS_DIRECTORY}${chatId}.json`;
      const fileInfo = await FileSystem.getInfoAsync(chatFilePath);
      
      if (!fileInfo.exists) {
        return null;
      }

      const chatContent = await FileSystem.readAsStringAsync(chatFilePath);
      const chatData: StoredChatData = JSON.parse(chatContent);
      
      // Convert string dates back to Date objects
      return {
        ...chatData,
        createdAt: new Date(chatData.createdAt),
        updatedAt: new Date(chatData.updatedAt),
        messages: chatData.messages.map(message => ({
          ...message,
          createdAt: new Date(message.createdAt),
        })),
      };
    } catch (error) {
      console.error(`Error getting chat ${chatId}:`, error);
      return null;
    }
  }

  async createChat(title: string): Promise<string> {
    try {
      await this.initialize();
      
      const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date();
      
      const newChat: StoredChatData = {
        id: chatId,
        title,
        messages: [],
        createdAt: now,
        updatedAt: now,
      };

      // Save chat data
      const chatFilePath = `${CHATS_DIRECTORY}${chatId}.json`;
      await FileSystem.writeAsStringAsync(chatFilePath, JSON.stringify(newChat, null, 2));

      // Update chat list
      const chatList = await this.getAllChats();
      const newChatListItem: ChatListItem = {
        id: chatId,
        title,
        lastMessage: 'No messages yet',
        timestamp: 'Just now',
        createdAt: now,
      };
      
      chatList.push(newChatListItem);
      await FileSystem.writeAsStringAsync(CHAT_LIST_FILE, JSON.stringify(chatList, null, 2));

      console.log(`Created new chat: ${chatId}`);
      return chatId;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  async updateChatMessages(chatId: string, messages: ChatMessage[]): Promise<void> {
    try {
      await this.initialize();
      
      const existingChat = await this.getChatById(chatId);
      if (!existingChat) {
        throw new Error(`Chat ${chatId} not found`);
      }

      const updatedChat: StoredChatData = {
        ...existingChat,
        messages,
        updatedAt: new Date(),
      };

      // Save updated chat data
      const chatFilePath = `${CHATS_DIRECTORY}${chatId}.json`;
      await FileSystem.writeAsStringAsync(chatFilePath, JSON.stringify(updatedChat, null, 2));

      // Update chat list with latest message info
      await this.updateChatListItem(chatId, messages);

      console.log(`Updated chat ${chatId} with ${messages.length} messages`);
    } catch (error) {
      console.error(`Error updating chat ${chatId}:`, error);
      throw error;
    }
  }

  private async updateChatListItem(chatId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const chatList = await this.getAllChats();
      const chatIndex = chatList.findIndex(chat => chat.id === chatId);
      
      if (chatIndex === -1) return;

      const lastMessage = messages.length > 0 
        ? messages[messages.length - 1].text 
        : 'No messages yet';
      
      const timestamp = messages.length > 0 
        ? this.formatTimestamp(messages[messages.length - 1].createdAt)
        : 'Just now';

      chatList[chatIndex] = {
        ...chatList[chatIndex],
        lastMessage,
        timestamp,
      };

      await FileSystem.writeAsStringAsync(CHAT_LIST_FILE, JSON.stringify(chatList, null, 2));
    } catch (error) {
      console.error('Error updating chat list item:', error);
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    try {
      await this.initialize();
      
      // Delete chat file
      const chatFilePath = `${CHATS_DIRECTORY}${chatId}.json`;
      const fileInfo = await FileSystem.getInfoAsync(chatFilePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(chatFilePath);
      }

      // Remove from chat list
      const chatList = await this.getAllChats();
      const updatedChatList = chatList.filter(chat => chat.id !== chatId);
      await FileSystem.writeAsStringAsync(CHAT_LIST_FILE, JSON.stringify(updatedChatList, null, 2));

      console.log(`Deleted chat ${chatId}`);
    } catch (error) {
      console.error(`Error deleting chat ${chatId}:`, error);
      throw error;
    }
  }

  async exportChatAsText(chatId: string): Promise<string | null> {
    try {
      const chatData = await this.getChatById(chatId);
      if (!chatData) return null;

      let exportContent = `Chat Export: ${chatData.title}\n`;
      exportContent += `Created: ${chatData.createdAt.toLocaleString()}\n`;
      exportContent += `Last Updated: ${chatData.updatedAt.toLocaleString()}\n`;
      exportContent += `Total Messages: ${chatData.messages.length}\n\n`;
      exportContent += '--- Messages ---\n\n';

      chatData.messages.forEach((message, index) => {
        const timestamp = message.createdAt.toLocaleString();
        const audioIndicator = message.isAudioTranscription ? ' 🎤' : '';
        exportContent += `[${timestamp}] ${message.user.name}${audioIndicator}: ${message.text}\n`;
      });

      // Save export file
      const exportFilePath = `${FileSystem.documentDirectory}chat_export_${chatId}_${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(exportFilePath, exportContent);

      console.log(`Exported chat ${chatId} to ${exportFilePath}`);
      return exportFilePath;
    } catch (error) {
      console.error(`Error exporting chat ${chatId}:`, error);
      return null;
    }
  }

  async getStorageInfo(): Promise<{ totalChats: number; totalSize: string }> {
    try {
      await this.initialize();
      
      const chatList = await this.getAllChats();
      const dirInfo = await FileSystem.getInfoAsync(CHATS_DIRECTORY);
      
      let totalSize = 0;
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(CHATS_DIRECTORY);
        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(`${CHATS_DIRECTORY}${file}`);
          if (fileInfo.exists && 'size' in fileInfo) {
            totalSize += fileInfo.size || 0;
          }
        }
      }

      return {
        totalChats: chatList.length,
        totalSize: this.formatFileSize(totalSize),
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { totalChats: 0, totalSize: '0 B' };
    }
  }

  private formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const chatStorage = ChatStorageService.getInstance();
