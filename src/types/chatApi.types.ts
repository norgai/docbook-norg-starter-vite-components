// API types for chat functionality

export interface ChatApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  apiKey?: string;
}

// WebSocket API types
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'status' | 'error' | 'connection';
  payload: any;
  timestamp: string;
  id: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
}

// Chat API Request/Response types
export interface StartChatRequest {
  componentId: string;
  conversationId?: string;
  initialMessage?: string;
  context?: ComponentContext;
}

export interface StartChatResponse {
  conversationId: string;
  success: boolean;
  websocketUrl?: string;
  error?: ApiError;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type: 'text' | 'code' | 'image';
  attachments?: AttachmentUpload[];
  metadata?: RequestMetadata;
}

export interface SendMessageResponse {
  messageId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedProcessingTime?: number;
  error?: ApiError;
}

export interface GetMessageResponse {
  messageId: string;
  content: string;
  role: 'user' | 'assistant';
  type: 'text' | 'code' | 'image' | 'error';
  timestamp: string;
  status: 'sent' | 'received' | 'processing' | 'failed';
  metadata?: ResponseMetadata;
}

export interface GetConversationResponse {
  conversationId: string;
  componentId: string;
  title: string;
  messages: GetMessageResponse[];
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Component context for AI understanding
export interface ComponentContext {
  id: string;
  name: string;
  filePath: string;
  framework: 'react' | 'vue' | 'angular';
  language: 'typescript' | 'javascript';
  dependencies: string[];
  currentCode?: string;
  documentation?: string;
  recentChanges?: ComponentChange[];
}

export interface ComponentChange {
  timestamp: string;
  description: string;
  diff: string;
  author: string;
}

// Request metadata for context
export interface RequestMetadata {
  requestType: 'styling' | 'functionality' | 'structure' | 'props' | 'documentation';
  urgency: 'low' | 'medium' | 'high';
  affectedFiles?: string[];
  designTokens?: DesignToken[];
  browserInfo?: BrowserInfo;
}

export interface ResponseMetadata {
  processingTime: number;
  codeChanges?: CodeChange[];
  confidence: number;
  suggestedNext?: string[];
  resources?: ResourceLink[];
}

export interface CodeChange {
  file: string;
  before: string;
  after: string;
  line?: number;
  description: string;
  type: 'addition' | 'modification' | 'deletion';
}

export interface ResourceLink {
  title: string;
  url: string;
  type: 'documentation' | 'example' | 'reference';
}

// File upload types
export interface AttachmentUpload {
  file: File;
  type: 'image' | 'document' | 'code';
  purpose: 'reference' | 'mockup' | 'specification';
}

export interface UploadResponse {
  uploadId: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  processedData?: ProcessedFileData;
}

export interface ProcessedFileData {
  imageAnalysis?: ImageAnalysis;
  documentText?: string;
  codeAnalysis?: CodeAnalysis;
}

export interface ImageAnalysis {
  components: DetectedComponent[];
  colors: string[];
  layout: LayoutDescription;
  text: string[];
}

export interface DetectedComponent {
  type: string;
  bounds: BoundingBox;
  properties: Record<string, any>;
  confidence: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutDescription {
  type: 'grid' | 'flex' | 'absolute' | 'flow';
  direction?: 'row' | 'column';
  alignment?: string;
  spacing?: number;
}

export interface CodeAnalysis {
  language: string;
  framework?: string;
  components: string[];
  dependencies: string[];
  patterns: string[];
  issues: CodeIssue[];
}

export interface CodeIssue {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
}

// Design system integration
export interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'spacing' | 'typography' | 'shadow' | 'border';
  category?: string;
}

export interface BrowserInfo {
  userAgent: string;
  viewport: ViewportInfo;
  features: string[];
}

export interface ViewportInfo {
  width: number;
  height: number;
  pixelRatio: number;
}

// Error handling
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
  retryAfter?: number;
}

export interface ValidationError extends ApiError {
  field: string;
  constraint: string;
}

// Pagination and filtering
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ConversationFilters {
  componentId?: string;
  status?: ('active' | 'completed' | 'archived')[];
  dateFrom?: string;
  dateTo?: string;
  hasErrors?: boolean;
}

// Real-time updates
export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastSeen: string;
  reconnectAttempts: number;
  error?: string;
}

// Analytics and monitoring
export interface ChatAnalytics {
  conversationId: string;
  metrics: {
    messageCount: number;
    averageResponseTime: number;
    userSatisfaction?: number;
    errorsCount: number;
    successfulChanges: number;
  };
  events: AnalyticsEvent[];
}

export interface AnalyticsEvent {
  type: string;
  timestamp: string;
  data: Record<string, any>;
}

// Configuration and settings
export interface ChatSettings {
  autoSave: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  maxHistoryLength: number;
  retentionDays: number;
}

export interface UserPreferences {
  chatSettings: ChatSettings;
  shortcuts: KeyboardShortcut[];
  customPrompts: CustomPrompt[];
}

export interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
}

export interface CustomPrompt {
  id: string;
  name: string;
  template: string;
  category: string;
  variables: PromptVariable[];
}

export interface PromptVariable {
  name: string;
  type: 'text' | 'select' | 'number' | 'boolean';
  required: boolean;
  options?: string[];
  defaultValue?: any;
}