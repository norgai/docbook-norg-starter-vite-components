import { useState, useEffect, useCallback } from 'react';
import type { ChatConversation, ChatMessage } from '../types/chat.types';
import { chatStorageService } from '../services/chatStorage.service';
import { n8nService } from '../services/n8nService';

export function useChatHistory(componentId: string) {
  console.log("🚀 ~ useChatHistory.ts:6 ~ useChatHistory ~ componentId:", componentId)
  const [conversations, setConversations] = useState<Map<string, ChatConversation>>(new Map());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load conversations on mount and sync with API by componentId
  useEffect(() => {
    const loadConversations = () => {
      const allConversations = chatStorageService.loadConversations();
      console.log("🚀 ~ useChatHistory.ts:15 ~ loadConversations ~ allConversations:", allConversations)
      setConversations(allConversations);
    };

    const syncFromAPI = async () => {
      console.log('🚷 syncFromAPI called with componentId:', componentId);
      
      if (!componentId) {
        console.log('🚫 No componentId, skipping sync');
        return;
      }
      
      console.log('📞 Starting API sync for componentId:', componentId);
      
      try {
        console.log('🔄 Syncing conversations from API for component:', componentId);
        
        // Get active conversations from API
        const apiConversations = await n8nService.getConversations(componentId);
        console.log('📦 Raw API response:', apiConversations);
        console.log('📦 API response type:', typeof apiConversations, Array.isArray(apiConversations));
        
        // Ensure apiConversations is an array
        const conversationArray = Array.isArray(apiConversations) ? apiConversations : [];
        console.log('📦 Conversation array:', conversationArray);
        
        const activeConvs = conversationArray
          .filter(c => c.status === 'active')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        if (activeConvs.length === 0) {
          // No conversation in API -> create new one
          console.log('📝 No active conversations found, creating new one');
          const newConv = await n8nService.createConversation(componentId);
          chatStorageService.syncConversationsFromAPI([newConv]);
        } else {
          // Sync conversations to localStorage
          console.log(`📥 Syncing ${activeConvs.length} conversations from API`);
          chatStorageService.syncConversationsFromAPI(activeConvs);
          
          // Get messages for first conversation (newest)
          const newestConv = activeConvs[0];
          console.log('📨 Loading messages for conversation:', newestConv.id);
          const messages = await n8nService.getMessages(newestConv.id);
          chatStorageService.syncMessagesFromAPI(newestConv.id, messages);
        }
        
        // Reload conversations to update UI with synced data
        const updatedConversations = chatStorageService.loadConversations();
        setConversations(updatedConversations);
        console.log('✅ API sync completed');
        
      } catch (error) {
        console.error('❌ API sync failed:', error);
        // Continue with localStorage data
      } finally {}
    };
    
    // Load localStorage first (immediate)
    loadConversations();
  }, [componentId]);

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
      console.log('🔄 Found existing conversation:', existing.id);
      setActiveConversationId(existing.id);
      return existing;
    }
    
    // Create new conversation only if sync is completed
    console.log('🆕 Creating new conversation for:', compId);
    return createConversation(compId);
  }, [componentId, componentConversations, createConversation]);

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