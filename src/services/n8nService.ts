// N8N Queue Integration Service - Updated for Queue System
import { MessageType } from "../types/chat.types";
import { v4 as uuidV4 } from "uuid";
import type { N8NResponse, EnqueueResponse, QueueItem, ChatConversation, ChatMessage } from "../types/chat.types";
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
   * Send chat message via queue system
   */
  async sendChatMessage(request: N8NChatRequest): Promise<N8NChatResponse> {
    try {
      // Enqueue the request
      const enqueueResponse = await this.enqueueRequest({
        componentId: request.componentId,
        conversationId: request.conversationId,
        message: request.message,
        messageType: request.messageType,
        priority: 5,
        metadata: {
          framework: request.metadata?.framework || "react",
          language: request.metadata?.language || "typescript",
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      });

      if (enqueueResponse.success && enqueueResponse.data?.queueId) {
        return {
          success: true,
          content: enqueueResponse.message || "Your request has been queued for processing",
          type: MessageType.TEXT,
          queueId: enqueueResponse.data.queueId,
        };
      } else {
        throw new Error(enqueueResponse.message || "Failed to enqueue request");
      }
    } catch (error: unknown) {
      console.error("N8N Service Error:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      if (errorMessage.includes("timeout") || errorMessage.includes("AbortError")) {
        throw new Error("Request timeout - N8N service took too long to respond");
      }

      throw new Error(errorMessage || "Failed to communicate with N8N service");
    }
  }

  /**
   * Enqueue a component modification request
   */
  async enqueueRequest(request: {
    componentId: string;
    conversationId: string;
    message: string;
    messageType: MessageType;
    priority?: number;
    metadata?: Record<string, unknown>;
  }): Promise<EnqueueResponse> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.QUEUE_ENQUEUE,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;

    const payload = {
      componentId: request.componentId,
      conversationId: request.conversationId,
      message: request.message,
      messageType: request.messageType,
      priority: request.priority || 5,
      metadata: JSON.stringify(request.metadata || {}),
    };

    const response = await this.makeRequest<EnqueueResponse>(url, payload);
    return response;
  }

  /**
   * Get queue item status by ID
   */
  async getQueueItemStatus(queueId: number): Promise<N8NResponse<QueueItem>> {
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.QUEUE_GET_ITEM,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;

    const payload = {
      queueItemId: queueId,
    };

    const response = await this.makeRequest<N8NResponse<QueueItem>>(url, payload);
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
  async createConversation(componentId: string, title?: string): Promise<ChatConversation> {
    const conversationId = uuidV4();
    const queryParams = this.buildQueryParams({
      action: ApiChatbotAction.CONVERSATION_CREATE,
    });
    const url = `${this.config.webhookPath}?${queryParams}`;
    const payload = {
      conversationId,
      componentId,
      title: title || `Chat ${new Date().toLocaleString()}`,
      status: "active",
    };

    const response = await this.makeRequest<N8NResponse<{ conversationId: string }>>(url, payload);

    if (!response.data?.conversationId) {
      throw new Error("Failed to create conversation: Invalid response");
    }

    // Return the created conversation by fetching it
    return await this.getConversation(response.data.conversationId);
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
      const response = await this.makeRequest<N8NResponse>(
        `${this.config.webhookPath}?${queryParams}`,
        {}
      );

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
