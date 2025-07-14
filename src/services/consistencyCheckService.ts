// Consistency Check Service
// Validates and ensures consistency across AI interactions, workflows, and system state

export interface ConsistencyRule {
  id: string;
  name: string;
  description: string;
  category: 'prompt' | 'context' | 'workflow' | 'code' | 'data' | 'ui';
  severity: 'low' | 'medium' | 'high' | 'critical';
  checkFunction: string; // Function name or expression
  parameters: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  metadata: {
    frequency: number;
    lastPassed: string;
    lastFailed: string;
    successRate: number;
  };
}

export interface ConsistencyCheck {
  id: string;
  ruleId: string;
  ruleName: string;
  target: ConsistencyTarget;
  result: ConsistencyResult;
  timestamp: string;
  duration: number;
  context: Record<string, any>;
}

export interface ConsistencyTarget {
  type: 'prompt' | 'context' | 'workflow' | 'component' | 'conversation' | 'system';
  id: string;
  name: string;
  metadata: Record<string, any>;
}

export interface ConsistencyResult {
  passed: boolean;
  score: number; // 0-1
  issues: ConsistencyIssue[];
  suggestions: string[];
  autoFixApplied: boolean;
  details: Record<string, any>;
}

export interface ConsistencyIssue {
  type: 'missing' | 'invalid' | 'inconsistent' | 'deprecated' | 'conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  field: string;
  expected: any;
  actual: any;
  message: string;
  fixable: boolean;
  suggestedFix?: string;
}

export interface ConsistencyReport {
  id: string;
  timestamp: string;
  scope: 'component' | 'conversation' | 'workflow' | 'system';
  targetId: string;
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    overallScore: number;
    criticalIssues: number;
  };
  checks: ConsistencyCheck[];
  recommendations: string[];
  autoFixesApplied: number;
}

export interface AutoFixRule {
  id: string;
  name: string;
  description: string;
  ruleId: string; // Associated consistency rule
  conditions: AutoFixCondition[];
  actions: AutoFixAction[];
  isActive: boolean;
  requiresApproval: boolean;
  metadata: {
    timesApplied: number;
    successRate: number;
    lastApplied: string;
  };
}

export interface AutoFixCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'exists' | 'range';
  value: any;
  required: boolean;
}

export interface AutoFixAction {
  type: 'set' | 'append' | 'remove' | 'replace' | 'transform';
  field: string;
  value?: any;
  expression?: string;
  condition?: string;
}

class ConsistencyCheckService {
  private rules: Map<string, ConsistencyRule> = new Map();
  private autoFixRules: Map<string, AutoFixRule> = new Map();
  private checkHistory: ConsistencyCheck[] = [];
  private reports: Map<string, ConsistencyReport> = new Map();
  private isInitialized = false;

  // Initialize with default rules
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadDefaultRules();
    await this.loadDefaultAutoFixRules();
    this.isInitialized = true;
    console.log('Consistency check service initialized');
  }

  // Run consistency check on target
  async runConsistencyCheck(target: ConsistencyTarget): Promise<ConsistencyReport> {
    await this.ensureInitialized();

    const reportId = this.generateId('report');
    const checks: ConsistencyCheck[] = [];
    let autoFixesApplied = 0;

    // Get applicable rules for target type
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => rule.isActive && this.isRuleApplicable(rule, target));

    console.log(`Running ${applicableRules.length} consistency checks for ${target.type}:${target.id}`);

    // Run each applicable rule
    for (const rule of applicableRules) {
      try {
        const check = await this.executeRule(rule, target);
        checks.push(check);

        // Apply auto-fixes if available and check failed
        if (!check.result.passed) {
          const fixApplied = await this.tryAutoFix(rule, target, check);
          if (fixApplied) {
            autoFixesApplied++;
            check.result.autoFixApplied = true;
          }
        }

        // Update rule metadata
        await this.updateRuleMetadata(rule, check.result.passed);

      } catch (error: any) {
        console.error(`Failed to execute consistency rule ${rule.name}:`, error);
        
        // Create error check result
        const errorCheck: ConsistencyCheck = {
          id: this.generateId('check'),
          ruleId: rule.id,
          ruleName: rule.name,
          target,
          result: {
            passed: false,
            score: 0,
            issues: [{
              type: 'invalid',
              severity: 'high',
              field: 'execution',
              expected: 'successful execution',
              actual: error.message,
              message: `Rule execution failed: ${error.message}`,
              fixable: false
            }],
            suggestions: ['Review rule configuration'],
            autoFixApplied: false,
            details: { error: error.message }
          },
          timestamp: new Date().toISOString(),
          duration: 0,
          context: {}
        };
        checks.push(errorCheck);
      }
    }

    // Generate report
    const report = this.generateReport(reportId, target, checks, autoFixesApplied);
    this.reports.set(reportId, report);

    // Store checks in history
    this.checkHistory.push(...checks);
    
    // Limit history size
    if (this.checkHistory.length > 1000) {
      this.checkHistory = this.checkHistory.slice(-1000);
    }

    return report;
  }

  // Execute individual consistency rule
  private async executeRule(rule: ConsistencyRule, target: ConsistencyTarget): Promise<ConsistencyCheck> {
    const startTime = Date.now();
    const checkId = this.generateId('check');

    try {
      const result = await this.runRuleCheck(rule, target);
      
      return {
        id: checkId,
        ruleId: rule.id,
        ruleName: rule.name,
        target,
        result,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        context: rule.parameters
      };
    } catch (error: any) {
      return {
        id: checkId,
        ruleId: rule.id,
        ruleName: rule.name,
        target,
        result: {
          passed: false,
          score: 0,
          issues: [{
            type: 'invalid',
            severity: rule.severity,
            field: 'execution',
            expected: 'valid result',
            actual: error.message,
            message: `Check execution failed: ${error.message}`,
            fixable: false
          }],
          suggestions: [],
          autoFixApplied: false,
          details: { error: error.message }
        },
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        context: rule.parameters
      };
    }
  }

  // Run the actual rule check logic
  private async runRuleCheck(rule: ConsistencyRule, target: ConsistencyTarget): Promise<ConsistencyResult> {
    switch (rule.checkFunction) {
      case 'checkPromptVariables':
        return await this.checkPromptVariables(rule, target);
      case 'checkContextIntegrity':
        return await this.checkContextIntegrity(rule, target);
      case 'checkWorkflowStepOrder':
        return await this.checkWorkflowStepOrder(rule, target);
      case 'checkCodeConsistency':
        return await this.checkCodeConsistency(rule, target);
      case 'checkDataIntegrity':
        return await this.checkDataIntegrity(rule, target);
      case 'checkUIConsistency':
        return await this.checkUIConsistency(rule, target);
      default:
        throw new Error(`Unknown check function: ${rule.checkFunction}`);
    }
  }

  // Specific consistency check implementations
  private async checkPromptVariables(rule: ConsistencyRule, target: ConsistencyTarget): Promise<ConsistencyResult> {
    const issues: ConsistencyIssue[] = [];
    const suggestions: string[] = [];
    let score = 1.0;

    // Mock prompt variable validation
    const requiredVars = rule.parameters.requiredVariables || [];
    const providedVars = target.metadata.variables || {};

    for (const varName of requiredVars) {
      if (!providedVars.hasOwnProperty(varName)) {
        issues.push({
          type: 'missing',
          severity: 'high',
          field: `variable.${varName}`,
          expected: 'defined variable',
          actual: 'undefined',
          message: `Required variable '${varName}' is missing`,
          fixable: true,
          suggestedFix: `Add variable '${varName}' to prompt context`
        });
        score -= 0.2;
      }
    }

    // Check variable types
    for (const [varName, value] of Object.entries(providedVars)) {
      const expectedType = rule.parameters.variableTypes?.[varName];
      if (expectedType && typeof value !== expectedType) {
        issues.push({
          type: 'invalid',
          severity: 'medium',
          field: `variable.${varName}.type`,
          expected: expectedType,
          actual: typeof value,
          message: `Variable '${varName}' has incorrect type`,
          fixable: true,
          suggestedFix: `Convert '${varName}' to ${expectedType}`
        });
        score -= 0.1;
      }
    }

    if (issues.length === 0) {
      suggestions.push('Prompt variables are properly configured');
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      suggestions,
      autoFixApplied: false,
      details: { checkedVariables: Object.keys(providedVars) }
    };
  }

  private async checkContextIntegrity(rule: ConsistencyRule, target: ConsistencyTarget): Promise<ConsistencyResult> {
    const issues: ConsistencyIssue[] = [];
    const suggestions: string[] = [];
    let score = 1.0;

    // Check context completeness
    const requiredFields = rule.parameters.requiredFields || [];
    const context = target.metadata.context || {};

    for (const field of requiredFields) {
      if (!context[field]) {
        issues.push({
          type: 'missing',
          severity: 'medium',
          field: `context.${field}`,
          expected: 'defined value',
          actual: 'undefined',
          message: `Required context field '${field}' is missing`,
          fixable: true,
          suggestedFix: `Initialize '${field}' in context`
        });
        score -= 0.15;
      }
    }

    // Check context consistency
    if (context.userIntent && context.requestType) {
      const intentKeywords = context.userIntent.toLowerCase().split(' ');
      const typeKeywords = this.getRequestTypeKeywords(context.requestType);
      
      const hasMatch = intentKeywords.some((keyword: string) => typeKeywords.includes(keyword));
      if (!hasMatch) {
        issues.push({
          type: 'inconsistent',
          severity: 'medium',
          field: 'context.intentTypeAlignment',
          expected: 'aligned intent and type',
          actual: 'misaligned',
          message: 'User intent does not match request type',
          fixable: true,
          suggestedFix: 'Re-evaluate request type based on user intent'
        });
        score -= 0.2;
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      suggestions: issues.length === 0 ? ['Context integrity is maintained'] : suggestions,
      autoFixApplied: false,
      details: { contextFields: Object.keys(context) }
    };
  }

  private async checkWorkflowStepOrder(_rule: ConsistencyRule, target: ConsistencyTarget): Promise<ConsistencyResult> {
    const issues: ConsistencyIssue[] = [];
    const suggestions: string[] = [];
    let score = 1.0;

    const steps = target.metadata.steps || [];
    
    // Check step order
    for (let i = 1; i < steps.length; i++) {
      if (steps[i].order <= steps[i - 1].order) {
        issues.push({
          type: 'invalid',
          severity: 'high',
          field: `step.${steps[i].id}.order`,
          expected: `> ${steps[i - 1].order}`,
          actual: steps[i].order,
          message: `Step order is not sequential`,
          fixable: true,
          suggestedFix: 'Reorder workflow steps'
        });
        score -= 0.3;
      }
    }

    // Check dependency consistency
    for (const step of steps) {
      for (const depId of step.dependencies || []) {
        const depStep = steps.find((s: any) => s.id === depId);
        if (!depStep) {
          issues.push({
            type: 'missing',
            severity: 'high',
            field: `step.${step.id}.dependency.${depId}`,
            expected: 'existing step',
            actual: 'missing step',
            message: `Step dependency '${depId}' not found`,
            fixable: true,
            suggestedFix: 'Remove invalid dependency or add missing step'
          });
          score -= 0.25;
        } else if (depStep.order >= step.order) {
          issues.push({
            type: 'invalid',
            severity: 'high',
            field: `step.${step.id}.dependency.${depId}`,
            expected: 'earlier step',
            actual: 'later or same order step',
            message: `Step dependency has invalid order`,
            fixable: true,
            suggestedFix: 'Reorder steps to respect dependencies'
          });
          score -= 0.25;
        }
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      suggestions: issues.length === 0 ? ['Workflow step order is correct'] : suggestions,
      autoFixApplied: false,
      details: { stepCount: steps.length }
    };
  }

  private async checkCodeConsistency(_rule: ConsistencyRule, target: ConsistencyTarget): Promise<ConsistencyResult> {
    const issues: ConsistencyIssue[] = [];
    const suggestions: string[] = [];
    let score = 1.0;

    const code = target.metadata.code || '';
    const framework = target.metadata.framework || 'react';

    // Check framework consistency
    if (framework === 'react') {
      if (!code.includes('import React') && !code.includes('import {') && code.includes('jsx')) {
        issues.push({
          type: 'missing',
          severity: 'medium',
          field: 'code.reactImport',
          expected: 'React import statement',
          actual: 'missing import',
          message: 'React import statement missing',
          fixable: true,
          suggestedFix: "Add 'import React from \"react\"'"
        });
        score -= 0.1;
      }

      // Check component naming
      const componentMatch = code.match(/export\s+(?:default\s+)?function\s+(\w+)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
          issues.push({
            type: 'invalid',
            severity: 'low',
            field: 'code.componentNaming',
            expected: 'PascalCase naming',
            actual: componentName,
            message: 'Component name should use PascalCase',
            fixable: true,
            suggestedFix: 'Rename component to use PascalCase'
          });
          score -= 0.05;
        }
      }
    }

    // Check TypeScript consistency
    if (target.metadata.language === 'typescript') {
      if (!code.includes('interface') && !code.includes('type') && code.includes('Props')) {
        issues.push({
          type: 'missing',
          severity: 'medium',
          field: 'code.typeDefinitions',
          expected: 'TypeScript type definitions',
          actual: 'missing types',
          message: 'TypeScript props interface missing',
          fixable: true,
          suggestedFix: 'Add props interface definition'
        });
        score -= 0.15;
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      suggestions: issues.length === 0 ? ['Code consistency is maintained'] : suggestions,
      autoFixApplied: false,
      details: { codeLength: code.length, framework, language: target.metadata.language }
    };
  }

  private async checkDataIntegrity(rule: ConsistencyRule, target: ConsistencyTarget): Promise<ConsistencyResult> {
    const issues: ConsistencyIssue[] = [];
    let score = 1.0;

    // Check data structure integrity
    const data = target.metadata.data || {};
    const schema = rule.parameters.schema || {};

    for (const [field, requirements] of Object.entries(schema)) {
      const value = data[field];
      const req = requirements as any;
      
      if (req.required && (value === undefined || value === null)) {
        issues.push({
          type: 'missing',
          severity: 'high',
          field: `data.${field}`,
          expected: 'defined value',
          actual: 'undefined/null',
          message: `Required field '${field}' is missing`,
          fixable: true,
          suggestedFix: `Provide value for '${field}'`
        });
        score -= 0.2;
      }

      if (value !== undefined && req.type && typeof value !== req.type) {
        issues.push({
          type: 'invalid',
          severity: 'medium',
          field: `data.${field}.type`,
          expected: req.type,
          actual: typeof value,
          message: `Field '${field}' has incorrect type`,
          fixable: true,
          suggestedFix: `Convert '${field}' to ${req.type}`
        });
        score -= 0.15;
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      suggestions: [],
      autoFixApplied: false,
      details: { dataFields: Object.keys(data) }
    };
  }

  private async checkUIConsistency(rule: ConsistencyRule, target: ConsistencyTarget): Promise<ConsistencyResult> {
    const issues: ConsistencyIssue[] = [];
    let score = 1.0;

    const uiElements = target.metadata.uiElements || {};
    const designSystem = rule.parameters.designSystem || {};

    // Check color consistency
    if (designSystem.colors && uiElements.colors) {
      for (const [element, color] of Object.entries(uiElements.colors)) {
        if (!designSystem.colors.includes(color)) {
          issues.push({
            type: 'inconsistent',
            severity: 'low',
            field: `ui.${element}.color`,
            expected: 'design system color',
            actual: color,
            message: `Color '${color}' not in design system`,
            fixable: true,
            suggestedFix: 'Use design system color'
          });
          score -= 0.05;
        }
      }
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      suggestions: [],
      autoFixApplied: false,
      details: { uiElementCount: Object.keys(uiElements).length }
    };
  }

  // Try to apply auto-fixes
  private async tryAutoFix(
    rule: ConsistencyRule, 
    target: ConsistencyTarget, 
    check: ConsistencyCheck
  ): Promise<boolean> {
    const autoFixRule = Array.from(this.autoFixRules.values())
      .find(fix => fix.ruleId === rule.id && fix.isActive);

    if (!autoFixRule) return false;

    // Check if auto-fix conditions are met
    const conditionsMet = autoFixRule.conditions.every(condition => 
      this.evaluateAutoFixCondition(condition, check)
    );

    if (!conditionsMet) return false;

    // Apply auto-fix actions
    try {
      for (const action of autoFixRule.actions) {
        await this.applyAutoFixAction(action, target, check);
      }

      // Update auto-fix metadata
      autoFixRule.metadata.timesApplied++;
      autoFixRule.metadata.lastApplied = new Date().toISOString();

      return true;
    } catch (error) {
      console.error(`Auto-fix failed for rule ${rule.name}:`, error);
      return false;
    }
  }

  // Helper methods
  private isRuleApplicable(rule: ConsistencyRule, target: ConsistencyTarget): boolean {
    return rule.category === target.type || target.type === 'system';
  }

  private getRequestTypeKeywords(requestType: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      styling: ['style', 'color', 'css', 'design', 'appearance'],
      functionality: ['function', 'feature', 'behavior', 'logic', 'action'],
      structure: ['structure', 'layout', 'organization', 'architecture'],
      props: ['prop', 'property', 'parameter', 'input', 'attribute'],
      debug: ['bug', 'error', 'fix', 'debug', 'problem', 'issue']
    };
    return keywordMap[requestType] || [];
  }

  private generateReport(
    reportId: string,
    target: ConsistencyTarget,
    checks: ConsistencyCheck[],
    autoFixesApplied: number
  ): ConsistencyReport {
    const passedChecks = checks.filter(c => c.result.passed).length;
    const failedChecks = checks.length - passedChecks;
    const criticalIssues = checks.reduce((count, check) => 
      count + check.result.issues.filter(issue => issue.severity === 'critical').length, 0
    );
    
    const overallScore = checks.length > 0 
      ? checks.reduce((sum, check) => sum + check.result.score, 0) / checks.length
      : 1.0;

    const recommendations = this.generateRecommendations(checks);

    return {
      id: reportId,
      timestamp: new Date().toISOString(),
      scope: target.type as any,
      targetId: target.id,
      summary: {
        totalChecks: checks.length,
        passedChecks,
        failedChecks,
        overallScore,
        criticalIssues
      },
      checks,
      recommendations,
      autoFixesApplied
    };
  }

  private generateRecommendations(checks: ConsistencyCheck[]): string[] {
    const recommendations: string[] = [];
    const failedChecks = checks.filter(c => !c.result.passed);

    if (failedChecks.length === 0) {
      recommendations.push('All consistency checks passed successfully');
      return recommendations;
    }

    // Group issues by type
    const issueTypes = new Map<string, number>();
    failedChecks.forEach(check => {
      check.result.issues.forEach(issue => {
        issueTypes.set(issue.type, (issueTypes.get(issue.type) || 0) + 1);
      });
    });

    // Generate type-specific recommendations
    if (issueTypes.get('missing')) {
      recommendations.push('Consider adding missing required fields and variables');
    }
    if (issueTypes.get('invalid')) {
      recommendations.push('Review and correct invalid field values and types');
    }
    if (issueTypes.get('inconsistent')) {
      recommendations.push('Align inconsistent values with system standards');
    }

    return recommendations;
  }

  private evaluateAutoFixCondition(_condition: AutoFixCondition, _check: ConsistencyCheck): boolean {
    // Simple condition evaluation logic
    return true; // Placeholder
  }

  private async applyAutoFixAction(action: AutoFixAction, _target: ConsistencyTarget, _check: ConsistencyCheck): Promise<void> {
    // Apply auto-fix action logic
    console.log(`Applying auto-fix action: ${action.type} on ${action.field}`);
  }

  private async updateRuleMetadata(rule: ConsistencyRule, passed: boolean): Promise<void> {
    rule.metadata.frequency++;
    
    if (passed) {
      rule.metadata.lastPassed = new Date().toISOString();
    } else {
      rule.metadata.lastFailed = new Date().toISOString();
    }

    // Recalculate success rate
    const totalRuns = rule.metadata.frequency;
    const oldSuccessRate = rule.metadata.successRate;
    const newSuccessRate = ((oldSuccessRate * (totalRuns - 1)) + (passed ? 1 : 0)) / totalRuns;
    rule.metadata.successRate = newSuccessRate;
  }

  // Public API methods
  async getReport(reportId: string): Promise<ConsistencyReport | null> {
    await this.ensureInitialized();
    return this.reports.get(reportId) || null;
  }

  async getCheckHistory(limit: number = 100): Promise<ConsistencyCheck[]> {
    await this.ensureInitialized();
    return this.checkHistory.slice(-limit).reverse();
  }

  async getRules(): Promise<ConsistencyRule[]> {
    await this.ensureInitialized();
    return Array.from(this.rules.values());
  }

  async createRule(rule: Omit<ConsistencyRule, 'id' | 'createdAt' | 'metadata'>): Promise<ConsistencyRule> {
    const newRule: ConsistencyRule = {
      ...rule,
      id: this.generateId('rule'),
      createdAt: new Date().toISOString(),
      metadata: {
        frequency: 0,
        lastPassed: '',
        lastFailed: '',
        successRate: 0
      }
    };

    this.rules.set(newRule.id, newRule);
    return newRule;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private async loadDefaultRules(): Promise<void> {
    const defaultRules: Omit<ConsistencyRule, 'id' | 'createdAt' | 'metadata'>[] = [
      {
        name: 'Prompt Variable Validation',
        description: 'Ensures all required prompt variables are provided',
        category: 'prompt',
        severity: 'high',
        checkFunction: 'checkPromptVariables',
        parameters: {
          requiredVariables: ['componentName', 'userIntent', 'framework'],
          variableTypes: {
            componentName: 'string',
            userIntent: 'string',
            framework: 'string'
          }
        },
        isActive: true
      },
      {
        name: 'Context Integrity Check',
        description: 'Validates conversation context completeness and consistency',
        category: 'context',
        severity: 'medium',
        checkFunction: 'checkContextIntegrity',
        parameters: {
          requiredFields: ['userIntent', 'requestType', 'componentId']
        },
        isActive: true
      },
      {
        name: 'Workflow Step Order Validation',
        description: 'Ensures workflow steps are properly ordered and dependencies are valid',
        category: 'workflow',
        severity: 'high',
        checkFunction: 'checkWorkflowStepOrder',
        parameters: {},
        isActive: true
      },
      {
        name: 'Code Consistency Check',
        description: 'Validates code follows framework and language conventions',
        category: 'code',
        severity: 'medium',
        checkFunction: 'checkCodeConsistency',
        parameters: {},
        isActive: true
      }
    ];

    for (const ruleData of defaultRules) {
      await this.createRule(ruleData);
    }

    console.log(`Loaded ${defaultRules.length} default consistency rules`);
  }

  private async loadDefaultAutoFixRules(): Promise<void> {
    // Load default auto-fix rules
    console.log('Loading default auto-fix rules...');
  }
}

// Export singleton instance
export const consistencyCheckService = new ConsistencyCheckService();
export default ConsistencyCheckService;