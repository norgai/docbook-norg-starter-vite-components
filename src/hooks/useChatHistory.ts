import { useState, useEffect, useCallback } from "react";
import { ConversationStatus, type ChatConversation, type ChatMessage } from "../types/chat.types";
import { chatStorageService } from "../services/chatStorage.service";
import { n8nService } from "../services/n8nService";
import dayjs from "dayjs";

export function useChatHistory(componentId: string) {
  console.log("🚀 ~ useChatHistory.ts:6 ~ useChatHistory ~ componentId:", componentId);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(true);

  // Create new conversation
  const createConversation = useCallback((compId: string, title?: string) => {
    const newConversation = chatStorageService.createConversation(compId, title);
    return newConversation;
  }, []);

  // Add message to conversation
  const addMessage = useCallback((conversationId: string, message: ChatMessage) => {
    const updatedConversation = chatStorageService.addMessage(conversationId, message);
    return updatedConversation;
  }, []);

  // Update message in conversation
  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<ChatMessage>) => {
    const updatedConversation = chatStorageService.updateMessage(conversationId, messageId, updates);
    return updatedConversation;
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((conversationId: string) => {
    chatStorageService.deleteConversation(conversationId);
  }, []);

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    chatStorageService.clearAllConversations();
  }, []);

  // Get or create conversation for component
  // const getOrCreateConversation = useCallback((compId: string) => {
  // }, [componentConversations, createConversation]);

  // Export conversations
  const exportConversations = useCallback(() => {
    return chatStorageService.exportConversations();
  }, []);

  // Import conversations
  const importConversations = useCallback((jsonData: string) => {
    const importedCount = chatStorageService.importConversations(jsonData);
    return importedCount;
  }, []);

  // Get storage statistics
  const getStorageStats = useCallback(() => {
    return chatStorageService.getStorageStats();
  }, []);

  /**
   * Sync existing conversation and its messages with API
   * 
   */
  const syncExistingConversation = useCallback(async (conversationId: string, compId: string): Promise<ChatConversation> => {
    try {
      // Get conversation by conversationId from API
      const apiConversation = await n8nService.getConversation(conversationId);
      
      // Check if record.status = active
      if (apiConversation.status === ConversationStatus.ACTIVE) {
        // Continue get messages -> after get message set to localStorage with conversationId
        const messages = await n8nService.getMessages(conversationId);
        
        // Update conversation with messages and sync timestamp
        const updatedConversation: ChatConversation = {
          ...apiConversation,
          messages,
          syncAt: new Date().toISOString()
        };
        
        // Save to localStorage
        chatStorageService.saveConversation(updatedConversation);
        return updatedConversation;
      }

      // Status is not active -> remove conversation from localStorage -> create new conversation
      chatStorageService.deleteConversation(conversationId);
      return chatStorageService.createConversation(compId);
    } catch (error) {
      console.error('Error syncing existing conversation:', error);
      chatStorageService.deleteConversation(conversationId);
      return chatStorageService.createConversation(compId);
    }
  }, []);

  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // Look for existing active conversation for this component
        const conversations = await chatStorageService.loadConversations();
        let conversation = Array.from(conversations.values()).find(
          (conversation) => conversation.componentId === componentId && conversation.status === ConversationStatus.ACTIVE
        );

        if (conversation) {
          const isDataExpired = dayjs(conversation?.syncAt).isBefore(dayjs().subtract(15, 'minute'));
          if (isDataExpired) {
            // Background sync with API
            conversation = await syncExistingConversation(conversation.id, componentId);
          }
          setConversation(conversation);
          return;
        }
        const apiConversations = await n8nService.getConversations(componentId);
        
        // Sort by createdAt desc and filter active conversations
        const activeConversations = apiConversations
          .filter(record => record.status === ConversationStatus.ACTIVE)
          .sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            return timeB - timeA; // desc order
          });
        
        if (activeConversations.length > 0) {
          // Found active conversation from API
          const foundConversation = activeConversations[0];
          
          // Get messages for this conversation
          const messages = await n8nService.getMessages(foundConversation.id);
          
          // Update conversation with messages and sync timestamp
          const updatedConversation: ChatConversation = {
            ...foundConversation,
            messages,
            syncAt: new Date().toISOString()
          };
          
          // Save to localStorage
          chatStorageService.saveConversation(updatedConversation);
          setConversation(updatedConversation);
          return;
        }
        const newConversation = chatStorageService.createConversation(componentId);
        setConversation(newConversation);
      } finally {
        setLoading(false);
      }
    };

    initializeConversation();
  }, [componentId, createConversation, syncExistingConversation]);

  return {
    conversation,
    loading,
    createConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    clearAllConversations,
    exportConversations,
    importConversations,
    getStorageStats,
  };
}

// Hook for managing a single conversation
export function useConversation(conversationId: string | null) {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      setLoading(false);
      return;
    }

    const loadConversation = () => {
      const conv = chatStorageService.loadConversation(conversationId);
      setConversation(conv);
      setLoading(false);
    };

    loadConversation();
  }, [conversationId]);

  const addMessage = useCallback(
    (message: ChatMessage) => {
      if (!conversationId) return null;

      const updatedConversation = chatStorageService.addMessage(conversationId, message);
      if (updatedConversation) {
        setConversation(updatedConversation);
      }
      return updatedConversation;
    },
    [conversationId]
  );

  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>) => {
      if (!conversationId) return null;

      const updatedConversation = chatStorageService.updateMessage(conversationId, messageId, updates);
      if (updatedConversation) {
        setConversation(updatedConversation);
      }
      return updatedConversation;
    },
    [conversationId]
  );

  return {
    conversation,
    loading,
    addMessage,
    updateMessage,
  };
}
