// N8N Queue Integration Service - Updated for Queue System
import { v4 as uuidV4 } from "uuid";
import type {
  ChatConversation,
  ChatMessage,
  ChatMessageRequest,
  EnqueueRequest,
  MessageRole,
  N8NResponse,
  QueueItem,
} from "../types/chat.types";
import { MessageStatus, MessageType } from "../types/chat.types";
import { ApiChatbotAction } from "../types/chatApi.types";

export interface N8NWebhookConfig {
  baseUrl: string;
  webhookPath: string;
  timeout?: number;
}

export interface N8NChatRequest {
  componentId: string;
  conversationId: string;
  message: string;
  messageType: MessageType;
  attachments?: File[];
  metadata?: {
    framework: "react";
    language: "typescript";
    currentCode?: string;
  };
}

export interface N8NChatResponse {
  success: boolean;
  content: string;
  type: MessageType;
  queueId?: number;
  queueItem?: QueueItem;
  codeChanges?: {
    file: string;
    content: string;
    description: string;
  }[];
  error?: string;
}

class N8NService {
  private config: N8NWebhookConfig;

  constructor(config: N8NWebhookConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Get queue item by ID
   */
  async getQueueItem(queueId: string): Promise<N8NResponse<QueueItem>> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.QUEUE_GET_ITEM,
      queueId: queueId,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;

    const response = await this.makeRequest<N8NResponse<QueueItem>>(url, {});
    return response;
  }

  /**
   * Get all queue items for a component
   */
  async getQueueByComponentId(componentId: string): Promise<N8NResponse<QueueItem[]>> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.QUEUE_GET_BY_COMPONENT_ID,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;

    const payload = {
      componentId: componentId,
    };

    const response = await this.makeRequest<N8NResponse<QueueItem[]>>(url, payload);
    return response;
  }

  /**
   * Get conversations from API
   */
  async getConversations(componentId?: string): Promise<ChatConversation[]> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.CONVERSATION_LIST,
      componentId: componentId || "",
    });
    const url = `${this.config.webhookPath}?${queryParams}`;

    const response = await this.makeRequest<N8NResponse<{ conversations: ChatConversation[]; count: number }>>(url, {});
    return response.data?.conversations || [];
  }

  /**
   * Get single conversation from API
   */
  async getConversation(conversationId: string): Promise<ChatConversation> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.CONVERSATION_GET,
      conversationId: conversationId,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;

    const response = await this.makeRequest<N8NResponse<ChatConversation>>(url, {});
    if (!response.data) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    return response.data;
  }

  /**
   * Create new conversation via API
   */
  async createConversation(componentId: string, conversationId: string, title?: string): Promise<ChatConversation> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.CONVERSATION_CREATE,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;
    const payload = {
      conversationId,
      componentId,
      title: title || `Chat ${new Date().toLocaleString()}`,
      status: "active",
      metadata: {}
    };

    const response = await this.makeRequest<N8NResponse<{ conversationId: string }>>(url, payload);

    if (!response.data?.conversationId) {
      throw new Error("Failed to create conversation: Invalid response");
    }

    // Return the created conversation by fetching it
    return await this.getConversation(response.data.conversationId);
  }

  /**
   * Update conversation status via API
   */
  async updateConversation(conversationId: string, status: string): Promise<void> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.CONVERSATION_UPDATE,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;
    const payload = {
      conversationId: conversationId,
      status: status,
    };

    await this.makeRequest<N8NResponse>(url, payload);
  }

  /**
   * Get messages for a conversation from API
   */
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.MESSAGE_LIST,
      conversationId: conversationId,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;

    const response = await this.makeRequest<N8NResponse<{ messages: ChatMessage[] }>>(url, {});
    return response?.data?.messages || [];
  }

  /**
   * Get single message from API
   */
  async getMessage(messageId: string): Promise<ChatMessage> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.MESSAGE_GET,
      messageId: messageId,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;

    const response = await this.makeRequest<N8NResponse<ChatMessage>>(url, {});
    if (!response.data) {
      throw new Error(`Message ${messageId} not found`);
    }
    return response.data;
  }

  /**
   * Create message in API - sync user messages to backend
   */
  async createMessage(message: ChatMessageRequest): Promise<ChatMessage> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.MESSAGE_CREATE,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;
    const payload = {
      messageId: message.id,
      conversationId: message.conversationId,
      content: message.content,
      role: message.role,
      type: message.type || "text",
      status: message.status || "sent",
      metadata: message.metadata || {},
    };

    const response = await this.makeRequest<N8NResponse<{ messageId: string }>>(url, payload);

    if (!response.success) {
      throw new Error(response?.message || "Failed to send message: Invalid response");
    }

    // Create proper ChatMessage object
    const chatMessage: ChatMessage = {
      id: message.id,
      content: message.content,
      role: message.role as MessageRole,
      type: (message.type as MessageType) || MessageType.TEXT,
      status: (message.status as MessageStatus) || MessageStatus.SENT,
      conversationId: message.conversationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: message.metadata,
    };

    return chatMessage;
  }

  /**
   * Update message status in API
   */
  async updateMessage(messageId: string, status: MessageStatus): Promise<void> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.MESSAGE_UPDATE,
      messageId: messageId,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;
    const payload = {
      messageId: messageId,
      status: status,
    };

    await this.makeRequest<N8NResponse>(url, payload);
  }

  /**
   * Enqueue message for n8n processing
   */
  async enqueue(data: EnqueueRequest): Promise<{ queueId: string }> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.QUEUE_ENQUEUE,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;
    const payload = {
      id: data.id,
      componentId: data.componentId,
      conversationId: data.conversationId,
      messageId: data.messageId,
      message: data.message,
      messageType: data.messageType || MessageType.TEXT,
      priority: data.priority || 1,
      metadata: data.metadata || {},
    };

    const response = await this.makeRequest<N8NResponse<{ queueId: string }>>(url, payload);

    if (!response.success || !response.data?.queueId) {
      throw new Error(response?.message || "Failed to enqueue message: Invalid response");
    }

    return { queueId: response.data.queueId };
  }

  /**
   * Generic method to make requests to N8N API
   */
  private async makeRequest<T>(path: string, data: unknown): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!result?.success) {
        throw new Error(result.message || "Request failed");
      }

      return result as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async uploadFile(file: File): Promise<{ url: string; fileId: string }> {
    // For now, we'll handle file uploads by converting to base64
    // In a real implementation, this might upload to a file storage service
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve({
          url: base64,
          fileId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }

  // Test queue connectivity
  async testConnection(): Promise<boolean> {
    try {
      const queryParams = this.buildQueryParams({
        action: ApiChatbotAction.HEALTH_STATUS,
      });
      const response = await this.makeRequest<N8NResponse>(`${this.config.webhookPath}?${queryParams}`, {});

      return response.success;
    } catch (error) {
      console.warn("N8N connection test failed:", error);
      return false;
    }
  }

  buildQueryParams(params: Record<string, string>): string {
    return new URLSearchParams(params).toString();
  }
}

// Default configuration - can be overridden via environment variables
const defaultConfig: N8NWebhookConfig = {
  baseUrl: import.meta.env.VITE_N8N_BASE_URL || "http://localhost:5678",
  webhookPath: import.meta.env.VITE_N8N_WEBHOOK_PATH || "/webhook/chatbot",
};

export const n8nService = new N8NService(defaultConfig);
export default N8NService;
