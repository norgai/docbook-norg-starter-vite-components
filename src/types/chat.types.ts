// Chat interface types for AI-powered component modifications
export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

export type MessageRole = typeof MessageRole[keyof typeof MessageRole];

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  role: MessageRole;
  type: MessageType;
  metadata?: MessageMetadata;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  queue?: QueueItem;
  attachment?: FileAttachment;
}

export type ChatMessageRequest = Omit<ChatMessage, 'createdAt' | 'updatedAt'>

export const MessageType = {
  TEXT: 'text',
  CODE: 'code',
  IMAGE: 'image',
  COMPONENT: 'component',
  ERROR: 'error',
  SYSTEM: 'system',
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
  codeChanges?: ComponentChangePreview[];
  n8nResponse?: boolean;
  prUrl?: string;
  queueId?: number;
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
  syncAt?: string;
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

// N8N Queue Integration Types
export const QueueStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type QueueStatus = typeof QueueStatus[keyof typeof QueueStatus];

export interface QueueItem {
  id: string;
  componentId: string;
  conversationId: string;
  messageId: string;
  message: string;
  messageType: MessageType;
  status: QueueStatus;
  priority: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  prUrl?: string;
  branchName?: string;
  errorMessage?: string;
  retryCount: number;
  metadata: Record<string, unknown>;
}

export interface EnqueueRequest {
  id: string;
  componentId: string;
  conversationId: string;
  messageId: string;
  message: string;
  messageType?: MessageType;
  priority?: number;
  metadata?: Record<string, unknown>;
}

export interface N8NResponse<T = unknown> {
  success: boolean;
  operation: string;
  message?: string;
  data?: T;
}