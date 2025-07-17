import * as FileSystem from 'expo-file-system';

/**
 * Development utility to clear all chat data and simulate a fresh installation
 * WARNING: This will delete all chat data permanently!
 */
export const clearAllChatData = async (): Promise<void> => {
  try {
    const CHATS_DIRECTORY = `${FileSystem.documentDirectory}chats/`;
    const CHAT_LIST_FILE = `${FileSystem.documentDirectory}chatList.json`;

    console.log('Clearing all chat data...');

    // Delete chats directory
    const dirInfo = await FileSystem.getInfoAsync(CHATS_DIRECTORY);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CHATS_DIRECTORY);
      console.log('Deleted chats directory');
    }

    // Delete chat list file
    const listInfo = await FileSystem.getInfoAsync(CHAT_LIST_FILE);
    if (listInfo.exists) {
      await FileSystem.deleteAsync(CHAT_LIST_FILE);
      console.log('Deleted chat list file');
    }

    console.log('All chat data cleared successfully');
  } catch (error) {
    console.error('Error clearing chat data:', error);
    throw error;
  }
};

/**
 * Development utility to check what chat files exist
 */
export const inspectChatStorage = async (): Promise<void> => {
  try {
    const CHATS_DIRECTORY = `${FileSystem.documentDirectory}chats/`;
    const CHAT_LIST_FILE = `${FileSystem.documentDirectory}chatList.json`;

    console.log('=== Chat Storage Inspection ===');
    
    // Check chats directory
    const dirInfo = await FileSystem.getInfoAsync(CHATS_DIRECTORY);
    console.log('Chats directory exists:', dirInfo.exists);
    
    if (dirInfo.exists) {
      const files = await FileSystem.readDirectoryAsync(CHATS_DIRECTORY);
      console.log('Chat files found:', files.length);
      files.forEach(file => console.log('  -', file));
    }

    // Check chat list file
    const listInfo = await FileSystem.getInfoAsync(CHAT_LIST_FILE);
    console.log('Chat list file exists:', listInfo.exists);
    
    if (listInfo.exists) {
      const content = await FileSystem.readAsStringAsync(CHAT_LIST_FILE);
      const chats = JSON.parse(content);
      console.log('Chats in list:', chats.length);
      chats.forEach((chat: any) => console.log('  -', chat.title));
    }

    console.log('=== End Inspection ===');
  } catch (error) {
    console.error('Error inspecting chat storage:', error);
  }
};

// Usage examples (for development only):
// await clearAllChatData(); // Clear everything to test fresh installation
// await inspectChatStorage(); // See what's currently stored

/**
 * Quick function to test fresh installation
 * Call this from the React Native debugger console
 */
export const testFreshInstallation = async (): Promise<void> => {
  await clearAllChatData();
  await inspectChatStorage();
};
