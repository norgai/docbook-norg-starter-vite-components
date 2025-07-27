// N8N Queue Integration Service - Updated for Queue System
import { MessageType } from '../types/chat.types';
import type { N8NResponse, EnqueueResponse, QueueItem } from '../types/chat.types';

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
    framework: 'react';
    language: 'typescript';
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
      ...config
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
          framework: request.metadata?.framework || 'react',
          language: request.metadata?.language || 'typescript',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      });

      if (enqueueResponse.success && enqueueResponse.data?.queueId) {
        return {
          success: true,
          content: enqueueResponse.message || 'Your request has been queued for processing',
          type: MessageType.TEXT,
          queueId: enqueueResponse.data.queueId
        };
      } else {
        throw new Error(enqueueResponse.message || 'Failed to enqueue request');
      }

    } catch (error: unknown) {
      console.error('N8N Service Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('timeout') || errorMessage.includes('AbortError')) {
        throw new Error('Request timeout - N8N service took too long to respond');
      }
      
      throw new Error(errorMessage || 'Failed to communicate with N8N service');
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
    const url = `${this.config.baseUrl}${this.config.webhookPath}?action=enqueue`;
    
    const payload = {
      componentId: request.componentId,
      conversationId: request.conversationId,
      message: request.message,
      messageType: request.messageType,
      priority: request.priority || 5,
      metadata: JSON.stringify(request.metadata || {})
    };

    const response = await this.makeRequest<EnqueueResponse>(url, payload);
    return response;
  }

  /**
   * Get queue item status by ID
   */
  async getQueueItemStatus(queueId: number): Promise<N8NResponse<QueueItem>> {
    const url = `${this.config.baseUrl}${this.config.webhookPath}?action=get-item`;
    
    const payload = {
      queueItemId: queueId
    };

    const response = await this.makeRequest<N8NResponse<QueueItem>>(url, payload);
    return response;
  }

  /**
   * Get all queue items for a component
   */
  async getQueueByComponentId(componentId: string): Promise<N8NResponse<QueueItem[]>> {
    const url = `${this.config.baseUrl}${this.config.webhookPath}?action=get-by-component-id`;
    
    const payload = {
      componentId: componentId
    };

    const response = await this.makeRequest<N8NResponse<QueueItem[]>>(url, payload);
    return response;
  }

  /**
   * Generate conversation ID for component
   */
  generateConversationId(componentId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `conv_${componentId}_${timestamp}_${random}`;
  }

  /**
   * Generic method to make requests to N8N API
   */
  private async makeRequest<T>(url: string, data: unknown): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("🚀 ~ n8nService.ts:179 ~ N8NService ~ makeRequest ~ result:", result)
      
      if (!result.success) {
        throw new Error(result.message || 'Request failed');
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
          fileId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  // Test queue connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest<N8NResponse>(
        `${this.config.baseUrl}${this.config.webhookPath}?action=health`,
        {}
      );
      console.log("🚀 ~ n8nService.ts:216 ~ N8NService ~ testConnection ~ response:", response)

      return response.success;
    } catch (error) {
      console.warn('N8N connection test failed:', error);
      return false;
    }
  }
}

// Default configuration - can be overridden via environment variables
const defaultConfig: N8NWebhookConfig = {
  baseUrl: import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678',
  webhookPath: import.meta.env.VITE_N8N_WEBHOOK_PATH || '/webhook/chatbot'
};

export const n8nService = new N8NService(defaultConfig);
export default N8NService;