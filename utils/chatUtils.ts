import { ChatMessage, ChatUser } from '@/types/chat';

export class ChatUtils {
  /**
   * Creates a new message
   */
  static createMessage(
    text: string, 
    user: ChatUser, 
    id?: string | number
  ): ChatMessage {
    return {
      _id: id || Date.now().toString(),
      text,
      createdAt: new Date(),
      user,
    };
  }

  /**
   * Formats a date for display in chat
   */
  static formatMessageTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  }

  /**
   * Sorts messages by creation date (oldest first)
   */
  static sortMessages(messages: ChatMessage[]): ChatMessage[] {
    return [...messages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  /**
   * Gets the last message from a conversation
   */
  static getLastMessage(messages: ChatMessage[]): ChatMessage | null {
    if (messages.length === 0) return null;
    
    const sorted = this.sortMessages(messages);
    return sorted[sorted.length - 1];
  }

  /**
   * Validates message text
   */
  static validateMessage(text: string, maxLength: number = 1000): {
    isValid: boolean;
    error?: string;
  } {
    const trimmed = text.trim();
    
    if (trimmed.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    
    if (trimmed.length > maxLength) {
      return { isValid: false, error: `Message too long (max ${maxLength} characters)` };
    }
    
    return { isValid: true };
  }

  /**
   * Generates a unique message ID
   */
  static generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
