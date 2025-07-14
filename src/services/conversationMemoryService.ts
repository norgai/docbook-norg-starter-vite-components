// Conversation Memory Service
// Persistent storage and retrieval of conversation data, context, and patterns

export interface MemoryStorage {
  conversations: Map<string, StoredConversation>;
  contexts: Map<string, StoredContext>;
  patterns: Map<string, StoredPattern>;
  userPreferences: Map<string, StoredUserPreferences>;
  analytics: MemoryAnalytics;
}

export interface StoredConversation {
  id: string;
  componentId: string;
  userId?: string;
  startedAt: string;
  endedAt?: string;
  totalMessages: number;
  totalTokens: number;
  status: 'active' | 'completed' | 'abandoned' | 'archived';
  summary: ConversationSummary;
  messages: StoredMessage[];
  outcomes: ConversationOutcome[];
  metadata: {
    framework: string;
    language: string;
    requestTypes: string[];
    successfulActions: number;
    failedActions: number;
    averageResponseTime: number;
  };
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens: number;
  metadata: {
    intent?: string;
    entities?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    confidence?: number;
    promptUsed?: string;
    responseTime?: number;
  };
  // Compressed for storage
  embeddings?: number[];
  keywords?: string[];
}

export interface ConversationSummary {
  mainTopics: string[];
  keyAchievements: string[];
  unresolvedIssues: string[];
  userSatisfaction?: number;
  codeChangesCount: number;
  complexity: 'low' | 'medium' | 'high';
  duration: number;
}

export interface ConversationOutcome {
  type: 'code_change' | 'component_created' | 'issue_resolved' | 'learning' | 'failure';
  description: string;
  success: boolean;
  confidence: number;
  artifacts: string[];
  timestamp: string;
  impact: 'low' | 'medium' | 'high';
}

export interface StoredContext {
  id: string;
  conversationId: string;
  componentId: string;
  snapshot: ContextSnapshot;
  timestamp: string;
  isActive: boolean;
  compressionLevel: 'none' | 'light' | 'medium' | 'heavy';
}

export interface ContextSnapshot {
  state: Record<string, any>;
  userIntent: string;
  requestType: string;
  confidence: number;
  variables: Record<string, any>;
  stepHistory: string[];
  semanticConcepts: Array<{
    concept: string;
    relevance: number;
    context: string[];
  }>;
}

export interface StoredPattern {
  id: string;
  type: 'successful_flow' | 'common_request' | 'error_pattern' | 'user_behavior';
  description: string;
  frequency: number;
  successRate: number;
  contexts: string[];
  triggers: string[];
  outcomes: string[];
  lastSeen: string;
  confidence: number;
  metadata: {
    framework?: string;
    requestType?: string;
    componentType?: string;
    userExperience?: string;
  };
}

export interface StoredUserPreferences {
  userId: string;
  preferences: {
    codeStyle: string;
    explanationLevel: string;
    framework: string;
    language: string;
    designSystem?: string;
    preferredLibraries: string[];
  };
  learningProfile: {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    learningStyle: 'visual' | 'hands-on' | 'detailed' | 'quick';
    commonMistakes: string[];
    strengths: string[];
    improvementAreas: string[];
  };
  interactionHistory: {
    totalConversations: number;
    avgSessionDuration: number;
    preferredRequestTypes: string[];
    successfulPatterns: string[];
    lastActive: string;
  };
  updatedAt: string;
}

export interface MemoryAnalytics {
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  avgConversationDuration: number;
  commonRequestTypes: Map<string, number>;
  popularComponents: Map<string, number>;
  userEngagement: {
    dailyActiveUsers: number;
    avgSessionsPerUser: number;
    conversionRate: number;
  };
  performanceMetrics: {
    avgResponseTime: number;
    successRate: number;
    userSatisfaction: number;
  };
  trends: {
    dailyStats: Array<{
      date: string;
      conversations: number;
      messages: number;
      users: number;
    }>;
  };
}

export interface MemoryQuery {
  conversationId?: string;
  componentId?: string;
  userId?: string;
  requestType?: string;
  timeRange?: {
    start: string;
    end: string;
  };
  limit?: number;
  includeContent?: boolean;
  similarityThreshold?: number;
}

export interface MemorySearchResult {
  conversations: StoredConversation[];
  patterns: StoredPattern[];
  relatedContexts: StoredContext[];
  totalResults: number;
  searchTime: number;
}

class ConversationMemoryService {
  private storage: MemoryStorage;
  private compressionThreshold = 1000; // Messages
  private retentionPeriod = 90 * 24 * 60 * 60 * 1000; // 90 days
  private isInitialized = false;

  constructor() {
    this.storage = {
      conversations: new Map(),
      contexts: new Map(),
      patterns: new Map(),
      userPreferences: new Map(),
      analytics: this.initializeAnalytics()
    };
  }

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadPersistedData();
    await this.initializeAnalytics();
    
    // Set up periodic maintenance
    this.scheduleMaintenanceTasks();
    
    this.isInitialized = true;
    console.log('Conversation memory service initialized');
  }

  // Store conversation
  async storeConversation(conversation: Omit<StoredConversation, 'id'>): Promise<string> {
    await this.ensureInitialized();

    const id = this.generateId('conv');
    const storedConversation: StoredConversation = {
      ...conversation,
      id
    };

    this.storage.conversations.set(id, storedConversation);
    
    // Update analytics
    await this.updateAnalytics('conversation_stored', storedConversation);
    
    // Extract patterns
    await this.extractAndStorePatterns(storedConversation);
    
    // Persist to storage
    await this.persistConversation(storedConversation);

    return id;
  }

  // Retrieve conversation
  async getConversation(conversationId: string, includeMessages: boolean = true): Promise<StoredConversation | null> {
    await this.ensureInitialized();

    const conversation = this.storage.conversations.get(conversationId);
    if (!conversation) return null;

    if (!includeMessages) {
      // Return without message content to save memory
      return {
        ...conversation,
        messages: conversation.messages.map(msg => ({
          ...msg,
          content: '', // Clear content
          embeddings: undefined // Clear embeddings
        }))
      };
    }

    return conversation;
  }

  // Search conversations
  async searchConversations(query: MemoryQuery): Promise<MemorySearchResult> {
    await this.ensureInitialized();

    const startTime = Date.now();
    let conversations = Array.from(this.storage.conversations.values());
    
    // Apply filters
    if (query.conversationId) {
      conversations = conversations.filter(c => c.id === query.conversationId);
    }
    if (query.componentId) {
      conversations = conversations.filter(c => c.componentId === query.componentId);
    }
    if (query.userId) {
      conversations = conversations.filter(c => c.userId === query.userId);
    }
    if (query.requestType) {
      conversations = conversations.filter(c => 
        c.metadata.requestTypes.includes(query.requestType!)
      );
    }
    if (query.timeRange) {
      conversations = conversations.filter(c => {
        const startTime = new Date(c.startedAt).getTime();
        const rangeStart = new Date(query.timeRange!.start).getTime();
        const rangeEnd = new Date(query.timeRange!.end).getTime();
        return startTime >= rangeStart && startTime <= rangeEnd;
      });
    }

    // Apply limit
    if (query.limit) {
      conversations = conversations.slice(0, query.limit);
    }

    // Find related patterns
    const patterns = await this.findRelatedPatterns(conversations);
    
    // Find related contexts
    const contexts = await this.findRelatedContexts(conversations);

    const searchTime = Date.now() - startTime;

    return {
      conversations,
      patterns,
      relatedContexts: contexts,
      totalResults: conversations.length,
      searchTime
    };
  }

  // Store context snapshot
  async storeContext(context: Omit<StoredContext, 'id'>): Promise<string> {
    await this.ensureInitialized();

    const id = this.generateId('ctx');
    const storedContext: StoredContext = {
      ...context,
      id
    };

    this.storage.contexts.set(id, storedContext);
    
    // Apply compression if needed
    if (this.shouldCompress(storedContext)) {
      storedContext.snapshot = await this.compressContextSnapshot(storedContext.snapshot);
      storedContext.compressionLevel = 'medium';
    }

    await this.persistContext(storedContext);
    return id;
  }

  // Get context
  async getContext(contextId: string): Promise<StoredContext | null> {
    await this.ensureInitialized();

    const context = this.storage.contexts.get(contextId);
    if (!context) return null;

    // Decompress if needed
    if (context.compressionLevel !== 'none') {
      context.snapshot = await this.decompressContextSnapshot(context.snapshot);
    }

    return context;
  }

  // Store user preferences
  async storeUserPreferences(preferences: StoredUserPreferences): Promise<void> {
    await this.ensureInitialized();

    preferences.updatedAt = new Date().toISOString();
    this.storage.userPreferences.set(preferences.userId, preferences);
    
    await this.persistUserPreferences(preferences);
  }

  // Get user preferences
  async getUserPreferences(userId: string): Promise<StoredUserPreferences | null> {
    await this.ensureInitialized();
    return this.storage.userPreferences.get(userId) || null;
  }

  // Extract and store patterns
  private async extractAndStorePatterns(conversation: StoredConversation): Promise<void> {
    // Extract successful flow patterns
    if (conversation.outcomes.some(o => o.success)) {
      await this.extractSuccessfulFlowPattern(conversation);
    }

    // Extract common request patterns
    await this.extractCommonRequestPattern(conversation);

    // Extract error patterns if any failures
    if (conversation.outcomes.some(o => !o.success)) {
      await this.extractErrorPattern(conversation);
    }

    // Extract user behavior patterns
    await this.extractUserBehaviorPattern(conversation);
  }

  private async extractSuccessfulFlowPattern(conversation: StoredConversation): Promise<void> {
    const patternId = `success_${conversation.componentId}_${conversation.metadata.requestTypes.join('_')}`;
    const existingPattern = this.storage.patterns.get(patternId);

    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.lastSeen = new Date().toISOString();
      existingPattern.successRate = (existingPattern.successRate + 1) / 2; // Weighted average
    } else {
      const newPattern: StoredPattern = {
        id: patternId,
        type: 'successful_flow',
        description: `Successful ${conversation.metadata.requestTypes.join(' + ')} for ${conversation.componentId}`,
        frequency: 1,
        successRate: 1.0,
        contexts: [conversation.componentId],
        triggers: conversation.metadata.requestTypes,
        outcomes: conversation.outcomes.filter(o => o.success).map(o => o.description),
        lastSeen: new Date().toISOString(),
        confidence: 0.8,
        metadata: {
          framework: conversation.metadata.framework,
          requestType: conversation.metadata.requestTypes[0],
          componentType: conversation.componentId
        }
      };

      this.storage.patterns.set(patternId, newPattern);
    }
  }

  private async extractCommonRequestPattern(conversation: StoredConversation): Promise<void> {
    const requestType = conversation.metadata.requestTypes[0];
    const patternId = `common_${requestType}_${conversation.metadata.framework}`;
    
    const existingPattern = this.storage.patterns.get(patternId);
    
    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.lastSeen = new Date().toISOString();
    } else {
      const newPattern: StoredPattern = {
        id: patternId,
        type: 'common_request',
        description: `Common ${requestType} requests in ${conversation.metadata.framework}`,
        frequency: 1,
        successRate: conversation.metadata.successfulActions / Math.max(1, conversation.metadata.successfulActions + conversation.metadata.failedActions),
        contexts: [conversation.metadata.framework],
        triggers: [requestType],
        outcomes: conversation.outcomes.map(o => o.description),
        lastSeen: new Date().toISOString(),
        confidence: 0.6,
        metadata: {
          framework: conversation.metadata.framework,
          requestType
        }
      };

      this.storage.patterns.set(patternId, newPattern);
    }
  }

  private async extractErrorPattern(conversation: StoredConversation): Promise<void> {
    const failedOutcomes = conversation.outcomes.filter(o => !o.success);
    
    for (const outcome of failedOutcomes) {
      const patternId = `error_${outcome.type}_${conversation.metadata.framework}`;
      const existingPattern = this.storage.patterns.get(patternId);

      if (existingPattern) {
        existingPattern.frequency++;
        existingPattern.lastSeen = new Date().toISOString();
      } else {
        const newPattern: StoredPattern = {
          id: patternId,
          type: 'error_pattern',
          description: `Error pattern: ${outcome.description}`,
          frequency: 1,
          successRate: 0,
          contexts: [conversation.componentId],
          triggers: [outcome.type],
          outcomes: [outcome.description],
          lastSeen: new Date().toISOString(),
          confidence: 0.7,
          metadata: {
            framework: conversation.metadata.framework,
            requestType: conversation.metadata.requestTypes[0]
          }
        };

        this.storage.patterns.set(patternId, newPattern);
      }
    }
  }

  private async extractUserBehaviorPattern(conversation: StoredConversation): Promise<void> {
    if (!conversation.userId) return;

    const patternId = `behavior_${conversation.userId}`;
    const existingPattern = this.storage.patterns.get(patternId);

    const userBehavior = {
      avgSessionDuration: conversation.summary.duration,
      requestTypes: conversation.metadata.requestTypes,
      complexity: conversation.summary.complexity,
      successRate: conversation.metadata.successfulActions / Math.max(1, conversation.metadata.successfulActions + conversation.metadata.failedActions)
    };

    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.lastSeen = new Date().toISOString();
      // Update behavior metrics
    } else {
      const newPattern: StoredPattern = {
        id: patternId,
        type: 'user_behavior',
        description: `User behavior pattern for ${conversation.userId}`,
        frequency: 1,
        successRate: userBehavior.successRate,
        contexts: [conversation.componentId],
        triggers: conversation.metadata.requestTypes,
        outcomes: ['behavioral_analysis'],
        lastSeen: new Date().toISOString(),
        confidence: 0.5,
        metadata: {
          userExperience: conversation.summary.complexity
        }
      };

      this.storage.patterns.set(patternId, newPattern);
    }
  }

  // Find related patterns for conversations
  private async findRelatedPatterns(conversations: StoredConversation[]): Promise<StoredPattern[]> {
    const relatedPatterns: StoredPattern[] = [];
    const componentIds = new Set(conversations.map(c => c.componentId));
    const requestTypes = new Set(conversations.flatMap(c => c.metadata.requestTypes));

    for (const pattern of this.storage.patterns.values()) {
      // Check if pattern is related to any of the conversations
      const hasRelatedContext = pattern.contexts.some(ctx => componentIds.has(ctx));
      const hasRelatedTrigger = pattern.triggers.some(trigger => requestTypes.has(trigger));

      if (hasRelatedContext || hasRelatedTrigger) {
        relatedPatterns.push(pattern);
      }
    }

    return relatedPatterns.sort((a, b) => b.frequency - a.frequency).slice(0, 10);
  }

  // Find related contexts
  private async findRelatedContexts(conversations: StoredConversation[]): Promise<StoredContext[]> {
    const conversationIds = new Set(conversations.map(c => c.id));
    const relatedContexts: StoredContext[] = [];

    for (const context of this.storage.contexts.values()) {
      if (conversationIds.has(context.conversationId)) {
        relatedContexts.push(context);
      }
    }

    return relatedContexts.slice(0, 20);
  }

  // Compression and optimization
  private shouldCompress(context: StoredContext): boolean {
    const size = JSON.stringify(context.snapshot).length;
    return size > this.compressionThreshold;
  }

  private async compressContextSnapshot(snapshot: ContextSnapshot): Promise<ContextSnapshot> {
    // Simple compression - keep only essential data
    return {
      state: this.compressObject(snapshot.state),
      userIntent: snapshot.userIntent,
      requestType: snapshot.requestType,
      confidence: snapshot.confidence,
      variables: this.compressObject(snapshot.variables),
      stepHistory: snapshot.stepHistory.slice(-5), // Keep last 5 steps
      semanticConcepts: snapshot.semanticConcepts
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 10) // Keep top 10 concepts
    };
  }

  private async decompressContextSnapshot(snapshot: ContextSnapshot): Promise<ContextSnapshot> {
    // In a real implementation, this would decompress the data
    return snapshot;
  }

  private compressObject(obj: Record<string, any>): Record<string, any> {
    const compressed: Record<string, any> = {};
    
    // Keep only primitive values and small objects
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        compressed[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        const size = JSON.stringify(value).length;
        if (size < 100) {
          compressed[key] = value;
        }
      }
    }

    return compressed;
  }

  // Analytics and reporting
  private initializeAnalytics(): MemoryAnalytics {
    return {
      totalConversations: 0,
      totalMessages: 0,
      totalTokens: 0,
      avgConversationDuration: 0,
      commonRequestTypes: new Map(),
      popularComponents: new Map(),
      userEngagement: {
        dailyActiveUsers: 0,
        avgSessionsPerUser: 0,
        conversionRate: 0
      },
      performanceMetrics: {
        avgResponseTime: 0,
        successRate: 0,
        userSatisfaction: 0
      },
      trends: {
        dailyStats: []
      }
    };
  }

  private async updateAnalytics(event: string, data: any): Promise<void> {
    switch (event) {
      case 'conversation_stored':
        const conversation = data as StoredConversation;
        this.storage.analytics.totalConversations++;
        this.storage.analytics.totalMessages += conversation.totalMessages;
        this.storage.analytics.totalTokens += conversation.totalTokens;
        
        // Update request type frequency
        for (const requestType of conversation.metadata.requestTypes) {
          const current = this.storage.analytics.commonRequestTypes.get(requestType) || 0;
          this.storage.analytics.commonRequestTypes.set(requestType, current + 1);
        }
        
        // Update component popularity
        const componentCount = this.storage.analytics.popularComponents.get(conversation.componentId) || 0;
        this.storage.analytics.popularComponents.set(conversation.componentId, componentCount + 1);
        
        break;
    }
  }

  async getAnalytics(): Promise<MemoryAnalytics> {
    await this.ensureInitialized();
    return this.storage.analytics;
  }

  // Maintenance tasks
  private scheduleMaintenanceTasks(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.runCleanupTasks().catch(console.error);
    }, 60 * 60 * 1000);

    // Run compression every 6 hours
    setInterval(() => {
      this.runCompressionTasks().catch(console.error);
    }, 6 * 60 * 60 * 1000);
  }

  private async runCleanupTasks(): Promise<void> {
    const now = Date.now();
    const cutoffTime = now - this.retentionPeriod;

    // Archive old conversations
    for (const [id, conversation] of this.storage.conversations.entries()) {
      const conversationTime = new Date(conversation.startedAt).getTime();
      if (conversationTime < cutoffTime && conversation.status !== 'archived') {
        conversation.status = 'archived';
        // In production, move to cold storage
      }
    }

    // Remove old patterns with low frequency
    for (const [id, pattern] of this.storage.patterns.entries()) {
      const patternTime = new Date(pattern.lastSeen).getTime();
      if (patternTime < cutoffTime && pattern.frequency < 5) {
        this.storage.patterns.delete(id);
      }
    }

    console.log('Memory cleanup completed');
  }

  private async runCompressionTasks(): Promise<void> {
    // Compress contexts that haven't been accessed recently
    for (const [id, context] of this.storage.contexts.entries()) {
      if (context.compressionLevel === 'none' && this.shouldCompress(context)) {
        context.snapshot = await this.compressContextSnapshot(context.snapshot);
        context.compressionLevel = 'medium';
      }
    }

    console.log('Memory compression completed');
  }

  // Persistence layer (mock implementation)
  private async loadPersistedData(): Promise<void> {
    // In a real implementation, this would load from IndexedDB, localStorage, or a database
    console.log('Loading persisted conversation data...');
  }

  private async persistConversation(conversation: StoredConversation): Promise<void> {
    // Mock persistence
    console.log(`Persisting conversation: ${conversation.id}`);
  }

  private async persistContext(context: StoredContext): Promise<void> {
    // Mock persistence
    console.log(`Persisting context: ${context.id}`);
  }

  private async persistUserPreferences(preferences: StoredUserPreferences): Promise<void> {
    // Mock persistence
    console.log(`Persisting user preferences: ${preferences.userId}`);
  }

  // Helper methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    this.storage.conversations.clear();
    this.storage.contexts.clear();
    this.storage.patterns.clear();
    this.storage.userPreferences.clear();
    this.storage.analytics = this.initializeAnalytics();
  }

  // Export data for backup
  async exportData(): Promise<{
    conversations: StoredConversation[];
    patterns: StoredPattern[];
    userPreferences: StoredUserPreferences[];
    analytics: MemoryAnalytics;
  }> {
    await this.ensureInitialized();

    return {
      conversations: Array.from(this.storage.conversations.values()),
      patterns: Array.from(this.storage.patterns.values()),
      userPreferences: Array.from(this.storage.userPreferences.values()),
      analytics: this.storage.analytics
    };
  }
}

// Export singleton instance
export const conversationMemoryService = new ConversationMemoryService();
export default ConversationMemoryService;