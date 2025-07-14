import { useState, useEffect, useCallback } from 'react';
import type { ChatConversation, ChatMessage } from '../types/chat.types';
import { chatStorageService } from '../services/chatStorage.service';

export function useChatHistory(componentId?: string) {
  const [conversations, setConversations] = useState<Map<string, ChatConversation>>(new Map());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = () => {
      const allConversations = chatStorageService.loadConversations();
      setConversations(allConversations);
      setLoading(false);
    };

    loadConversations();
  }, []);

  // Get active conversation
  const activeConversation = activeConversationId 
    ? conversations.get(activeConversationId) 
    : null;

  // Get conversations for current component
  const componentConversations = componentId 
    ? Array.from(conversations.values()).filter(conv => conv.componentId === componentId)
    : Array.from(conversations.values());

  // Create new conversation
  const createConversation = useCallback((compId: string, title?: string) => {
    const newConversation = chatStorageService.createConversation(compId, title);
    setConversations(prev => new Map(prev).set(newConversation.id, newConversation));
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, []);

  // Add message to conversation
  const addMessage = useCallback((conversationId: string, message: ChatMessage) => {
    const updatedConversation = chatStorageService.addMessage(conversationId, message);
    if (updatedConversation) {
      setConversations(prev => new Map(prev).set(conversationId, updatedConversation));
    }
    return updatedConversation;
  }, []);

  // Update message in conversation
  const updateMessage = useCallback((conversationId: string, messageId: string, updates: Partial<ChatMessage>) => {
    const updatedConversation = chatStorageService.updateMessage(conversationId, messageId, updates);
    if (updatedConversation) {
      setConversations(prev => new Map(prev).set(conversationId, updatedConversation));
    }
    return updatedConversation;
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((conversationId: string) => {
    chatStorageService.deleteConversation(conversationId);
    setConversations(prev => {
      const newMap = new Map(prev);
      newMap.delete(conversationId);
      return newMap;
    });
    
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  }, [activeConversationId]);

  // Clear all conversations
  const clearAllConversations = useCallback(() => {
    chatStorageService.clearAllConversations();
    setConversations(new Map());
    setActiveConversationId(null);
  }, []);

  // Get or create conversation for component
  const getOrCreateConversation = useCallback((compId: string) => {
    // Look for existing active conversation for this component
    const existing = componentConversations.find(conv => 
      conv.componentId === compId && conv.status === 'active'
    );
    
    if (existing) {
      setActiveConversationId(existing.id);
      return existing;
    }
    
    // Create new conversation
    return createConversation(compId);
  }, [componentConversations, createConversation]);

  // Export conversations
  const exportConversations = useCallback(() => {
    return chatStorageService.exportConversations();
  }, []);

  // Import conversations
  const importConversations = useCallback((jsonData: string) => {
    const importedCount = chatStorageService.importConversations(jsonData);
    const allConversations = chatStorageService.loadConversations();
    setConversations(allConversations);
    return importedCount;
  }, []);

  // Get storage statistics
  const getStorageStats = useCallback(() => {
    return chatStorageService.getStorageStats();
  }, []);

  return {
    conversations: componentConversations,
    activeConversation,
    activeConversationId,
    loading,
    setActiveConversationId,
    createConversation,
    addMessage,
    updateMessage,
    deleteConversation,
    clearAllConversations,
    getOrCreateConversation,
    exportConversations,
    importConversations,
    getStorageStats
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

  const addMessage = useCallback((message: ChatMessage) => {
    if (!conversationId) return null;
    
    const updatedConversation = chatStorageService.addMessage(conversationId, message);
    if (updatedConversation) {
      setConversation(updatedConversation);
    }
    return updatedConversation;
  }, [conversationId]);

  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    if (!conversationId) return null;
    
    const updatedConversation = chatStorageService.updateMessage(conversationId, messageId, updates);
    if (updatedConversation) {
      setConversation(updatedConversation);
    }
    return updatedConversation;
  }, [conversationId]);

  return {
    conversation,
    loading,
    addMessage,
    updateMessage
  };
}