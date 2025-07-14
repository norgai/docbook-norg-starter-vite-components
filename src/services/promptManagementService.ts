// Prompt Management Service
// Handles AI prompt templates, dynamic generation, and context-aware prompt selection

export interface PromptTemplate {
  id: string;
  name: string;
  category: 'component' | 'styling' | 'functionality' | 'structure' | 'debug' | 'review';
  description: string;
  template: string;
  variables: PromptVariable[];
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usage: {
    totalUses: number;
    successRate: number;
    averageResponseTime: number;
    lastUsed?: string;
  };
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    framework: string[];
    language: string[];
  };
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
}

export interface PromptContext {
  componentId: string;
  conversationId: string;
  userIntent: string;
  requestType: 'styling' | 'functionality' | 'structure' | 'props' | 'debug';
  currentState: {
    componentCode?: string;
    framework: string;
    language: string;
    dependencies: string[];
    version: string;
  };
  history: {
    previousRequests: string[];
    successfulPatterns: string[];
    failedAttempts: string[];
  };
  userPreferences: {
    codeStyle?: 'concise' | 'verbose' | 'documented';
    explanationLevel?: 'minimal' | 'detailed' | 'comprehensive';
    framework?: string;
    designSystem?: string;
  };
}

export interface GeneratedPrompt {
  id: string;
  templateId: string;
  content: string;
  variables: Record<string, any>;
  context: PromptContext;
  metadata: {
    generatedAt: string;
    estimatedTokens: number;
    confidence: number;
    fallbackUsed: boolean;
  };
}

class PromptManagementService {
  private templates: Map<string, PromptTemplate> = new Map();
  private promptHistory: GeneratedPrompt[] = [];
  private isInitialized = false;

  // Initialize with default templates
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadDefaultTemplates();
    this.isInitialized = true;
    console.log('Prompt management service initialized');
  }

  // Generate prompt based on context
  async generatePrompt(context: PromptContext, templateId?: string): Promise<GeneratedPrompt> {
    await this.ensureInitialized();

    // Select appropriate template
    const template = templateId 
      ? this.templates.get(templateId)
      : await this.selectBestTemplate(context);

    if (!template) {
      throw new Error('No suitable template found for the given context');
    }

    // Extract variables from context
    const variables = await this.extractVariables(template, context);

    // Generate prompt content
    const content = await this.interpolateTemplate(template, variables, context);

    // Create generated prompt
    const generatedPrompt: GeneratedPrompt = {
      id: this.generateId('prompt'),
      templateId: template.id,
      content,
      variables,
      context,
      metadata: {
        generatedAt: new Date().toISOString(),
        estimatedTokens: this.estimateTokens(content),
        confidence: await this.calculateConfidence(template, context),
        fallbackUsed: false
      }
    };

    // Store in history
    this.promptHistory.push(generatedPrompt);
    
    // Update template usage statistics
    await this.updateTemplateUsage(template.id);

    return generatedPrompt;
  }

  // Select best template based on context
  private async selectBestTemplate(context: PromptContext): Promise<PromptTemplate | null> {
    const candidates = Array.from(this.templates.values())
      .filter(template => template.isActive)
      .filter(template => this.matchesContext(template, context));

    if (candidates.length === 0) {
      return this.getFallbackTemplate(context);
    }

    // Score templates based on relevance
    const scored = candidates.map(template => ({
      template,
      score: this.scoreTemplate(template, context)
    }));

    // Sort by score and return best match
    scored.sort((a, b) => b.score - a.score);
    return scored[0].template;
  }

  // Score template relevance to context
  private scoreTemplate(template: PromptTemplate, context: PromptContext): number {
    let score = 0;

    // Category match
    if (template.category === context.requestType) {
      score += 40;
    }

    // Framework compatibility
    if (template.metadata.framework.includes(context.currentState.framework)) {
      score += 20;
    }

    // Language compatibility
    if (template.metadata.language.includes(context.currentState.language)) {
      score += 15;
    }

    // Usage success rate
    score += template.usage.successRate * 15;

    // Recency bonus
    if (template.usage.lastUsed) {
      const daysSinceUse = (Date.now() - new Date(template.usage.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - daysSinceUse);
    }

    return score;
  }

  // Check if template matches context
  private matchesContext(template: PromptTemplate, context: PromptContext): boolean {
    // Check framework compatibility
    if (template.metadata.framework.length > 0 && 
        !template.metadata.framework.includes(context.currentState.framework)) {
      return false;
    }

    // Check language compatibility
    if (template.metadata.language.length > 0 && 
        !template.metadata.language.includes(context.currentState.language)) {
      return false;
    }

    return true;
  }

  // Extract variables from context for template
  private async extractVariables(
    template: PromptTemplate, 
    context: PromptContext
  ): Promise<Record<string, any>> {
    const variables: Record<string, any> = {};

    for (const variable of template.variables) {
      let value = await this.extractVariableValue(variable, context);

      // Apply default if no value found
      if (value === undefined && variable.defaultValue !== undefined) {
        value = variable.defaultValue;
      }

      // Validate required variables
      if (variable.required && value === undefined) {
        throw new Error(`Required variable '${variable.name}' not found in context`);
      }

      if (value !== undefined) {
        variables[variable.name] = value;
      }
    }

    return variables;
  }

  // Extract single variable value from context
  private async extractVariableValue(
    variable: PromptVariable, 
    context: PromptContext
  ): Promise<any> {
    switch (variable.name) {
      case 'componentName':
        return context.componentId;
      case 'framework':
        return context.currentState.framework;
      case 'language':
        return context.currentState.language;
      case 'currentCode':
        return context.currentState.componentCode;
      case 'userIntent':
        return context.userIntent;
      case 'requestType':
        return context.requestType;
      case 'dependencies':
        return context.currentState.dependencies.join(', ');
      case 'previousRequests':
        return context.history.previousRequests.slice(-3).join('\n');
      case 'codeStyle':
        return context.userPreferences.codeStyle || 'concise';
      case 'explanationLevel':
        return context.userPreferences.explanationLevel || 'detailed';
      default:
        return undefined;
    }
  }

  // Interpolate template with variables
  private async interpolateTemplate(
    template: PromptTemplate,
    variables: Record<string, any>,
    context: PromptContext
  ): Promise<string> {
    let content = template.template;

    // Replace variables
    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      content = content.replace(pattern, String(value));
    }

    // Handle conditional sections
    content = await this.processConditionals(content, variables, context);

    // Handle loops
    content = await this.processLoops(content, variables);

    // Clean up any remaining placeholders
    content = content.replace(/\{\{[^}]+\}\}/g, '');

    return content.trim();
  }

  // Process conditional sections in template
  private async processConditionals(
    content: string,
    variables: Record<string, any>,
    context: PromptContext
  ): Promise<string> {
    // Handle {{#if condition}} ... {{/if}} blocks
    const ifPattern = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\s*\/if\s*\}\}/g;
    
    return content.replace(ifPattern, (_match, condition, block) => {
      if (this.evaluateCondition(condition, variables, context)) {
        return block;
      }
      return '';
    });
  }

  // Process loop sections in template
  private async processLoops(content: string, variables: Record<string, any>): Promise<string> {
    // Handle {{#each array}} ... {{/each}} blocks
    const eachPattern = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\s*\/each\s*\}\}/g;
    
    return content.replace(eachPattern, (_match, arrayName, block) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) {
        return '';
      }

      return array.map((item, index) => {
        return block
          .replace(/\{\{\s*this\s*\}\}/g, String(item))
          .replace(/\{\{\s*@index\s*\}\}/g, String(index));
      }).join('\n');
    });
  }

  // Evaluate conditional expression
  private evaluateCondition(
    condition: string,
    variables: Record<string, any>,
    _context: PromptContext
  ): boolean {
    // Simple condition evaluation
    const trimmed = condition.trim();
    
    // Check for variable existence
    if (variables.hasOwnProperty(trimmed)) {
      return Boolean(variables[trimmed]);
    }

    // Check for equality
    const equalityMatch = trimmed.match(/^(.+?)\s*===?\s*(.+)$/);
    if (equalityMatch) {
      const [, left, right] = equalityMatch;
      const leftValue = variables[left.trim()] || left.trim();
      const rightValue = right.trim().replace(/['"]/g, '');
      return leftValue === rightValue;
    }

    return false;
  }

  // Get fallback template for context
  private getFallbackTemplate(_context: PromptContext): PromptTemplate | null {
    // Return a generic template based on request type
    const fallbackTemplates = Array.from(this.templates.values())
      .filter(t => t.name.includes('fallback') || t.name.includes('generic'));
    
    return fallbackTemplates[0] || null;
  }

  // Calculate confidence score for template selection
  private async calculateConfidence(template: PromptTemplate, context: PromptContext): Promise<number> {
    let confidence = 0.5; // Base confidence

    // Template usage success rate
    confidence += (template.usage.successRate - 0.5) * 0.3;

    // Context match quality
    const matchScore = this.scoreTemplate(template, context) / 100;
    confidence += matchScore * 0.3;

    // Variable completeness
    const requiredVars = template.variables.filter(v => v.required).length;
    // Calculate provided variables synchronously for now
    const providedVars = template.variables.length;
    confidence += (providedVars / Math.max(1, requiredVars)) * 0.2;

    return Math.min(1, Math.max(0, confidence));
  }

  // Estimate token count for prompt
  private estimateTokens(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  // Update template usage statistics
  private async updateTemplateUsage(templateId: string): Promise<void> {
    const template = this.templates.get(templateId);
    if (!template) return;

    template.usage.totalUses += 1;
    template.usage.lastUsed = new Date().toISOString();
    
    // Update template
    this.templates.set(templateId, template);
  }

  // Template CRUD operations
  async createTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromptTemplate> {
    const newTemplate: PromptTemplate = {
      ...template,
      id: this.generateId('template'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  async getTemplate(templateId: string): Promise<PromptTemplate | null> {
    await this.ensureInitialized();
    return this.templates.get(templateId) || null;
  }

  async updateTemplate(templateId: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const updated = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.templates.set(templateId, updated);
    return updated;
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    return this.templates.delete(templateId);
  }

  async listTemplates(filters?: {
    category?: string;
    isActive?: boolean;
    framework?: string;
    tags?: string[];
  }): Promise<PromptTemplate[]> {
    await this.ensureInitialized();
    
    let templates = Array.from(this.templates.values());

    if (filters) {
      if (filters.category) {
        templates = templates.filter(t => t.category === filters.category);
      }
      if (filters.isActive !== undefined) {
        templates = templates.filter(t => t.isActive === filters.isActive);
      }
      if (filters.framework) {
        templates = templates.filter(t => t.metadata.framework.includes(filters.framework!));
      }
      if (filters.tags) {
        templates = templates.filter(t => 
          filters.tags!.some(tag => t.metadata.tags.includes(tag))
        );
      }
    }

    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get prompt generation history
  async getPromptHistory(limit: number = 50): Promise<GeneratedPrompt[]> {
    return this.promptHistory
      .slice(-limit)
      .reverse(); // Most recent first
  }

  // Clear prompt history
  async clearPromptHistory(): Promise<void> {
    this.promptHistory = [];
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

  // Load default templates
  private async loadDefaultTemplates(): Promise<void> {
    const defaultTemplates: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Component Styling Request',
        category: 'styling',
        description: 'Template for styling modification requests',
        template: `You are an expert React developer helping to modify a {{framework}} component.

Component: {{componentName}}
Request Type: {{requestType}}
User Intent: {{userIntent}}

Current Component Code:
\`\`\`{{language}}
{{currentCode}}
\`\`\`

{{#if previousRequests}}
Previous Requests:
{{previousRequests}}
{{/if}}

Please modify the component styling to fulfill the user's request. Follow these guidelines:
- Use {{codeStyle}} code style
- Maintain component functionality
- Use modern CSS practices
- Ensure responsive design
- Follow {{framework}} best practices

{{#if explanationLevel === 'detailed'}}
Please provide detailed explanations for your changes.
{{/if}}

Return the modified component code and explain the changes made.`,
        variables: [
          { name: 'componentName', type: 'string', description: 'Name of the component', required: true },
          { name: 'framework', type: 'string', description: 'Frontend framework', required: true },
          { name: 'language', type: 'string', description: 'Programming language', required: true },
          { name: 'currentCode', type: 'string', description: 'Current component code', required: true },
          { name: 'userIntent', type: 'string', description: 'What the user wants to achieve', required: true },
          { name: 'requestType', type: 'string', description: 'Type of request', required: true },
          { name: 'previousRequests', type: 'string', description: 'Previous conversation context', required: false },
          { name: 'codeStyle', type: 'string', description: 'Preferred code style', required: false, defaultValue: 'concise' },
          { name: 'explanationLevel', type: 'string', description: 'Level of explanation needed', required: false, defaultValue: 'detailed' }
        ],
        version: '1.0.0',
        isActive: true,
        usage: {
          totalUses: 0,
          successRate: 0.85,
          averageResponseTime: 2500
        },
        metadata: {
          difficulty: 'intermediate',
          tags: ['styling', 'css', 'responsive'],
          framework: ['react', 'vue', 'angular'],
          language: ['typescript', 'javascript']
        }
      },
      {
        name: 'Component Functionality Enhancement',
        category: 'functionality',
        description: 'Template for adding new functionality to components',
        template: `You are an expert {{framework}} developer. Help enhance this component with new functionality.

Component: {{componentName}}
Current Functionality: {{currentCode}}

User Request: {{userIntent}}

Requirements:
- Add the requested functionality
- Maintain existing behavior
- Follow {{framework}} patterns
- Use TypeScript best practices
- Include proper error handling

{{#if dependencies}}
Available Dependencies: {{dependencies}}
{{/if}}

{{#if previousRequests}}
Context from previous requests:
{{previousRequests}}
{{/if}}

Please implement the enhancement and explain your approach.`,
        variables: [
          { name: 'componentName', type: 'string', description: 'Component name', required: true },
          { name: 'framework', type: 'string', description: 'Framework being used', required: true },
          { name: 'currentCode', type: 'string', description: 'Current component code', required: true },
          { name: 'userIntent', type: 'string', description: 'Functionality to add', required: true },
          { name: 'dependencies', type: 'string', description: 'Available dependencies', required: false },
          { name: 'previousRequests', type: 'string', description: 'Previous context', required: false }
        ],
        version: '1.0.0',
        isActive: true,
        usage: {
          totalUses: 0,
          successRate: 0.80,
          averageResponseTime: 3000
        },
        metadata: {
          difficulty: 'advanced',
          tags: ['functionality', 'features', 'enhancement'],
          framework: ['react', 'vue'],
          language: ['typescript', 'javascript']
        }
      },
      {
        name: 'Component Structure Refactoring',
        category: 'structure',
        description: 'Template for restructuring component architecture',
        template: `As a senior {{framework}} architect, help refactor this component structure.

Component: {{componentName}}
Current Structure:
\`\`\`{{language}}
{{currentCode}}
\`\`\`

Refactoring Goal: {{userIntent}}

Please refactor the component to:
- Improve code organization
- Enhance reusability
- Follow SOLID principles
- Maintain type safety
- Optimize performance

{{#if codeStyle === 'documented'}}
Include comprehensive documentation for the refactored code.
{{/if}}

Provide the refactored code with explanations of the structural improvements.`,
        variables: [
          { name: 'componentName', type: 'string', description: 'Component name', required: true },
          { name: 'framework', type: 'string', description: 'Framework', required: true },
          { name: 'language', type: 'string', description: 'Language', required: true },
          { name: 'currentCode', type: 'string', description: 'Current code', required: true },
          { name: 'userIntent', type: 'string', description: 'Refactoring goal', required: true },
          { name: 'codeStyle', type: 'string', description: 'Code style preference', required: false }
        ],
        version: '1.0.0',
        isActive: true,
        usage: {
          totalUses: 0,
          successRate: 0.75,
          averageResponseTime: 3500
        },
        metadata: {
          difficulty: 'advanced',
          tags: ['refactoring', 'architecture', 'structure'],
          framework: ['react', 'vue', 'angular'],
          language: ['typescript', 'javascript']
        }
      },
      {
        name: 'Generic Component Assistant',
        category: 'component',
        description: 'Fallback template for general component assistance',
        template: `I'm here to help with your {{framework}} component development.

Component: {{componentName}}
Request: {{userIntent}}

{{#if currentCode}}
Current Code:
\`\`\`{{language}}
{{currentCode}}
\`\`\`
{{/if}}

I'll assist you with this {{requestType}} request. Let me analyze your needs and provide the best solution.

Please let me know if you need any clarification or have additional requirements.`,
        variables: [
          { name: 'componentName', type: 'string', description: 'Component name', required: true },
          { name: 'framework', type: 'string', description: 'Framework', required: true },
          { name: 'language', type: 'string', description: 'Language', required: false, defaultValue: 'typescript' },
          { name: 'userIntent', type: 'string', description: 'User request', required: true },
          { name: 'requestType', type: 'string', description: 'Type of request', required: true },
          { name: 'currentCode', type: 'string', description: 'Current code', required: false }
        ],
        version: '1.0.0',
        isActive: true,
        usage: {
          totalUses: 0,
          successRate: 0.70,
          averageResponseTime: 2000
        },
        metadata: {
          difficulty: 'beginner',
          tags: ['general', 'fallback', 'assistance'],
          framework: ['react', 'vue', 'angular'],
          language: ['typescript', 'javascript']
        }
      }
    ];

    // Create templates
    for (const templateData of defaultTemplates) {
      await this.createTemplate(templateData);
    }

    console.log(`Loaded ${defaultTemplates.length} default prompt templates`);
  }
}

// Export singleton instance
export const promptManagementService = new PromptManagementService();
export default PromptManagementService;