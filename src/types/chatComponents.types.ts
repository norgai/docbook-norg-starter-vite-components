// Component prop types for chat interface

import type { 
  ChatMessage, 
  ChatConversation, 
  FileAttachment
} from './chat.types';
import { 
  MessageType,
  type ChatSettings
} from './chat.types';

// Main chat interface props
export interface ChatInterfaceProps {
  componentId?: string;
  conversationId?: string;
  initialMessages?: ChatMessage[];
  onSendMessage?: (content: string, attachments?: FileAttachment[]) => Promise<void>;
  onMessageUpdate?: (messageId: string, updates: Partial<ChatMessage>) => void;
  onConversationChange?: (conversation: ChatConversation) => void;
  isConnected?: boolean;
  disabled?: boolean;
  height?: string | number;
  maxHeight?: string | number;
  allowAttachments?: boolean;
  allowVoice?: boolean;
  showTypingIndicator?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  style?: React.CSSProperties;
}

// Message bubble component props
export interface MessageBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  avatarUrl?: string;
  onRetry?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Chat input component props
export interface ChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend: (content: string, attachments?: FileAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  allowAttachments?: boolean;
  allowVoice?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  isTyping?: boolean;
  suggestions?: string[];
  shortcuts?: ChatShortcut[];
  onTyping?: (isTyping: boolean) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

// Message list component props
export interface MessageListProps {
  messages: ChatMessage[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onMessageAction?: (messageId: string, action: MessageAction) => void;
  showTimestamps?: boolean;
  showAvatars?: boolean;
  groupByDate?: boolean;
  virtualizeList?: boolean;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

// Conversation sidebar props
export interface ConversationSidebarProps {
  conversations: ChatConversation[];
  activeConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onConversationCreate: (componentId: string) => void;
  onConversationDelete: (conversationId: string) => void;
  onConversationRename: (conversationId: string, newTitle: string) => void;
  loading?: boolean;
  showSearch?: boolean;
  groupByComponent?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// File attachment preview props
export interface AttachmentPreviewProps {
  attachment: FileAttachment;
  onRemove?: (attachmentId: string) => void;
  onReplace?: (attachmentId: string, newFile: File) => void;
  showProgress?: boolean;
  editable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Typing indicator props
export interface TypingIndicatorProps {
  isVisible: boolean;
  users?: TypingUser[];
  position?: 'inline' | 'floating';
  className?: string;
  style?: React.CSSProperties;
}

// Chat header props
export interface ChatHeaderProps {
  conversation?: ChatConversation;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  onClear?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  onMinimize?: () => void;
  onClose?: () => void;
  showActions?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Quick actions/suggestions props
export interface QuickActionsProps {
  suggestions: QuickAction[];
  onActionSelect: (action: QuickAction) => void;
  maxVisible?: number;
  showIcons?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Message composer props (advanced input)
export interface MessageComposerProps {
  onSend: (content: string, options: ComposerOptions) => void;
  supportedTypes: MessageType[];
  templates?: MessageTemplate[];
  mentions?: MentionOption[];
  emojis?: EmojiOption[];
  onDraft?: (content: string) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Supporting types
export interface ChatShortcut {
  key: string;
  description: string;
  action: () => void;
}

export interface MessageAction {
  type: 'retry' | 'edit' | 'delete' | 'copy' | 'react' | 'reply' | 'forward';
  payload?: any;
}

export interface TypingUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  prompt: string;
  category?: string;
  priority?: number;
}

export interface ComposerOptions {
  type: MessageType;
  priority?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
  attachments?: FileAttachment[];
  mentions?: string[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables?: TemplateVariable[];
  category?: string;
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'select' | 'number';
  required: boolean;
  options?: string[];
  defaultValue?: any;
}

export interface MentionOption {
  id: string;
  name: string;
  type: 'user' | 'component' | 'variable';
  avatar?: string;
  description?: string;
}

export interface EmojiOption {
  id: string;
  emoji: string;
  name: string;
  category: string;
  keywords: string[];
}

// Event handler types
export type MessageEventHandler = (message: ChatMessage, event: MessageEvent) => void;
export type ConversationEventHandler = (conversation: ChatConversation, event: ConversationEvent) => void;
export type FileUploadHandler = (files: File[]) => Promise<FileAttachment[]>;
export type ErrorHandler = (error: Error, context?: string) => void;

export interface MessageEvent {
  type: 'sent' | 'received' | 'updated' | 'deleted' | 'reaction';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ConversationEvent {
  type: 'created' | 'updated' | 'deleted' | 'archived';
  timestamp: string;
  metadata?: Record<string, any>;
}

// Hook return types
export interface UseChatReturn {
  conversation: ChatConversation | null;
  sendMessage: (content: string, attachments?: FileAttachment[]) => Promise<void>;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (messageId: string) => void;
  retryMessage: (messageId: string) => void;
  clearConversation: () => void;
  isTyping: boolean;
  isConnected: boolean;
  error: string | null;
  loading: boolean;
}

export interface UseChatHistoryReturn {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  createConversation: (componentId: string, title?: string) => ChatConversation;
  deleteConversation: (conversationId: string) => void;
  archiveConversation: (conversationId: string) => void;
  searchConversations: (query: string) => ChatConversation[];
  loading: boolean;
  error: string | null;
}

export interface UseChatFlowReturn {
  sendMessage: (content: string, type?: MessageType) => Promise<void>;
  cancelRequest: () => void;
  retryLastMessage: () => void;
  clearError: () => void;
  isTyping: boolean;
  isConnected: boolean;
  error: string | null;
  canRetry: boolean;
}

// Context types
export interface ChatContextValue {
  conversations: Map<string, ChatConversation>;
  activeConversationId: string | null;
  settings: ChatSettings;
  createConversation: (componentId: string) => ChatConversation;
  selectConversation: (conversationId: string) => void;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  isConnected: boolean;
  error: string | null;
}

export interface ChatProviderProps {
  children: React.ReactNode;
  apiUrl?: string;
  websocketUrl?: string;
  apiKey?: string;
  defaultSettings?: Partial<ChatSettings>;
  onError?: ErrorHandler;
}

// Theme types
export interface ChatTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  fonts: {
    body: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Accessibility types
export interface ChatA11yProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

// Performance optimization types
export interface VirtualizationConfig {
  enabled: boolean;
  itemHeight: number;
  overscan: number;
  windowSize: number;
}

export interface OptimizationSettings {
  virtualization: VirtualizationConfig;
  debounceMs: number;
  maxCachedMessages: number;
  lazyLoadImages: boolean;
  compressAttachments: boolean;
}