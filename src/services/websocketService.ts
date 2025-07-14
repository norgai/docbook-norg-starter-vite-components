// WebSocket Service for Real-time Updates
// Simplified implementation without socket.io-client dependency

export interface ProgressUpdate {
  type: 'progress' | 'status' | 'completion' | 'error';
  stage: string;
  progress: number; // 0-100
  message: string;
  data?: any;
}

export interface FileChangeEvent {
  type: 'file-changed' | 'file-added' | 'file-deleted';
  file: string;
  content?: string;
  timestamp: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  timeout?: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectCount = 0;
  private maxReconnectAttempts: number;
  private reconnectTimer: number | null = null;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      timeout: 10000,
      ...config
    };
    this.maxReconnectAttempts = this.config.reconnectAttempts!;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use native WebSocket for now
        const wsUrl = this.config.url.replace('http', 'ws') + '/socket.io/';
        
        // For development, we'll simulate a successful connection
        setTimeout(() => {
          console.log('Mock WebSocket connected to:', this.config.url);
          this.emit('connection', { status: 'connected' });
          resolve();
        }, 100);

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.listeners.clear();
    console.log('WebSocket disconnected');
  }

  isConnected(): boolean {
    // For development, simulate connection based on N8N availability
    return true; // Mock as connected for demo
  }

  // Subscribe to chat session for real-time updates
  subscribeToChat(conversationId: string, componentId: string): void {
    console.log(`Subscribed to chat updates: ${conversationId}, ${componentId}`);
    
    // Simulate subscription acknowledgment
    setTimeout(() => {
      this.emit('chatSubscribed', { conversationId, componentId });
    }, 50);
  }

  unsubscribeFromChat(conversationId: string): void {
    console.log(`Unsubscribed from chat: ${conversationId}`);
  }

  // Subscribe to file changes
  subscribeToFileChanges(files: string[]): void {
    console.log('Subscribed to file changes:', files);
  }

  unsubscribeFromFileChanges(): void {
    console.log('Unsubscribed from file changes');
  }

  // Send progress update request
  requestProgressUpdate(conversationId: string): void {
    console.log(`Requesting progress update for: ${conversationId}`);
    
    // Simulate progress update
    setTimeout(() => {
      this.emit('progress', {
        type: 'progress',
        stage: 'Mock Progress Check',
        progress: 75,
        message: 'Checking for updates...',
        data: { conversationId }
      });
    }, 100);
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Simulate progress updates for demo purposes
  simulateProgress(conversationId: string, stages: string[]): void {
    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage >= stages.length) {
        clearInterval(interval);
        this.emit('progress', {
          type: 'completion',
          stage: 'Complete',
          progress: 100,
          message: 'All operations completed successfully!',
          data: { conversationId }
        });
        return;
      }

      const progress = Math.round((currentStage / stages.length) * 100);
      this.emit('progress', {
        type: 'progress',
        stage: stages[currentStage],
        progress,
        message: `Processing ${stages[currentStage].toLowerCase()}...`,
        data: { conversationId }
      });

      currentStage++;
    }, 1000);
  }

  // Simulate file changes for demo
  simulateFileChange(file: string, type: 'modified' | 'created' | 'deleted' = 'modified'): void {
    this.emit('fileChange', {
      type: `file-${type}`,
      file,
      content: type === 'deleted' ? undefined : '// Updated content...',
      timestamp: new Date().toISOString()
    });
  }
}

// Default WebSocket configuration
const defaultConfig: WebSocketConfig = {
  url: import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:5678',
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  timeout: 10000
};

export const websocketService = new WebSocketService(defaultConfig);
export default WebSocketService;