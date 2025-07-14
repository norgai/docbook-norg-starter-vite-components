// N8N Direct Integration Service
import { MessageType } from '../types/chat.types';

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
  context?: {
    framework: 'react';
    language: 'typescript';
    currentCode?: string;
  };
}

export interface N8NChatResponse {
  success: boolean;
  content: string;
  type: MessageType;
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

  async sendChatMessage(request: N8NChatRequest): Promise<N8NChatResponse> {
    try {
      const webhookUrl = `${this.config.baseUrl}${this.config.webhookPath}`;
      
      const payload = {
        componentId: request.componentId,
        conversationId: request.conversationId,
        message: request.message,
        messageType: request.messageType,
        context: request.context,
        timestamp: new Date().toISOString()
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        content: data.content || 'Response received from N8N',
        type: data.type || MessageType.TEXT,
        codeChanges: data.codeChanges || [],
        error: data.error
      };

    } catch (error: any) {
      console.error('N8N Service Error:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - N8N workflow took too long to respond');
      }
      
      throw new Error(error.message || 'Failed to communicate with N8N webhook');
    }
  }

  async uploadFile(file: File, purpose: string): Promise<{ url: string; fileId: string }> {
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

  // Test webhook connectivity
  async testConnection(): Promise<boolean> {
    try {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.config.baseUrl}${this.config.webhookPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      return response.ok;
    } catch (error) {
      console.warn('N8N connection test failed:', error);
      return false;
    }
  }
}

// Default configuration - can be overridden via environment variables
const defaultConfig: N8NWebhookConfig = {
  baseUrl: import.meta.env.VITE_N8N_BASE_URL || 'http://localhost:5678',
  webhookPath: import.meta.env.VITE_N8N_WEBHOOK_PATH || '/webhook/chat'
};

export const n8nService = new N8NService(defaultConfig);
export default N8NService;