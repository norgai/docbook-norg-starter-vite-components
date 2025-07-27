import { useState, useEffect, useRef } from 'react';
import type { ChatMessage, FileAttachment, QueueItem } from '../../types/chat.types';
import { MessageType, MessageStatus } from '../../types/chat.types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { n8nService } from '../../services/n8nService';

interface ChatInterfaceProps {
  componentId?: string;
  onSendMessage?: (content: string, attachments?: FileAttachment[]) => Promise<void>;
  initialMessages?: ChatMessage[];
  isConnected?: boolean;
  disabled?: boolean;
  height?: string;
  className?: string;
}

export function ChatInterface({
  componentId,
  onSendMessage,
  initialMessages = [],
  isConnected = true,
  disabled = false,
  height = "400px",
  className = ""
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [queueItems, setQueueItems] = useState<Map<number, QueueItem>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
      type: MessageType.TEXT,
      status: MessageStatus.SENDING
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);

    try {
      // Update message status to sent
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: MessageStatus.SENT }
            : msg
        )
      );

      // Show typing indicator
      setIsTyping(true);

      if (onSendMessage) {
        // Use custom handler if provided
        await onSendMessage(content, attachments);
      } else if (componentId) {
        // Use N8N queue system for component modification
        const conversationId = n8nService.generateConversationId(componentId);
        
        const response = await n8nService.sendChatMessage({
          componentId,
          conversationId,
          message: content,
          messageType: MessageType.TEXT,
          metadata: {
            framework: 'react',
            language: 'typescript'
          }
        });

        if (response.success && response.queueId) {
          // Add queue status message
          const queueMessage: ChatMessage = {
            id: generateMessageId(),
            content: response.content,
            role: 'assistant',
            timestamp: new Date().toISOString(),
            type: response.type,
            status: MessageStatus.RECEIVED,
            metadata: {
              componentId,
              queueId: response.queueId
            }
          };

          setMessages(prev => [...prev, queueMessage]);

          // Store queue item for potential polling
          if (response.queueId) {
            setQueueItems(prev => {
              const newMap = new Map(prev.set(response.queueId!, {
                id: response.queueId!,
                componentId,
                conversationId,
                message: content,
                messageType: MessageType.TEXT,
                status: 'pending',
                priority: 5,
                createdAt: new Date().toISOString(),
                retryCount: 0,
                metadata: {}
              }));
              
              // Log for debugging - could be used for queue polling in the future
              console.log(`Queue item stored for polling:`, Array.from(newMap.keys()));
              return newMap;
            });
          }
        } else {
          throw new Error(response.error || 'Failed to enqueue request');
        }
      } else {
        // Fallback to simulation
        await simulateAIResponse(content);
      }
    } catch (error) {
      // Update message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: MessageStatus.ERROR }
            : msg
        )
      );

      // Add error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addAIMessage(
        `I apologize, but I'm having trouble processing your request: ${errorMessage}`,
        MessageType.ERROR
      );
    } finally {
      setIsTyping(false);
    }
  };

  const simulateAIResponse = async (userMessage: string): Promise<void> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    let response = "I understand you'd like to make changes to the component. ";
    
    if (userMessage.toLowerCase().includes('color') || userMessage.toLowerCase().includes('style')) {
      response += "I can help you modify the styling. What specific color changes would you like me to make?";
    } else if (userMessage.toLowerCase().includes('function') || userMessage.toLowerCase().includes('click')) {
      response += "I can help you add or modify functionality. What kind of interaction would you like to implement?";
    } else if (userMessage.toLowerCase().includes('text') || userMessage.toLowerCase().includes('content')) {
      response += "I can help you update the text content. What would you like the new text to say?";
    } else {
      response += "Could you provide more details about what you'd like me to change? For example, styling, functionality, or content?";
    }

    addAIMessage(response);
  };

  const addAIMessage = (content: string, type: MessageType = MessageType.TEXT) => {
    const aiMessage: ChatMessage = {
      id: generateMessageId(),
      content,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      type,
      status: MessageStatus.RECEIVED
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const welcomeMessage = componentId && messages.length === 0 ? {
    id: 'welcome',
    content: `Hi! I'm here to help you modify the ${componentId} component. You can ask me to change styling, add functionality, or update content. What would you like to do?`,
    role: 'assistant' as const,
    timestamp: new Date().toISOString(),
    type: MessageType.SYSTEM,
    status: MessageStatus.RECEIVED
  } : null;

  const allMessages = welcomeMessage ? [welcomeMessage, ...messages] : messages;
  // console.log("🚀 ~ ChatInterface.tsx:201 ~ ChatInterface ~ allMessages:", allMessages)

  return (
    <div className={`flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <h3 className="font-semibold text-gray-900">
              {componentId ? `Chat with ${componentId}` : 'AI Assistant'}
            </h3>
            <span className="text-xs text-gray-500">
              {isConnected ? '• N8N Connected' : '• N8N Disconnected'}
              {queueItems.size > 0 && ` • ${queueItems.size} queued`}
            </span>
          </div>
          {isTyping && (
            <div className="text-sm text-gray-500">AI is typing...</div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMessages([])}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Clear chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={containerRef}
        className="overflow-y-auto p-4 space-y-4"
        style={{ height, maxHeight: height }}
      >
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">Start a conversation with the AI assistant</p>
            </div>
          </div>
        ) : (
          <>
            {allMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={index === allMessages.length - 1}
                showTimestamp={true}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        // disabled={disabled || !isConnected}
        // placeholder={
        //   !isConnected 
        //     ? "Disconnected - trying to reconnect..." 
        //     : disabled 
        //     ? "Chat is disabled"
        //     : "Ask me to modify this component..."
        // }
        isTyping={isTyping}
        allowAttachments={true}
      />
    </div>
  );
}