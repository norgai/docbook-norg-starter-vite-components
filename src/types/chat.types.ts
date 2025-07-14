// Chat interface types for AI-powered component modifications

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  type?: MessageType;
  metadata?: MessageMetadata;
  status?: MessageStatus;
}

export const MessageType = {
  TEXT: 'text',
  CODE: 'code',
  IMAGE: 'image',
  COMPONENT: 'component',
  ERROR: 'error',
  SYSTEM: 'system'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export const MessageStatus = {
  SENDING: 'sending',
  SENT: 'sent',
  RECEIVED: 'received',
  ERROR: 'error',
  PROCESSING: 'processing'
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

export interface MessageMetadata {
  componentId?: string;
  requestType?: 'styling' | 'functionality' | 'structure' | 'props';
  changes?: ComponentChangePreview[];
  imageUrl?: string;
  codeLanguage?: string;
  errorDetails?: string;
  codeChanges?: any[];
  n8nResponse?: boolean;
}

export interface ComponentChangePreview {
  file: string;
  before: string;
  after: string;
  description: string;
}

export interface ChatConversation {
  id: string;
  componentId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  status: ConversationStatus;
}

export const ConversationStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
} as const;

export type ConversationStatus = typeof ConversationStatus[keyof typeof ConversationStatus];

export interface ChatState {
  conversations: Map<string, ChatConversation>;
  activeConversationId: string | null;
  isTyping: boolean;
  isConnected: boolean;
  unreadCount: number;
}

export interface ChatInputState {
  text: string;
  isComposing: boolean;
  attachments: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  file: File;
  type: 'image' | 'document';
  preview?: string;
  uploadStatus: 'pending' | 'uploading' | 'complete' | 'error';
  progress?: number;
}

// API types
export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  attachments?: string[];
  metadata?: Partial<MessageMetadata>;
}

export interface SendMessageResponse {
  message: ChatMessage;
  conversationId: string;
  success: boolean;
  error?: string;
}

export interface ChatSettings {
  autoSave: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  maxHistoryLength: number;
  theme: 'light' | 'dark' | 'auto';
}