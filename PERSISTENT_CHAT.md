# Persistent Chat System Documentation

## Overview

The onMute app now features a complete persistent chat system that stores all conversations as individual files on the device. Chats are automatically saved and restored when the app reopens.

## Features Implemented

### 🗂️ **File-Based Chat Storage**
- Each chat is stored as a separate JSON file in the device's document directory
- Chat list metadata is maintained in a separate index file
- All data persists between app sessions
- Automatic backup and recovery

### 💬 **Chat Management**
- **Create New Chats**: Add button (+) in the header to create new conversations
- **Delete Chats**: Long-press any chat to delete it with confirmation
- **Persistent Messages**: All messages (text and audio) are automatically saved
- **Real-time Updates**: Chat list shows latest message and timestamp

### 📱 **User Interface**
- **Loading States**: Smooth loading indicators while accessing stored chats
- **Empty State**: Helpful guidance when no chats exist
- **Pull-to-Refresh**: Refresh chat list by pulling down
- **Add Chat Dialog**: Clean, validated input for new chat creation

### 🎤 **Audio Integration**
- Audio transcriptions are fully integrated with the persistent storage
- All audio messages are saved with their transcriptions
- Audio URI and metadata preserved across sessions

## File Structure

```
DocumentDirectory/
├── chats/
│   ├── chat_1752729123456_abc123def.json
│   ├── chat_1752729234567_def456ghi.json
│   └── ...
├── chatList.json
└── chat_export_[chatId]_[timestamp].txt (when exported)
```

### Chat File Format (.json)
```json
{
  "id": "chat_1752729123456_abc123def",
  "title": "Family Chat",
  "messages": [
    {
      "_id": "msg_1752729123456_xyz789",
      "text": "Hello everyone!",
      "createdAt": "2025-07-17T05:14:38.261Z",
      "user": {
        "_id": 1,
        "name": "You"
      }
    },
    {
      "_id": "audio-1752729278261-653ka3vcd",
      "text": "This is a transcribed audio message.",
      "createdAt": "2025-07-17T05:15:42.123Z",
      "user": {
        "_id": "audio-user",
        "name": "Voice Assistant"
      },
      "isAudioTranscription": true,
      "audioUri": "file://path/to/audio.m4a"
    }
  ],
  "createdAt": "2025-07-17T05:14:00.000Z",
  "updatedAt": "2025-07-17T05:15:42.123Z"
}
```

### Chat List File (chatList.json)
```json
[
  {
    "id": "chat_1752729123456_abc123def",
    "title": "Family Chat",
    "lastMessage": "This is a transcribed audio message.",
    "timestamp": "2:15 PM",
    "createdAt": "2025-07-17T05:14:00.000Z"
  }
]
```

## API Reference

### ChatStorageService

#### Core Methods

```typescript
// Initialize the storage system
await chatStorage.initialize();

// Get all chats
const chats = await chatStorage.getAllChats();

// Create a new chat
const chatId = await chatStorage.createChat("Chat Title");

// Get specific chat
const chat = await chatStorage.getChatById(chatId);

// Update chat messages
await chatStorage.updateChatMessages(chatId, messages);

// Delete a chat
await chatStorage.deleteChat(chatId);

// Export chat as text file
const filePath = await chatStorage.exportChatAsText(chatId);
```

#### Utility Methods

```typescript
// Get storage statistics
const info = await chatStorage.getStorageInfo();
// Returns: { totalChats: number, totalSize: string }
```

## Components

### 1. **ChatListScreen** (`app/(tabs)/chat/index.tsx`)
- Displays all saved chats
- Add button for creating new chats
- Long-press to delete chats
- Pull-to-refresh functionality
- Empty state guidance

### 2. **ChatScreen** (`app/(tabs)/chat/[chatId].tsx`)
- Loads specific chat from storage
- Auto-saves all new messages
- Integrates audio transcription with persistence
- Loading states for chat loading

### 3. **AddChatDialog** (`components/AddChatDialog.tsx`)
- Modal for creating new chats
- Input validation (2-50 characters)
- Loading state during creation

### 4. **LoadingComponent** (`components/LoadingComponent.tsx`)
- Generic loading component
- Specialized chat loading variant

## Usage Flow

### Creating a New Chat
1. Tap the **+** button in the chat list header
2. Enter a chat title (2-50 characters)
3. Tap **Create**
4. Automatically navigates to the new chat

### Sending Messages
1. Type in the message input
2. Tap **Send** or press return
3. Message is automatically saved to storage
4. Chat list updates with latest message

### Audio Messages
1. Tap the microphone button (🎤)
2. Record your audio message
3. Tap **Stop** to transcribe
4. Transcription appears as a message from "Voice Assistant"
5. Both audio and transcription are saved

### Deleting Chats
1. Long-press any chat in the list
2. Confirm deletion in the alert dialog
3. Chat file is permanently deleted

## Data Persistence

### Automatic Saving
- **Message Creation**: Every new message triggers an automatic save
- **Chat Updates**: Last message and timestamp are updated in the chat list
- **Error Handling**: Failed saves show error alerts to the user

### App Lifecycle
- **App Launch**: All chats are loaded from storage with loading indicators
- **Background/Foreground**: Data remains consistent across app states
- **App Restart**: Full chat history is restored exactly as it was

### Export Functionality
- **Text Export**: Chats can be exported as formatted text files
- **File Location**: Exports are saved to the document directory
- **Format**: Human-readable format with timestamps and user names

## Error Handling

### Storage Errors
- File system access failures show user-friendly error messages
- Automatic fallback to empty state if storage is corrupted
- Console logging for debugging

### Network Independence
- Fully offline storage system
- No internet connection required
- Data never leaves the device unless explicitly exported

## Performance Considerations

### File Management
- Individual chat files prevent large file corruption issues
- Lazy loading of chat content (only load when opened)
- Efficient timestamp-based sorting

### Memory Usage
- Chat list loads minimal metadata only
- Full message history loaded only when chat is opened
- Automatic cleanup of unused data

## Future Enhancements

### Planned Features
- **Chat Export Sharing**: Share exported files via system share dialog
- **Chat Import**: Import chats from text files
- **Search Functionality**: Search across all messages in all chats
- **Chat Archiving**: Archive old chats without deleting
- **Backup/Restore**: Cloud backup integration

### Technical Improvements
- **Database Migration**: Option to migrate to SQLite for better performance
- **Compression**: Compress old chat files to save storage space
- **Encryption**: Optional chat encryption for privacy

## Testing

### Manual Testing Steps
1. **Create Chat**: Test chat creation with various titles
2. **Send Messages**: Send text and audio messages
3. **App Restart**: Force-close and reopen app to verify persistence
4. **Delete Chat**: Test chat deletion and confirmation
5. **Empty State**: Delete all chats to test empty state
6. **Loading States**: Observe loading indicators during operations

### Test Cases
- ✅ Chat creation and persistence
- ✅ Message saving and loading
- ✅ Audio transcription persistence
- ✅ Chat deletion and cleanup
- ✅ App restart data recovery
- ✅ Loading state handling
- ✅ Error state handling

The persistent chat system is now fully implemented and ready for production use!
