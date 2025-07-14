// Context Management Service
// Handles conversation context, memory, and state tracking for AI interactions

export interface ConversationContext {
  id: string;
  componentId: string;
  sessionId: string;
  userId?: string;
  startedAt: string;
  lastActivity: string;
  state: ConversationState;
  memory: ContextMemory;
  metadata: {
    totalMessages: number;
    totalTokens: number;
    avgResponseTime: number;
    successfulRequests: number;
    failedRequests: number;
  };
}

export interface ConversationState {
  currentPhase: 'understanding' | 'planning' | 'implementation' | 'review' | 'complete';
  userIntent: string;
  requestType: 'styling' | 'functionality' | 'structure' | 'props' | 'debug' | 'review';
  confidence: number;
  lastAction: string;
  pendingActions: string[];
  codeChanges: CodeChange[];
  errors: string[];
  warnings: string[];
}

export interface ContextMemory {
  shortTerm: {
    recentMessages: ContextMessage[];
    currentFocus: string;
    activeVariables: Record<string, any>;
    temporaryData: Record<string, any>;
  };
  longTerm: {
    userPreferences: UserPreferences;
    successfulPatterns: Pattern[];
    failedAttempts: FailedAttempt[];
    componentHistory: ComponentInteraction[];
  };
  semantic: {
    concepts: SemanticConcept[];
    relationships: ConceptRelationship[];
    keywords: string[];
    topics: string[];
  };
}

export interface ContextMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  tokens: number;
  metadata: {
    intent?: string;
    entities?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    complexity?: 'low' | 'medium' | 'high';
  };
}

export interface UserPreferences {
  codeStyle: 'concise' | 'verbose' | 'documented';
  explanationLevel: 'minimal' | 'detailed' | 'comprehensive';
  framework: string;
  language: string;
  designSystem?: string;
  namingConvention: 'camelCase' | 'kebab-case' | 'snake_case';
  testingFramework?: string;
  preferredLibraries: string[];
}

export interface Pattern {
  id: string;
  description: string;
  frequency: number;
  successRate: number;
  context: string[];
  outcome: string;
  lastUsed: string;
}

export interface FailedAttempt {
  id: string;
  description: string;
  error: string;
  context: string[];
  timestamp: string;
  resolution?: string;
}

export interface ComponentInteraction {
  componentId: string;
  interactions: number;
  lastModified: string;
  commonRequests: string[];
  successfulChanges: CodeChange[];
}

export interface CodeChange {
  id: string;
  type: 'addition' | 'modification' | 'deletion' | 'refactor';
  description: string;
  filePath: string;
  lineNumbers?: [number, number];
  before?: string;
  after?: string;
  timestamp: string;
}

export interface SemanticConcept {
  name: string;
  category: string;
  relevance: number;
  context: string[];
  relatedTerms: string[];
}

export interface ConceptRelationship {
  from: string;
  to: string;
  type: 'is-a' | 'part-of' | 'related-to' | 'requires' | 'conflicts-with';
  strength: number;
}

export interface ContextWindow {
  maxTokens: number;
  currentTokens: number;
  messages: ContextMessage[];
  priority: 'high' | 'medium' | 'low';
}

class ContextManagementService {
  private contexts: Map<string, ConversationContext> = new Map();
  private maxContexts = 100;
  private maxShortTermMessages = 20;
  private maxLongTermPatterns = 50;
  private isInitialized = false;

  // Initialize the service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Load any persisted contexts
    await this.loadPersistedContexts();
    this.isInitialized = true;
    console.log('Context management service initialized');
  }

  // Create new conversation context
  async createContext(componentId: string, sessionId: string, userId?: string): Promise<ConversationContext> {
    await this.ensureInitialized();

    const contextId = this.generateId('context');
    const context: ConversationContext = {
      id: contextId,
      componentId,
      sessionId,
      userId,
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      state: {
        currentPhase: 'understanding',
        userIntent: '',
        requestType: 'functionality',
        confidence: 0,
        lastAction: 'context_created',
        pendingActions: [],
        codeChanges: [],
        errors: [],
        warnings: []
      },
      memory: {
        shortTerm: {
          recentMessages: [],
          currentFocus: '',
          activeVariables: {},
          temporaryData: {}
        },
        longTerm: {
          userPreferences: this.getDefaultUserPreferences(),
          successfulPatterns: [],
          failedAttempts: [],
          componentHistory: []
        },
        semantic: {
          concepts: [],
          relationships: [],
          keywords: [],
          topics: []
        }
      },
      metadata: {
        totalMessages: 0,
        totalTokens: 0,
        avgResponseTime: 0,
        successfulRequests: 0,
        failedRequests: 0
      }
    };

    this.contexts.set(contextId, context);
    await this.cleanupOldContexts();

    return context;
  }

  // Get existing context
  async getContext(contextId: string): Promise<ConversationContext | null> {
    await this.ensureInitialized();
    return this.contexts.get(contextId) || null;
  }

  // Update context with new message
  async addMessage(
    contextId: string,
    message: Omit<ContextMessage, 'id' | 'timestamp' | 'tokens'>
  ): Promise<void> {
    const context = await this.getContext(contextId);
    if (!context) return;

    const contextMessage: ContextMessage = {
      ...message,
      id: this.generateId('message'),
      timestamp: new Date().toISOString(),
      tokens: this.estimateTokens(message.content)
    };

    // Add to short-term memory
    context.memory.shortTerm.recentMessages.push(contextMessage);

    // Limit short-term memory size
    if (context.memory.shortTerm.recentMessages.length > this.maxShortTermMessages) {
      const removed = context.memory.shortTerm.recentMessages.shift();
      if (removed) {
        await this.archiveToLongTerm(context, removed);
      }
    }

    // Update metadata
    context.metadata.totalMessages++;
    context.metadata.totalTokens += contextMessage.tokens;
    context.lastActivity = new Date().toISOString();

    // Extract semantic information
    await this.extractSemanticInfo(context, contextMessage);

    // Update user intent if it's a user message
    if (message.role === 'user') {
      await this.updateUserIntent(context, message.content);
    }

    this.contexts.set(contextId, context);
  }

  // Update conversation state
  async updateState(contextId: string, stateUpdates: Partial<ConversationState>): Promise<void> {
    const context = await this.getContext(contextId);
    if (!context) return;

    context.state = { ...context.state, ...stateUpdates };
    context.lastActivity = new Date().toISOString();

    this.contexts.set(contextId, context);
  }

  // Add code change to context
  async addCodeChange(contextId: string, change: Omit<CodeChange, 'id' | 'timestamp'>): Promise<void> {
    const context = await this.getContext(contextId);
    if (!context) return;

    const codeChange: CodeChange = {
      ...change,
      id: this.generateId('change'),
      timestamp: new Date().toISOString()
    };

    context.state.codeChanges.push(codeChange);
    context.lastActivity = new Date().toISOString();

    // Add to long-term memory if successful
    if (change.type !== 'deletion') {
      const componentHistory = context.memory.longTerm.componentHistory
        .find(h => h.componentId === context.componentId);
      
      if (componentHistory) {
        componentHistory.successfulChanges.push(codeChange);
        componentHistory.lastModified = new Date().toISOString();
        componentHistory.interactions++;
      } else {
        context.memory.longTerm.componentHistory.push({
          componentId: context.componentId,
          interactions: 1,
          lastModified: new Date().toISOString(),
          commonRequests: [],
          successfulChanges: [codeChange]
        });
      }
    }

    this.contexts.set(contextId, context);
  }

  // Get context window for AI prompt
  async getContextWindow(contextId: string, maxTokens: number = 4000): Promise<ContextWindow> {
    const context = await this.getContext(contextId);
    if (!context) {
      return {
        maxTokens,
        currentTokens: 0,
        messages: [],
        priority: 'low'
      };
    }

    // Start with most recent messages
    const messages: ContextMessage[] = [];
    let currentTokens = 0;
    const recentMessages = [...context.memory.shortTerm.recentMessages].reverse();

    for (const message of recentMessages) {
      if (currentTokens + message.tokens > maxTokens) {
        break;
      }
      messages.unshift(message);
      currentTokens += message.tokens;
    }

    // Determine priority based on context state
    let priority: 'high' | 'medium' | 'low' = 'medium';
    if (context.state.errors.length > 0) {
      priority = 'high';
    } else if (context.state.confidence < 0.5) {
      priority = 'high';
    } else if (context.state.currentPhase === 'implementation') {
      priority = 'medium';
    }

    return {
      maxTokens,
      currentTokens,
      messages,
      priority
    };
  }

  // Get relevant patterns for current context
  async getRelevantPatterns(contextId: string, limit: number = 5): Promise<Pattern[]> {
    const context = await this.getContext(contextId);
    if (!context) return [];

    const patterns = context.memory.longTerm.successfulPatterns;
    const currentContext = [
      context.state.requestType,
      context.state.userIntent,
      context.componentId
    ];

    // Score patterns by relevance
    const scored = patterns.map(pattern => ({
      pattern,
      score: this.calculatePatternRelevance(pattern, currentContext)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.pattern);
  }

  // Update user preferences
  async updateUserPreferences(
    contextId: string, 
    preferences: Partial<UserPreferences>
  ): Promise<void> {
    const context = await this.getContext(contextId);
    if (!context) return;

    context.memory.longTerm.userPreferences = {
      ...context.memory.longTerm.userPreferences,
      ...preferences
    };

    this.contexts.set(contextId, context);
  }

  // Record successful pattern
  async recordSuccessfulPattern(
    contextId: string,
    description: string,
    outcome: string
  ): Promise<void> {
    const context = await this.getContext(contextId);
    if (!context) return;

    const pattern: Pattern = {
      id: this.generateId('pattern'),
      description,
      frequency: 1,
      successRate: 1.0,
      context: [context.state.requestType, context.state.userIntent],
      outcome,
      lastUsed: new Date().toISOString()
    };

    // Check if similar pattern exists
    const existing = context.memory.longTerm.successfulPatterns
      .find(p => p.description === description);

    if (existing) {
      existing.frequency++;
      existing.lastUsed = new Date().toISOString();
    } else {
      context.memory.longTerm.successfulPatterns.push(pattern);
    }

    // Limit pattern storage
    if (context.memory.longTerm.successfulPatterns.length > this.maxLongTermPatterns) {
      context.memory.longTerm.successfulPatterns.sort((a, b) => 
        b.frequency * b.successRate - a.frequency * a.successRate
      );
      context.memory.longTerm.successfulPatterns = 
        context.memory.longTerm.successfulPatterns.slice(0, this.maxLongTermPatterns);
    }

    context.metadata.successfulRequests++;
    this.contexts.set(contextId, context);
  }

  // Record failed attempt
  async recordFailedAttempt(
    contextId: string,
    description: string,
    error: string
  ): Promise<void> {
    const context = await this.getContext(contextId);
    if (!context) return;

    const attempt: FailedAttempt = {
      id: this.generateId('attempt'),
      description,
      error,
      context: [context.state.requestType, context.state.userIntent],
      timestamp: new Date().toISOString()
    };

    context.memory.longTerm.failedAttempts.push(attempt);
    context.state.errors.push(error);
    context.metadata.failedRequests++;

    this.contexts.set(contextId, context);
  }

  // Compress context to reduce memory usage
  async compressContext(contextId: string): Promise<void> {
    const context = await this.getContext(contextId);
    if (!context) return;

    // Compress short-term memory
    const messages = context.memory.shortTerm.recentMessages;
    if (messages.length > 10) {
      // Keep only the most important messages
      const important = messages.filter(m => 
        m.metadata.complexity === 'high' || 
        m.role === 'user' ||
        m.content.length > 500
      );
      
      context.memory.shortTerm.recentMessages = important.slice(-10);
    }

    // Compress semantic concepts
    const concepts = context.memory.semantic.concepts;
    context.memory.semantic.concepts = concepts
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20);

    this.contexts.set(contextId, context);
  }

  // Clear context
  async clearContext(contextId: string): Promise<void> {
    this.contexts.delete(contextId);
  }

  // Get context statistics
  async getContextStats(contextId: string): Promise<{
    messageCount: number;
    tokenCount: number;
    avgResponseTime: number;
    successRate: number;
    memoryUsage: {
      shortTerm: number;
      longTerm: number;
      semantic: number;
    };
  } | null> {
    const context = await this.getContext(contextId);
    if (!context) return null;

    const total = context.metadata.successfulRequests + context.metadata.failedRequests;
    const successRate = total > 0 ? context.metadata.successfulRequests / total : 0;

    return {
      messageCount: context.metadata.totalMessages,
      tokenCount: context.metadata.totalTokens,
      avgResponseTime: context.metadata.avgResponseTime,
      successRate,
      memoryUsage: {
        shortTerm: context.memory.shortTerm.recentMessages.length,
        longTerm: context.memory.longTerm.successfulPatterns.length + 
                 context.memory.longTerm.failedAttempts.length,
        semantic: context.memory.semantic.concepts.length + 
                 context.memory.semantic.relationships.length
      }
    };
  }

  // Private helper methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private getDefaultUserPreferences(): UserPreferences {
    return {
      codeStyle: 'concise',
      explanationLevel: 'detailed',
      framework: 'react',
      language: 'typescript',
      namingConvention: 'camelCase',
      preferredLibraries: []
    };
  }

  private async updateUserIntent(context: ConversationContext, content: string): Promise<void> {
    // Simple intent extraction - in real implementation would use NLP
    const keywords = content.toLowerCase().split(/\s+/);
    
    if (keywords.some(k => ['style', 'color', 'css', 'design'].includes(k))) {
      context.state.requestType = 'styling';
    } else if (keywords.some(k => ['function', 'feature', 'add', 'implement'].includes(k))) {
      context.state.requestType = 'functionality';
    } else if (keywords.some(k => ['structure', 'refactor', 'organize'].includes(k))) {
      context.state.requestType = 'structure';
    } else if (keywords.some(k => ['prop', 'property', 'interface'].includes(k))) {
      context.state.requestType = 'props';
    } else if (keywords.some(k => ['bug', 'error', 'fix', 'debug'].includes(k))) {
      context.state.requestType = 'debug';
    }

    context.state.userIntent = content;
    context.state.confidence = Math.min(1, keywords.length / 10);
  }

  private async extractSemanticInfo(
    context: ConversationContext, 
    message: ContextMessage
  ): Promise<void> {
    // Simple semantic extraction
    const words = message.content.toLowerCase().split(/\s+/);
    const concepts = ['react', 'component', 'state', 'props', 'hook', 'css', 'javascript', 'typescript'];
    
    for (const concept of concepts) {
      if (words.includes(concept)) {
        const existing = context.memory.semantic.concepts.find(c => c.name === concept);
        if (existing) {
          existing.relevance = Math.min(1, existing.relevance + 0.1);
        } else {
          context.memory.semantic.concepts.push({
            name: concept,
            category: 'technology',
            relevance: 0.1,
            context: [message.role],
            relatedTerms: []
          });
        }
      }
    }

    // Extract keywords
    const newKeywords = words.filter(w => w.length > 3 && !['the', 'and', 'for', 'with'].includes(w));
    context.memory.semantic.keywords.push(...newKeywords.slice(0, 5));
    
    // Keep only unique keywords, limit to 50
    context.memory.semantic.keywords = [...new Set(context.memory.semantic.keywords)].slice(0, 50);
  }

  private async archiveToLongTerm(
    context: ConversationContext, 
    message: ContextMessage
  ): Promise<void> {
    // Archive important information to long-term memory
    if (message.role === 'user' && message.metadata.complexity === 'high') {
      // Store as a pattern if it led to successful outcome
      // This would be called when we know the outcome
    }
  }

  private calculatePatternRelevance(pattern: Pattern, currentContext: string[]): number {
    let score = 0;
    
    // Context overlap
    const overlap = pattern.context.filter(c => currentContext.includes(c)).length;
    score += (overlap / pattern.context.length) * 0.4;
    
    // Frequency and success rate
    score += (pattern.frequency / 100) * 0.3;
    score += pattern.successRate * 0.3;
    
    return score;
  }

  private async loadPersistedContexts(): Promise<void> {
    // In a real implementation, this would load from persistent storage
    console.log('Loading persisted contexts...');
  }

  private async cleanupOldContexts(): Promise<void> {
    if (this.contexts.size <= this.maxContexts) return;

    // Remove oldest contexts
    const contexts = Array.from(this.contexts.entries())
      .sort((a, b) => new Date(a[1].lastActivity).getTime() - new Date(b[1].lastActivity).getTime());

    const toRemove = contexts.slice(0, contexts.length - this.maxContexts);
    toRemove.forEach(([id]) => this.contexts.delete(id));
  }
}

// Export singleton instance
export const contextManagementService = new ContextManagementService();
export default ContextManagementService;