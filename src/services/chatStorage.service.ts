import type { ChatConversation, ChatMessage } from '../types/chat.types';
import { ConversationStatus } from '../types/chat.types';
import { v4 as uuidV4 } from 'uuid';

class ChatStorageService {
  private storageKey = 'chat-conversations';
  private maxConversations = 100;
  private maxMessagesPerConversation = 1000;

  // Load all conversations from storage
  loadConversations(): Map<string, ChatConversation> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return new Map();

      const data = JSON.parse(stored);
      const conversations = new Map<string, ChatConversation>();
      
      // Convert array back to Map and validate data
      data.forEach((conv: any) => {
        if (this.isValidConversation(conv)) {
          conversations.set(conv.id, conv);
        }
      });

      return conversations;
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return new Map();
    }
  }

  // Save all conversations to storage
  saveConversations(conversations: Map<string, ChatConversation>): void {
    try {
      // Convert Map to array and limit size
      const conversationsArray = Array.from(conversations.values())
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, this.maxConversations)
        .map(conv => ({
          ...conv,
          messages: conv.messages.slice(-this.maxMessagesPerConversation)
        }));

      localStorage.setItem(this.storageKey, JSON.stringify(conversationsArray));
    } catch (error) {
      console.error('Failed to save conversations:', error);
      this.handleStorageError();
    }
  }

  // Save a single conversation
  saveConversation(conversation: ChatConversation): void {
    const conversations = this.loadConversations();
    conversations.set(conversation.id, conversation);
    this.saveConversations(conversations);
  }

  // Load a specific conversation
  loadConversation(conversationId: string): ChatConversation | null {
    const conversations = this.loadConversations();
    return conversations.get(conversationId) || null;
  }

  // Create a new conversation
  createConversation(componentId: string, title?: string): ChatConversation {
    const conversation: ChatConversation = {
      id: uuidV4(),
      componentId,
      title: title || `Chat with ${componentId}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: ConversationStatus.ACTIVE
    };

    this.saveConversation(conversation);
    return conversation;
  }

  // Add message to conversation
  addMessage(conversationId: string, message: ChatMessage): ChatConversation | null {
    const conversation = this.loadConversation(conversationId);
    if (!conversation) return null;

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    this.saveConversation(conversation);
    return conversation;
  }

  // Update message in conversation
  updateMessage(conversationId: string, messageId: string, updates: Partial<ChatMessage>): ChatConversation | null {
    const conversation = this.loadConversation(conversationId);
    if (!conversation) return null;

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return null;

    conversation.messages[messageIndex] = {
      ...conversation.messages[messageIndex],
      ...updates
    };
    conversation.updatedAt = new Date().toISOString();

    this.saveConversation(conversation);
    return conversation;
  }

  // Delete a conversation
  deleteConversation(conversationId: string): void {
    const conversations = this.loadConversations();
    conversations.delete(conversationId);
    this.saveConversations(conversations);
  }

  // Get conversations for a specific component
  getConversationsForComponent(componentId: string): ChatConversation[] {
    const conversations = this.loadConversations();
    return Array.from(conversations.values())
      .filter(conv => conv.componentId === componentId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // Archive old conversations
  archiveOldConversations(daysOld: number = 30): number {
    const conversations = this.loadConversations();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let archivedCount = 0;
    for (const [_id, conversation] of conversations) {
      const lastUpdate = new Date(conversation.updatedAt);
      if (lastUpdate < cutoffDate && conversation.status === ConversationStatus.ACTIVE) {
        conversation.status = ConversationStatus.ARCHIVED;
        archivedCount++;
      }
    }

    if (archivedCount > 0) {
      this.saveConversations(conversations);
    }

    return archivedCount;
  }

  // Clear all conversations
  clearAllConversations(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Export conversations as JSON
  exportConversations(): string {
    const conversations = this.loadConversations();
    return JSON.stringify(Array.from(conversations.values()), null, 2);
  }

  // Import conversations from JSON
  importConversations(jsonData: string): number {
    try {
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data)) {
        throw new Error('Invalid format: expected array of conversations');
      }

      const conversations = this.loadConversations();
      let importedCount = 0;

      data.forEach((conv: any) => {
        if (this.isValidConversation(conv)) {
          conversations.set(conv.id, conv);
          importedCount++;
        }
      });

      this.saveConversations(conversations);
      return importedCount;
    } catch (error) {
      console.error('Failed to import conversations:', error);
      throw error;
    }
  }

  // Get storage usage statistics
  getStorageStats(): {
    totalConversations: number;
    totalMessages: number;
    storageSize: number;
    lastCleanup: string | null;
  } {
    const conversations = this.loadConversations();
    const totalMessages = Array.from(conversations.values())
      .reduce((sum, conv) => sum + conv.messages.length, 0);

    const storageData = localStorage.getItem(this.storageKey);
    const storageSize = storageData ? new Blob([storageData]).size : 0;

    return {
      totalConversations: conversations.size,
      totalMessages,
      storageSize,
      lastCleanup: localStorage.getItem(`${this.storageKey}_last_cleanup`)
    };
  }

  // Cleanup old data
  cleanup(): void {
    try {
      // Archive old conversations
      this.archiveOldConversations(30);

      // Remove very old archived conversations
      const conversations = this.loadConversations();
      const veryOldDate = new Date();
      veryOldDate.setDate(veryOldDate.getDate() - 90);

      let removedCount = 0;
      for (const [id, conversation] of conversations) {
        const lastUpdate = new Date(conversation.updatedAt);
        if (lastUpdate < veryOldDate && conversation.status === ConversationStatus.ARCHIVED) {
          conversations.delete(id);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        this.saveConversations(conversations);
      }

      // Record cleanup time
      localStorage.setItem(`${this.storageKey}_last_cleanup`, new Date().toISOString());

      console.log(`Cleanup completed: archived old conversations, removed ${removedCount} very old conversations`);
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  private isValidConversation(conv: any): conv is ChatConversation {
    return (
      conv &&
      typeof conv.id === 'string' &&
      typeof conv.componentId === 'string' &&
      typeof conv.title === 'string' &&
      Array.isArray(conv.messages) &&
      typeof conv.createdAt === 'string' &&
      typeof conv.updatedAt === 'string' &&
      Object.values(ConversationStatus).includes(conv.status)
    );
  }

  private handleStorageError(): void {
    // Try to free up space by removing old conversations
    try {
      const conversations = this.loadConversations();
      const sortedConversations = Array.from(conversations.values())
        .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

      // Remove oldest 25% of conversations
      const toRemove = Math.floor(sortedConversations.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        conversations.delete(sortedConversations[i].id);
      }

      // Try saving again
      const conversationsArray = Array.from(conversations.values());
      localStorage.setItem(this.storageKey, JSON.stringify(conversationsArray));
    } catch (error) {
      console.error('Failed to recover from storage error:', error);
      // As last resort, clear all data
      this.clearAllConversations();
    }
  }
}

// Export singleton instance
export const chatStorageService = new ChatStorageService();

// Auto-cleanup on page load (once per day)
const lastCleanupKey = 'chat_last_auto_cleanup';
const lastCleanup = localStorage.getItem(lastCleanupKey);
const now = new Date();
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

if (!lastCleanup || new Date(lastCleanup) < oneDayAgo) {
  // Run cleanup in the background
  setTimeout(() => {
    chatStorageService.cleanup();
    localStorage.setItem(lastCleanupKey, now.toISOString());
  }, 1000);
}