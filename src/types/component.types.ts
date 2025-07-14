// Component metadata types for the AI-powered component library

export interface ComponentMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: ComponentCategory;
  tags: string[];
  version: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  status: ComponentStatus;
  usage?: ComponentUsage;
  properties?: ComponentProperties;
  dependencies?: string[];
  aiModifiable: boolean;
  chatEnabled: boolean;
}

export interface ComponentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string; // For hierarchical categories
  icon?: string;
  order?: number;
}

export const ComponentStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  DEPRECATED: 'deprecated',
  ARCHIVED: 'archived'
} as const;

export type ComponentStatus = typeof ComponentStatus[keyof typeof ComponentStatus];

export interface ComponentUsage {
  examples: UsageExample[];
  documentation?: string;
  apiReference?: string;
  bestPractices?: string[];
}

export interface UsageExample {
  title: string;
  description?: string;
  code: string;
  language: 'jsx' | 'tsx' | 'js' | 'ts';
  preview?: boolean;
}

export interface ComponentProperties {
  props?: PropDefinition[];
  events?: EventDefinition[];
  slots?: SlotDefinition[];
  cssVariables?: CSSVariableDefinition[];
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  default?: any;
  description?: string;
  deprecated?: boolean;
}

export interface EventDefinition {
  name: string;
  description?: string;
  payload?: string;
}

export interface SlotDefinition {
  name: string;
  description?: string;
  props?: PropDefinition[];
}

export interface CSSVariableDefinition {
  name: string;
  default: string;
  description?: string;
  type?: 'color' | 'size' | 'spacing' | 'other';
}

// Component registry types
export interface ComponentRegistry {
  components: Map<string, ComponentMetadata>;
  categories: Map<string, ComponentCategory>;
  tags: Set<string>;
}

// Search and filter types
export interface ComponentFilter {
  categories?: string[];
  tags?: string[];
  status?: ComponentStatus[];
  search?: string;
  aiModifiable?: boolean;
  chatEnabled?: boolean;
}

export interface ComponentSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'category';
  order: 'asc' | 'desc';
}

// Component modification types for AI interactions
export interface ComponentModification {
  id: string;
  componentId: string;
  timestamp: string;
  type: ModificationType;
  description: string;
  changes: ComponentChange[];
  userId?: string;
  aiGenerated: boolean;
}

export const ModificationType = {
  STYLE: 'style',
  FUNCTIONALITY: 'functionality',
  STRUCTURE: 'structure',
  PROPS: 'props',
  DOCUMENTATION: 'documentation'
} as const;

export type ModificationType = typeof ModificationType[keyof typeof ModificationType];

export interface ComponentChange {
  path: string;
  oldValue?: any;
  newValue?: any;
  type: 'add' | 'remove' | 'modify';
}