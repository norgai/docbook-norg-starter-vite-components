import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage, FileAttachment } from '../types/chat.types';
import { MessageType, MessageStatus } from '../types/chat.types';
import { useChatHistory } from './useChatHistory';
import { n8nService } from '../services/n8nService';
import type { N8NChatRequest } from '../services/n8nService';
import { concurrentRequestManager } from '../services/concurrentRequestManager';
// import { websocketService } from '../services/websocketService';

interface ChatFlowState {
  isTyping: boolean;
  isConnected: boolean;
  error: string | null;
  retryCount: number;
  lastMessageTime: number;
}

export function useChatFlow(componentId: string) {
  const {
    activeConversation,
    addMessage,
    updateMessage,
    getOrCreateConversation
  } = useChatHistory(componentId);
  console.log("🚀 ~ useChatFlow ~ componentId:", componentId)
  console.log("🚀 ~ useChatFlow.ts:25 ~ useChatFlow ~ activeConversation:", activeConversation)

  const [flowState, setFlowState] = useState<ChatFlowState>({
    isTyping: false,
    isConnected: true,
    error: null,
    retryCount: 0,
    lastMessageTime: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Initialize conversation
  useEffect(() => {
    if (componentId && !activeConversation) {
      getOrCreateConversation(componentId);
    }
  }, [componentId, activeConversation, getOrCreateConversation]);

  // Send message with full flow management
  const sendMessage = useCallback(async (
    content: string, 
    attachments?: FileAttachment[],
    messageType: MessageType = MessageType.TEXT
  ) => {
    if (!activeConversation) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
      type: messageType,
      status: MessageStatus.SENDING,
      metadata: attachments ? { requestType: detectRequestType(content) } : undefined
    };

    // Add user message immediately
    addMessage(activeConversation.id, userMessage);

    // Update flow state
    setFlowState(prev => ({
      ...prev,
      isTyping: false,
      error: null,
      lastMessageTime: Date.now()
    }));

    try {
      // Update message status to sent
      updateMessage(activeConversation.id, userMessage.id, { 
        status: MessageStatus.SENT 
      });

      // Start typing indicator
      setFlowState(prev => ({ ...prev, isTyping: true }));

      // Emit progress update
      window.dispatchEvent(new CustomEvent('progress-update', {
        detail: {
          type: 'progress',
          stage: 'Sending Request',
          progress: 10,
          message: 'Preparing your request...',
          data: { conversationId: activeConversation.id, messageId: userMessage.id }
        }
      }));

      // Process the message via concurrent request manager
      const n8nRequest: N8NChatRequest = {
        componentId: activeConversation.componentId,
        conversationId: activeConversation.id,
        message: content,
        messageType,
        metadata: {
          framework: 'react',
          language: 'typescript'
        }
      };

      // Queue the request with high priority
      const requestId = concurrentRequestManager.enqueue(
        'chat',
        n8nRequest,
        {
          priority: 'high',
          timeout: 45000,
          id: `chat_${userMessage.id}`
        }
      );

      // Listen for request progress
      const handleRequestProgress = (data: any) => {
        if (data.request.id === requestId) {
          const progressValue = data.request.status === 'processing' ? 50 :
                               data.request.status === 'completed' ? 90 : 30;
          
          window.dispatchEvent(new CustomEvent('progress-update', {
            detail: {
              type: 'progress',
              stage: data.request.status === 'processing' ? 'Processing with AI' : 'Sending Request',
              progress: progressValue,
              message: data.request.status === 'processing' ? 'AI is analyzing your request...' : 'Waiting in queue...',
              data: { conversationId: activeConversation.id, messageId: userMessage.id }
            }
          }));
        }
      };

      concurrentRequestManager.on('started', handleRequestProgress);
      concurrentRequestManager.on('completed', handleRequestProgress);

      // Wait for completion
      const response = await new Promise<any>((resolve, reject) => {
        const checkCompletion = () => {
          const request = concurrentRequestManager.getRequest(requestId);
          if (request?.status === 'completed') {
            resolve(request.result);
          } else if (request?.status === 'failed') {
            reject(new Error(request.error || 'Request failed'));
          } else if (request?.status === 'cancelled') {
            reject(new Error('Request cancelled'));
          } else {
            setTimeout(checkCompletion, 100);
          }
        };
        checkCompletion();
      });

      // Clean up listeners
      concurrentRequestManager.off('started', handleRequestProgress);
      concurrentRequestManager.off('completed', handleRequestProgress);

      // Create AI response message
      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        type: response.type,
        status: MessageStatus.RECEIVED,
        metadata: {
          codeChanges: response.codeChanges,
          n8nResponse: true
        }
      };

      // Add AI response
      addMessage(activeConversation.id, aiMessage);

      // Update message status to received
      updateMessage(activeConversation.id, userMessage.id, { 
        status: MessageStatus.RECEIVED 
      });

      // Reset retry count on success
      setFlowState(prev => ({ 
        ...prev, 
        isTyping: false, 
        retryCount: 0,
        error: null 
      }));

    } catch (error: any) {
      console.error('Chat flow error:', error);

      if (error.name === 'AbortError') {
        // Request was cancelled
        updateMessage(activeConversation.id, userMessage.id, { 
          status: MessageStatus.ERROR 
        });
        return;
      }

      // Handle different types of errors
      const errorMessage = getErrorMessage(error);
      
      setFlowState(prev => ({ 
        ...prev, 
        isTyping: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1
      }));

      // Update user message status to error
      updateMessage(activeConversation.id, userMessage.id, { 
        status: MessageStatus.ERROR 
      });

      // Add error message from AI
      const errorAIMessage: ChatMessage = {
        id: generateMessageId(),
        content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        type: MessageType.ERROR,
        status: MessageStatus.RECEIVED,
        metadata: { errorDetails: error.message }
      };

      addMessage(activeConversation.id, errorAIMessage);

      // Attempt automatic retry for network errors
      if (shouldRetry(error, flowState.retryCount)) {
        setTimeout(() => {
          sendMessage(content, attachments, messageType);
        }, getRetryDelay(flowState.retryCount));
      }
    }
  }, [activeConversation, addMessage, updateMessage, flowState.retryCount]);

  // Retry last message
  const retryLastMessage = useCallback(() => {
    if (!activeConversation || !activeConversation.messages.length) return;

    const lastUserMessage = [...activeConversation.messages]
      .reverse()
      .find(msg => msg.role === 'user');

    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, undefined, lastUserMessage.type);
    }
  }, [activeConversation, sendMessage]);

  // Clear error state
  const clearError = useCallback(() => {
    setFlowState(prev => ({ ...prev, error: null, retryCount: 0 }));
  }, []);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setFlowState(prev => ({ ...prev, isTyping: false }));
    }
  }, []);

  // Monitor N8N connection status
  useEffect(() => {
    const checkConnection = async () => {
      const isOnline = navigator.onLine;
      const n8nConnected = isOnline ? await checkN8NConnection() : false;
      
      setFlowState(prev => ({ 
        ...prev, 
        isConnected: isOnline && n8nConnected 
      }));
    };

    // Check immediately
    checkConnection();
    console.count('🚀 ~ checkConnection');

    // Set up periodic checks
    // const connectionInterval = setInterval(checkConnection, 30000); // Check every 30 seconds

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      // clearInterval(connectionInterval);
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    conversation: activeConversation,
    sendMessage,
    retryLastMessage,
    cancelRequest,
    clearError,
    isTyping: flowState.isTyping,
    isConnected: flowState.isConnected,
    error: flowState.error,
    canRetry: flowState.retryCount < 3
  };
}

// Helper functions
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function detectRequestType(content: string): 'styling' | 'functionality' | 'structure' | 'props' {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('color') || lowerContent.includes('style') || lowerContent.includes('css')) {
    return 'styling';
  }
  if (lowerContent.includes('click') || lowerContent.includes('function') || lowerContent.includes('event')) {
    return 'functionality';
  }
  if (lowerContent.includes('layout') || lowerContent.includes('structure') || lowerContent.includes('html')) {
    return 'structure';
  }
  return 'props';
}

// Connection monitoring for N8N service
async function checkN8NConnection(): Promise<boolean> {
  try {
    return await n8nService.testConnection();
  } catch (error) {
    console.warn('N8N connection check failed:', error);
    return false;
  }
}

function getErrorMessage(error: any): string {
  if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
    return 'Network connection error';
  }
  if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
    return 'Request timed out';
  }
  if (error.status === 429) {
    return 'Too many requests. Please wait a moment.';
  }
  if (error.status >= 500) {
    return 'Server error. Please try again.';
  }
  return error.message || 'An unexpected error occurred';
}

function shouldRetry(error: any, retryCount: number): boolean {
  if (retryCount >= 3) return false;
  
  // Retry on network errors and timeouts
  if (error.name === 'NetworkError' || error.name === 'TimeoutError') {
    return true;
  }
  
  // Retry on 5xx server errors
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  return false;
}

function getRetryDelay(retryCount: number): number {
  // Exponential backoff: 1s, 2s, 4s
  return Math.min(1000 * Math.pow(2, retryCount), 4000);
}