// Main types export file

// Component types
export * from './component.types';

// Chat types - export specific types to avoid conflicts
export type {
  ChatMessage,
  MessageMetadata,
  ComponentChangePreview,
  ChatConversation,
  ChatState,
  ChatInputState,
  FileAttachment
} from './chat.types';

export { 
  MessageType,
  MessageStatus,
  ConversationStatus
} from './chat.types';
export type { ChatSettings as ChatSettingsBase } from './chat.types';

// Chat API types - rename conflicting exports
export type {
  ChatApiConfig,
  WebSocketMessage,
  WebSocketConfig,
  StartChatRequest,
  StartChatResponse,
  SendMessageRequest as ApiSendMessageRequest,
  SendMessageResponse as ApiSendMessageResponse,
  GetMessageResponse,
  GetConversationResponse,
  ComponentContext,
  ComponentChange,
  RequestMetadata,
  ResponseMetadata,
  CodeChange,
  ResourceLink,
  AttachmentUpload,
  UploadResponse,
  ProcessedFileData,
  ImageAnalysis,
  DetectedComponent,
  BoundingBox,
  LayoutDescription,
  CodeAnalysis,
  CodeIssue,
  DesignToken,
  BrowserInfo,
  ViewportInfo,
  ApiError,
  ValidationError,
  PaginationParams,
  PaginatedResponse,
  ConversationFilters,
  TypingIndicator,
  ConnectionStatus,
  ChatAnalytics,
  AnalyticsEvent,
  UserPreferences,
  KeyboardShortcut,
  CustomPrompt,
  PromptVariable
} from './chatApi.types';

export type {
  ChatSettings as ApiChatSettings
} from './chatApi.types';

// Chat component types
export * from './chatComponents.types';

// Version types
export * from './version.types';