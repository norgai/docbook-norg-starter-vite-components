// Concurrent Request Manager for handling multiple AI requests
import { websocketService } from './websocketService';
import { v4 as uuidV4 } from 'uuid';

export interface RequestQueue {
  id: string;
  type: 'chat' | 'file-change' | 'validation';
  payload: any;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  retries: number;
  maxRetries: number;
  timeout: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  result?: any;
  error?: string;
}

export interface ConcurrentConfig {
  maxConcurrent: number;
  defaultTimeout: number;
  maxRetries: number;
  queueSize: number;
  priorityWeights: Record<string, number>;
}

class ConcurrentRequestManager {
  private config: ConcurrentConfig;
  private queue: RequestQueue[] = [];
  private processing: Map<string, RequestQueue> = new Map();
  private completed: Map<string, RequestQueue> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(config: Partial<ConcurrentConfig> = {}) {
    this.config = {
      maxConcurrent: 3,
      defaultTimeout: 30000,
      maxRetries: 2,
      queueSize: 50,
      priorityWeights: { high: 3, medium: 2, low: 1 },
      ...config
    };
  }

  // Add request to queue
  enqueue(
    type: RequestQueue['type'],
    payload: any,
    options: {
      priority?: RequestQueue['priority'];
      timeout?: number;
      maxRetries?: number;
      id?: string;
    } = {}
  ): string {
    const id = options.id || uuidV4();
    
    // Check if request already exists
    if (this.getRequest(id)) {
      throw new Error(`Request with ID ${id} already exists`);
    }

    const request: RequestQueue = {
      id,
      type,
      payload,
      priority: options.priority || 'medium',
      timestamp: Date.now(),
      retries: 0,
      maxRetries: options.maxRetries || this.config.maxRetries,
      timeout: options.timeout || this.config.defaultTimeout,
      status: 'pending'
    };

    // Check queue size
    if (this.queue.length >= this.config.queueSize) {
      // Remove oldest low-priority request
      const removedIndex = this.queue.findIndex(r => r.priority === 'low');
      if (removedIndex >= 0) {
        const removed = this.queue.splice(removedIndex, 1)[0];
        this.emit('removed', { request: removed, reason: 'queue-full' });
      } else {
        throw new Error('Request queue is full');
      }
    }

    // Insert in priority order
    this.insertByPriority(request);
    this.emit('queued', { request });
    
    // Try to process immediately
    this.processNext();
    
    return id;
  }

  // Cancel a request
  cancel(id: string): boolean {
    // Check in queue
    const queueIndex = this.queue.findIndex(r => r.id === id);
    if (queueIndex >= 0) {
      const request = this.queue.splice(queueIndex, 1)[0];
      request.status = 'cancelled';
      this.emit('cancelled', { request });
      return true;
    }

    // Check in processing
    const processingRequest = this.processing.get(id);
    if (processingRequest) {
      processingRequest.status = 'cancelled';
      this.processing.delete(id);
      this.emit('cancelled', { request: processingRequest });
      this.processNext(); // Start next request
      return true;
    }

    return false;
  }

  // Get request status
  getRequest(id: string): RequestQueue | null {
    // Check queue
    const queued = this.queue.find(r => r.id === id);
    if (queued) return queued;

    // Check processing
    const processing = this.processing.get(id);
    if (processing) return processing;

    // Check completed
    const completed = this.completed.get(id);
    if (completed) return completed;

    return null;
  }

  // Get queue stats
  getStats() {
    return {
      queue: {
        total: this.queue.length,
        byPriority: this.queue.reduce((acc, req) => {
          acc[req.priority] = (acc[req.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      processing: {
        total: this.processing.size,
        requests: Array.from(this.processing.values()).map(r => ({
          id: r.id,
          type: r.type,
          priority: r.priority,
          duration: Date.now() - r.timestamp
        }))
      },
      completed: {
        total: this.completed.size,
        success: Array.from(this.completed.values()).filter(r => r.status === 'completed').length,
        failed: Array.from(this.completed.values()).filter(r => r.status === 'failed').length
      }
    };
  }

  // Clear completed requests
  clearCompleted(): void {
    this.completed.clear();
    this.emit('cleared', { type: 'completed' });
  }

  // Event subscription
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

  private insertByPriority(request: RequestQueue): void {
    const weight = this.config.priorityWeights[request.priority];
    let insertIndex = this.queue.length;

    // Find insertion point based on priority and timestamp
    for (let i = 0; i < this.queue.length; i++) {
      const existingWeight = this.config.priorityWeights[this.queue[i].priority];
      if (weight > existingWeight || 
          (weight === existingWeight && request.timestamp < this.queue[i].timestamp)) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, request);
  }

  private processNext(): void {
    // Check if we can process more requests
    if (this.processing.size >= this.config.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift()!;
    request.status = 'processing';
    this.processing.set(request.id, request);

    this.emit('started', { request });
    this.executeRequest(request);
  }

  private async executeRequest(request: RequestQueue): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), request.timeout);
      });

      // Execute request based on type
      const resultPromise = this.handleRequestType(request);
      
      // Race between timeout and result
      const result = await Promise.race([resultPromise, timeoutPromise]);
      
      // Success
      request.status = 'completed';
      request.result = result;
      this.processing.delete(request.id);
      this.completed.set(request.id, request);
      
      this.emit('completed', { 
        request, 
        result, 
        duration: Date.now() - startTime 
      });
      
    } catch (error: any) {
      // Handle failure
      request.retries++;
      
      if (request.retries < request.maxRetries) {
        // Retry
        request.status = 'pending';
        this.processing.delete(request.id);
        
        // Add back to queue with exponential backoff
        setTimeout(() => {
          this.insertByPriority(request);
          this.processNext();
        }, Math.pow(2, request.retries) * 1000);
        
        this.emit('retry', { 
          request, 
          error: error.message, 
          attempt: request.retries 
        });
        
      } else {
        // Failed permanently
        request.status = 'failed';
        request.error = error.message;
        this.processing.delete(request.id);
        this.completed.set(request.id, request);
        
        this.emit('failed', { 
          request, 
          error: error.message, 
          duration: Date.now() - startTime 
        });
      }
    }

    // Process next request
    this.processNext();
  }

  private async handleRequestType(request: RequestQueue): Promise<any> {
    switch (request.type) {
      case 'chat':
        return this.handleChatRequest(request);
        
      case 'file-change':
        return this.handleFileChangeRequest(request);
        
      case 'validation':
        return this.handleValidationRequest(request);
        
      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }
  }

  private async handleChatRequest(request: RequestQueue): Promise<any> {
    // Send chat request to N8N via WebSocket or HTTP
    const response = await fetch('http://localhost:5678/webhook/chatbot?action=enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async handleFileChangeRequest(request: RequestQueue): Promise<any> {
    // Handle file change processing
    if (websocketService.isConnected()) {
      websocketService.subscribeToFileChanges([request.payload.file]);
    }
    
    return { acknowledged: true, file: request.payload.file };
  }

  private async handleValidationRequest(request: RequestQueue): Promise<any> {
    // Send validation request to N8N
    const response = await fetch('http://localhost:5678/webhook/validate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.payload)
    });

    if (!response.ok) {
      throw new Error(`Validation request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in request manager event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Default instance
export const concurrentRequestManager = new ConcurrentRequestManager();
export default ConcurrentRequestManager;