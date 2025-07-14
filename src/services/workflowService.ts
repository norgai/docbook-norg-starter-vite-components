// Multi-step Workflow Service
// Handles complex AI workflows with state management and step sequencing

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: 'component_creation' | 'modification' | 'analysis' | 'testing' | 'deployment';
  steps: WorkflowStep[];
  metadata: {
    estimatedDuration: number;
    complexity: 'low' | 'medium' | 'high';
    requiredInputs: string[];
    expectedOutputs: string[];
    tags: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'prompt' | 'validation' | 'transformation' | 'decision' | 'action' | 'parallel' | 'loop';
  order: number;
  config: StepConfig;
  dependencies: string[];
  conditions?: StepCondition[];
  timeout?: number;
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  };
}

export interface StepConfig {
  // For prompt steps
  promptTemplateId?: string;
  promptVariables?: Record<string, any>;
  
  // For validation steps
  validationRules?: ValidationRule[];
  
  // For transformation steps
  transformationType?: 'code' | 'data' | 'format';
  transformationScript?: string;
  
  // For decision steps
  decisionCriteria?: DecisionCriteria[];
  
  // For action steps
  actionType?: 'api_call' | 'file_operation' | 'git_operation' | 'notification';
  actionConfig?: Record<string, any>;
  
  // For parallel steps
  parallelSteps?: string[];
  
  // For loop steps
  loopCondition?: string;
  maxIterations?: number;
}

export interface StepCondition {
  type: 'if' | 'unless' | 'while' | 'until';
  expression: string;
  variables: string[];
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  value?: any;
  message: string;
}

export interface DecisionCriteria {
  condition: string;
  nextStep: string;
  confidence: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  contextId: string;
  componentId: string;
  userId?: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  startedAt: string;
  completedAt?: string;
  progress: WorkflowProgress;
  state: WorkflowState;
  results: WorkflowResults;
  errors: WorkflowError[];
  metadata: {
    totalSteps: number;
    completedSteps: number;
    estimatedTimeRemaining: number;
    actualDuration: number;
  };
}

export interface WorkflowProgress {
  percentage: number;
  currentStepName: string;
  completedSteps: string[];
  failedSteps: string[];
  skippedSteps: string[];
  upcomingSteps: string[];
}

export interface WorkflowState {
  variables: Record<string, any>;
  stepOutputs: Record<string, any>;
  userInputs: Record<string, any>;
  systemState: Record<string, any>;
  checkpoints: StateCheckpoint[];
}

export interface StateCheckpoint {
  stepId: string;
  timestamp: string;
  state: Record<string, any>;
  canRestore: boolean;
}

export interface WorkflowResults {
  success: boolean;
  outputs: Record<string, any>;
  artifacts: WorkflowArtifact[];
  summary: string;
  metrics: {
    totalTime: number;
    stepsCompleted: number;
    retryCount: number;
    errorCount: number;
  };
}

export interface WorkflowArtifact {
  id: string;
  type: 'code' | 'documentation' | 'config' | 'test' | 'asset';
  name: string;
  content: string;
  path?: string;
  metadata: Record<string, any>;
}

export interface WorkflowError {
  stepId: string;
  stepName: string;
  error: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  suggestedAction?: string;
}

class WorkflowService {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private isInitialized = false;

  // Initialize with default workflows
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadDefaultWorkflows();
    this.isInitialized = true;
    console.log('Workflow service initialized');
  }

  // Start workflow execution
  async startWorkflow(
    workflowId: string,
    contextId: string,
    componentId: string,
    initialInputs: Record<string, any> = {},
    userId?: string
  ): Promise<WorkflowExecution> {
    await this.ensureInitialized();

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    if (!workflow.isActive) {
      throw new Error(`Workflow ${workflowId} is not active`);
    }

    const executionId = this.generateId('execution');
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      contextId,
      componentId,
      userId,
      status: 'pending',
      currentStep: workflow.steps[0]?.id || '',
      startedAt: new Date().toISOString(),
      progress: {
        percentage: 0,
        currentStepName: workflow.steps[0]?.name || '',
        completedSteps: [],
        failedSteps: [],
        skippedSteps: [],
        upcomingSteps: workflow.steps.slice(1).map(s => s.id)
      },
      state: {
        variables: { ...initialInputs },
        stepOutputs: {},
        userInputs: initialInputs,
        systemState: {},
        checkpoints: []
      },
      results: {
        success: false,
        outputs: {},
        artifacts: [],
        summary: '',
        metrics: {
          totalTime: 0,
          stepsCompleted: 0,
          retryCount: 0,
          errorCount: 0
        }
      },
      errors: [],
      metadata: {
        totalSteps: workflow.steps.length,
        completedSteps: 0,
        estimatedTimeRemaining: workflow.metadata.estimatedDuration,
        actualDuration: 0
      }
    };

    this.executions.set(executionId, execution);

    // Start execution asynchronously
    this.executeWorkflow(executionId).catch(error => {
      console.error(`Workflow execution ${executionId} failed:`, error);
    });

    return execution;
  }

  // Get workflow execution status
  async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    await this.ensureInitialized();
    return this.executions.get(executionId) || null;
  }

  // Pause workflow execution
  async pauseWorkflow(executionId: string): Promise<boolean> {
    const execution = await this.getExecution(executionId);
    if (!execution || execution.status !== 'running') {
      return false;
    }

    execution.status = 'paused';
    this.executions.set(executionId, execution);
    return true;
  }

  // Resume workflow execution
  async resumeWorkflow(executionId: string): Promise<boolean> {
    const execution = await this.getExecution(executionId);
    if (!execution || execution.status !== 'paused') {
      return false;
    }

    execution.status = 'running';
    this.executions.set(executionId, execution);

    // Continue execution
    this.executeWorkflow(executionId).catch(error => {
      console.error(`Workflow resume ${executionId} failed:`, error);
    });

    return true;
  }

  // Cancel workflow execution
  async cancelWorkflow(executionId: string): Promise<boolean> {
    const execution = await this.getExecution(executionId);
    if (!execution || ['completed', 'failed', 'cancelled'].includes(execution.status)) {
      return false;
    }

    execution.status = 'cancelled';
    execution.completedAt = new Date().toISOString();
    this.executions.set(executionId, execution);
    return true;
  }

  // Restore workflow from checkpoint
  async restoreFromCheckpoint(executionId: string, checkpointIndex: number): Promise<boolean> {
    const execution = await this.getExecution(executionId);
    if (!execution) return false;

    const checkpoint = execution.state.checkpoints[checkpointIndex];
    if (!checkpoint || !checkpoint.canRestore) return false;

    // Restore state
    execution.state.variables = { ...checkpoint.state };
    execution.currentStep = checkpoint.stepId;
    execution.status = 'paused';

    // Update progress
    const workflow = this.workflows.get(execution.workflowId);
    if (workflow) {
      const stepIndex = workflow.steps.findIndex(s => s.id === checkpoint.stepId);
      execution.progress.percentage = (stepIndex / workflow.steps.length) * 100;
      execution.progress.currentStepName = workflow.steps[stepIndex]?.name || '';
    }

    this.executions.set(executionId, execution);
    return true;
  }

  // Execute workflow steps
  private async executeWorkflow(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return;

    execution.status = 'running';
    const startTime = Date.now();

    try {
      for (const step of workflow.steps) {
        // Check if execution was paused or cancelled
        const currentExecution = this.executions.get(executionId);
        if (!currentExecution || ['paused', 'cancelled'].includes(currentExecution.status)) {
          return;
        }

        // Skip if step is already completed
        if (execution.progress.completedSteps.includes(step.id)) {
          continue;
        }

        // Update current step
        execution.currentStep = step.id;
        execution.progress.currentStepName = step.name;

        // Check step dependencies
        if (!await this.checkStepDependencies(execution, step)) {
          this.addError(execution, step.id, step.name, 'Step dependencies not met', 'high');
          continue;
        }

        // Check step conditions
        if (!await this.evaluateStepConditions(execution, step)) {
          execution.progress.skippedSteps.push(step.id);
          continue;
        }

        // Create checkpoint before executing step
        await this.createCheckpoint(execution, step.id);

        // Execute step with retry logic
        const success = await this.executeStepWithRetry(execution, step);

        if (success) {
          execution.progress.completedSteps.push(step.id);
          execution.metadata.completedSteps++;
        } else {
          execution.progress.failedSteps.push(step.id);
          execution.results.metrics.errorCount++;

          // Check if step is critical
          if (step.config.actionType === 'critical' || step.type === 'validation') {
            throw new Error(`Critical step ${step.name} failed`);
          }
        }

        // Update progress
        execution.progress.percentage = (execution.metadata.completedSteps / workflow.steps.length) * 100;
        execution.progress.upcomingSteps = workflow.steps
          .slice(workflow.steps.findIndex(s => s.id === step.id) + 1)
          .map(s => s.id);

        this.executions.set(executionId, execution);
      }

      // Mark as completed
      execution.status = 'completed';
      execution.results.success = true;
      execution.results.summary = `Workflow completed successfully with ${execution.metadata.completedSteps} steps`;

    } catch (error: any) {
      execution.status = 'failed';
      execution.results.success = false;
      execution.results.summary = `Workflow failed: ${error.message}`;
      this.addError(execution, execution.currentStep, 'workflow', error.message, 'critical');
    } finally {
      execution.completedAt = new Date().toISOString();
      execution.metadata.actualDuration = Date.now() - startTime;
      execution.results.metrics.totalTime = execution.metadata.actualDuration;
      this.executions.set(executionId, execution);
    }
  }

  // Execute individual step with retry logic
  private async executeStepWithRetry(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<boolean> {
    const maxRetries = step.retryConfig?.maxRetries || 0;
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        const success = await this.executeStep(execution, step);
        if (success) {
          return true;
        }
      } catch (error: any) {
        console.error(`Step ${step.name} failed (attempt ${retryCount + 1}):`, error);
        
        if (retryCount === maxRetries) {
          this.addError(execution, step.id, step.name, error.message, 'high');
          return false;
        }

        // Wait before retry
        if (step.retryConfig?.retryDelay) {
          const delay = step.retryConfig.retryDelay * Math.pow(step.retryConfig.backoffMultiplier || 1, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        retryCount++;
        execution.results.metrics.retryCount++;
      }
    }

    return false;
  }

  // Execute individual step
  private async executeStep(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    console.log(`Executing step: ${step.name} (${step.type})`);

    switch (step.type) {
      case 'prompt':
        return await this.executePromptStep(execution, step);
      case 'validation':
        return await this.executeValidationStep(execution, step);
      case 'transformation':
        return await this.executeTransformationStep(execution, step);
      case 'decision':
        return await this.executeDecisionStep(execution, step);
      case 'action':
        return await this.executeActionStep(execution, step);
      case 'parallel':
        return await this.executeParallelStep(execution, step);
      case 'loop':
        return await this.executeLoopStep(execution, step);
      default:
        console.warn(`Unknown step type: ${step.type}`);
        return true;
    }
  }

  // Execute prompt step
  private async executePromptStep(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    try {
      // Simulate prompt execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const output = {
        generatedContent: `Generated content for ${step.name}`,
        confidence: 0.85,
        tokens: 150
      };

      execution.state.stepOutputs[step.id] = output;
      return true;
    } catch (error) {
      return false;
    }
  }

  // Execute validation step
  private async executeValidationStep(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    const rules = step.config.validationRules || [];
    
    for (const rule of rules) {
      const value = execution.state.variables[rule.field];
      
      switch (rule.type) {
        case 'required':
          if (!value) {
            this.addError(execution, step.id, step.name, rule.message, 'medium');
            return false;
          }
          break;
        case 'format':
          if (value && rule.value && !new RegExp(rule.value).test(value)) {
            this.addError(execution, step.id, step.name, rule.message, 'medium');
            return false;
          }
          break;
      }
    }

    return true;
  }

  // Execute transformation step
  private async executeTransformationStep(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    try {
      // Simulate transformation
      const input = execution.state.variables;
      const output = { ...input, transformed: true, timestamp: new Date().toISOString() };
      
      execution.state.stepOutputs[step.id] = output;
      execution.state.variables = { ...execution.state.variables, ...output };
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Execute decision step
  private async executeDecisionStep(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    const criteria = step.config.decisionCriteria || [];
    
    for (const criterion of criteria) {
      if (await this.evaluateExpression(criterion.condition, execution.state.variables)) {
        execution.state.systemState.nextStep = criterion.nextStep;
        execution.state.systemState.decisionConfidence = criterion.confidence;
        return true;
      }
    }

    return false;
  }

  // Execute action step
  private async executeActionStep(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    const actionType = step.config.actionType;
    
    switch (actionType) {
      case 'api_call':
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        execution.state.stepOutputs[step.id] = { apiResponse: 'success' };
        return true;
      
      case 'file_operation':
        // Simulate file operation
        execution.state.stepOutputs[step.id] = { fileCreated: true };
        return true;
        
      case 'notification':
        // Simulate notification
        execution.state.stepOutputs[step.id] = { notificationSent: true };
        return true;
        
      default:
        return true;
    }
  }

  // Execute parallel step
  private async executeParallelStep(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    const parallelSteps = step.config.parallelSteps || [];
    const workflow = this.workflows.get(execution.workflowId);
    if (!workflow) return false;

    const promises = parallelSteps.map(async (stepId) => {
      const parallelStep = workflow.steps.find(s => s.id === stepId);
      if (!parallelStep) return false;
      
      return await this.executeStep(execution, parallelStep);
    });

    const results = await Promise.all(promises);
    return results.every(result => result);
  }

  // Execute loop step
  private async executeLoopStep(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    const maxIterations = step.config.maxIterations || 10;
    let iterations = 0;

    while (iterations < maxIterations) {
      const shouldContinue = await this.evaluateExpression(
        step.config.loopCondition || 'false',
        execution.state.variables
      );

      if (!shouldContinue) break;

      // Execute loop body (would need additional configuration)
      await new Promise(resolve => setTimeout(resolve, 100));
      iterations++;
    }

    execution.state.stepOutputs[step.id] = { iterations };
    return true;
  }

  // Helper methods
  private async checkStepDependencies(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    return step.dependencies.every(depId => 
      execution.progress.completedSteps.includes(depId)
    );
  }

  private async evaluateStepConditions(execution: WorkflowExecution, step: WorkflowStep): Promise<boolean> {
    if (!step.conditions || step.conditions.length === 0) return true;

    return step.conditions.every(condition => 
      this.evaluateExpression(condition.expression, execution.state.variables)
    );
  }

  private async evaluateExpression(expression: string, variables: Record<string, any>): Promise<boolean> {
    try {
      // Simple expression evaluation - in production would use safer evaluation
      const func = new Function(...Object.keys(variables), `return ${expression}`);
      return Boolean(func(...Object.values(variables)));
    } catch (error) {
      console.error('Expression evaluation failed:', error);
      return false;
    }
  }

  private async createCheckpoint(execution: WorkflowExecution, stepId: string): Promise<void> {
    const checkpoint: StateCheckpoint = {
      stepId,
      timestamp: new Date().toISOString(),
      state: { ...execution.state.variables },
      canRestore: true
    };

    execution.state.checkpoints.push(checkpoint);

    // Limit checkpoints
    if (execution.state.checkpoints.length > 10) {
      execution.state.checkpoints.shift();
    }
  }

  private addError(
    execution: WorkflowExecution,
    stepId: string,
    stepName: string,
    error: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    execution.errors.push({
      stepId,
      stepName,
      error,
      timestamp: new Date().toISOString(),
      severity,
      recoverable: severity !== 'critical'
    });
  }

  // Workflow management methods
  async createWorkflow(workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkflowDefinition> {
    const newWorkflow: WorkflowDefinition = {
      ...workflow,
      id: this.generateId('workflow'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.workflows.set(newWorkflow.id, newWorkflow);
    return newWorkflow;
  }

  async getWorkflow(workflowId: string): Promise<WorkflowDefinition | null> {
    await this.ensureInitialized();
    return this.workflows.get(workflowId) || null;
  }

  async listWorkflows(filters?: {
    category?: string;
    isActive?: boolean;
  }): Promise<WorkflowDefinition[]> {
    await this.ensureInitialized();
    
    let workflows = Array.from(this.workflows.values());

    if (filters) {
      if (filters.category) {
        workflows = workflows.filter(w => w.category === filters.category);
      }
      if (filters.isActive !== undefined) {
        workflows = workflows.filter(w => w.isActive === filters.isActive);
      }
    }

    return workflows.sort((a, b) => a.name.localeCompare(b.name));
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private async loadDefaultWorkflows(): Promise<void> {
    const defaultWorkflows: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Component Enhancement Workflow',
        description: 'Multi-step workflow for enhancing React components',
        version: '1.0.0',
        category: 'modification',
        steps: [
          {
            id: 'step_1',
            name: 'Analyze Current Component',
            description: 'Analyze the current component structure and identify enhancement opportunities',
            type: 'prompt',
            order: 1,
            config: {
              promptTemplateId: 'component_analysis'
            },
            dependencies: []
          },
          {
            id: 'step_2',
            name: 'Validate Enhancement Request',
            description: 'Validate that the enhancement request is feasible',
            type: 'validation',
            order: 2,
            config: {
              validationRules: [
                {
                  field: 'userIntent',
                  type: 'required',
                  message: 'User intent is required'
                }
              ]
            },
            dependencies: ['step_1']
          },
          {
            id: 'step_3',
            name: 'Generate Enhancement Plan',
            description: 'Create a detailed plan for implementing the enhancement',
            type: 'prompt',
            order: 3,
            config: {
              promptTemplateId: 'enhancement_planning'
            },
            dependencies: ['step_2']
          },
          {
            id: 'step_4',
            name: 'Implement Enhancement',
            description: 'Apply the enhancement to the component',
            type: 'action',
            order: 4,
            config: {
              actionType: 'file_operation'
            },
            dependencies: ['step_3']
          },
          {
            id: 'step_5',
            name: 'Validate Result',
            description: 'Validate that the enhancement was applied correctly',
            type: 'validation',
            order: 5,
            config: {
              validationRules: [
                {
                  field: 'enhancementApplied',
                  type: 'required',
                  message: 'Enhancement must be applied'
                }
              ]
            },
            dependencies: ['step_4']
          }
        ],
        metadata: {
          estimatedDuration: 30000,
          complexity: 'medium',
          requiredInputs: ['componentId', 'userIntent'],
          expectedOutputs: ['enhancedComponent', 'changesSummary'],
          tags: ['enhancement', 'component', 'react']
        },
        isActive: true
      }
    ];

    for (const workflowData of defaultWorkflows) {
      await this.createWorkflow(workflowData);
    }

    console.log(`Loaded ${defaultWorkflows.length} default workflows`);
  }
}

// Export singleton instance
export const workflowService = new WorkflowService();
export default WorkflowService;