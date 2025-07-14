// Template Creation Service
// Manages component templates, scaffolding, and boilerplate generation

export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'layout' | 'form' | 'data' | 'navigation' | 'utility' | 'custom';
  framework: 'react' | 'vue' | 'angular' | 'universal';
  language: 'typescript' | 'javascript';
  complexity: 'basic' | 'intermediate' | 'advanced';
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  isPublic: boolean;
  isFeatured: boolean;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    downloads: number;
    rating: number;
    reviews: number;
    usageCount: number;
  };
  structure: TemplateStructure;
  configuration: TemplateConfiguration;
  dependencies: TemplateDependency[];
  files: TemplateFile[];
  examples: TemplateExample[];
  documentation: TemplateDocumentation;
}

export interface TemplateStructure {
  componentName: string;
  props: TemplateProp[];
  state: TemplateState[];
  methods: TemplateMethod[];
  lifecycle: TemplateLifecycle[];
  styling: TemplateStyling;
  variants: TemplateVariant[];
}

export interface TemplateProp {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
  category: 'basic' | 'styling' | 'behavior' | 'data' | 'event';
}

export interface TemplateState {
  name: string;
  type: string;
  description: string;
  initialValue: any;
  scope: 'local' | 'shared' | 'global';
}

export interface TemplateMethod {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  returnType: string;
  category: 'handler' | 'utility' | 'lifecycle' | 'computed';
  implementation?: string;
}

export interface TemplateLifecycle {
  name: string;
  description: string;
  implementation?: string;
  framework: string;
}

export interface TemplateStyling {
  type: 'css' | 'scss' | 'styled-components' | 'emotion' | 'tailwind';
  customizable: boolean;
  variables: Array<{
    name: string;
    type: 'color' | 'size' | 'spacing' | 'typography' | 'shadow' | 'border';
    description: string;
    defaultValue: string;
  }>;
  breakpoints: Array<{
    name: string;
    minWidth: number;
    styles: Record<string, string>;
  }>;
}

export interface TemplateVariant {
  name: string;
  description: string;
  modifications: Array<{
    type: 'prop' | 'style' | 'structure' | 'behavior';
    target: string;
    value: any;
  }>;
  preview?: string;
}

export interface TemplateConfiguration {
  customization: {
    allowedModifications: string[];
    requiredProps: string[];
    optionalFeatures: string[];
  };
  scaffolding: {
    generateTests: boolean;
    generateStories: boolean;
    generateDocs: boolean;
    includeStyles: boolean;
    includeTypes: boolean;
  };
  integration: {
    supportedDesignSystems: string[];
    compatibleLibraries: string[];
    requiredPolyfills: string[];
  };
}

export interface TemplateDependency {
  name: string;
  version: string;
  type: 'runtime' | 'development' | 'peer';
  description: string;
  optional: boolean;
  alternatives?: Array<{
    name: string;
    version: string;
    description: string;
  }>;
}

export interface TemplateFile {
  path: string;
  type: 'component' | 'style' | 'test' | 'story' | 'documentation' | 'config';
  content: string;
  template: boolean; // Whether content contains template variables
  encoding: 'utf8' | 'base64';
  size: number;
}

export interface TemplateExample {
  id: string;
  name: string;
  description: string;
  code: string;
  preview?: string;
  configuration: Record<string, any>;
  complexity: 'basic' | 'intermediate' | 'advanced';
}

export interface TemplateDocumentation {
  readme: string;
  apiReference: string;
  guides: Array<{
    title: string;
    content: string;
    level: 'beginner' | 'intermediate' | 'advanced';
  }>;
  troubleshooting: Array<{
    problem: string;
    solution: string;
    tags: string[];
  }>;
  changelog: Array<{
    version: string;
    date: string;
    changes: string[];
    breaking: boolean;
  }>;
}

export interface TemplateGenerationConfig {
  componentName: string;
  targetFramework: string;
  targetLanguage: string;
  customization: Record<string, any>;
  includeTests: boolean;
  includeStories: boolean;
  includeDocs: boolean;
  includeStyles: boolean;
  stylingFramework?: string;
  designSystem?: string;
  outputFormat: 'files' | 'zip' | 'codesandbox' | 'stackblitz';
}

export interface GeneratedTemplate {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  dependencies: TemplateDependency[];
  instructions: string[];
  warnings: string[];
  metadata: {
    templateId: string;
    generatedAt: string;
    configuration: TemplateGenerationConfig;
    totalFiles: number;
    totalSize: number;
  };
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: string[];
  subcategories: TemplateSubcategory[];
}

export interface TemplateSubcategory {
  id: string;
  name: string;
  description: string;
  templates: string[];
}

export interface TemplateSearch {
  query?: string;
  category?: string;
  framework?: string;
  language?: string;
  complexity?: string;
  tags?: string[];
  author?: string;
  featured?: boolean;
  sortBy: 'name' | 'popularity' | 'rating' | 'recent' | 'downloads';
  sortOrder: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

class TemplateService {
  private templates: Map<string, ComponentTemplate> = new Map();
  private categories: Map<string, TemplateCategory> = new Map();
  private userTemplates: Map<string, string[]> = new Map(); // userId -> templateIds
  private templateUsage: Map<string, number> = new Map();
  private isInitialized = false;

  // Initialize service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadDefaultTemplates();
    await this.loadTemplateCategories();
    this.isInitialized = true;
    console.log('Template service initialized');
  }

  // Create new template
  async createTemplate(
    templateData: Omit<ComponentTemplate, 'id' | 'metadata'>,
    authorId: string
  ): Promise<ComponentTemplate> {
    await this.ensureInitialized();

    const template: ComponentTemplate = {
      ...templateData,
      id: this.generateId('template'),
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        downloads: 0,
        rating: 0,
        reviews: 0,
        usageCount: 0
      }
    };

    this.templates.set(template.id, template);

    // Add to user's templates
    const userTemplates = this.userTemplates.get(authorId) || [];
    userTemplates.push(template.id);
    this.userTemplates.set(authorId, userTemplates);

    console.log(`Created template: ${template.id}`);
    return template;
  }

  // Get template by ID
  async getTemplate(templateId: string): Promise<ComponentTemplate | null> {
    await this.ensureInitialized();
    return this.templates.get(templateId) || null;
  }

  // Search templates
  async searchTemplates(searchParams: TemplateSearch): Promise<{
    templates: ComponentTemplate[];
    total: number;
    hasMore: boolean;
  }> {
    await this.ensureInitialized();

    let templates = Array.from(this.templates.values());

    // Apply filters
    if (searchParams.query) {
      const query = searchParams.query.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (searchParams.category) {
      templates = templates.filter(t => t.category === searchParams.category);
    }

    if (searchParams.framework) {
      templates = templates.filter(t => 
        t.framework === searchParams.framework || t.framework === 'universal'
      );
    }

    if (searchParams.language) {
      templates = templates.filter(t => t.language === searchParams.language);
    }

    if (searchParams.complexity) {
      templates = templates.filter(t => t.complexity === searchParams.complexity);
    }

    if (searchParams.tags && searchParams.tags.length > 0) {
      templates = templates.filter(t => 
        searchParams.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (searchParams.author) {
      templates = templates.filter(t => t.author.id === searchParams.author);
    }

    if (searchParams.featured) {
      templates = templates.filter(t => t.isFeatured);
    }

    // Sort templates
    templates.sort((a, b) => {
      let comparison = 0;
      
      switch (searchParams.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'popularity':
          comparison = a.metadata.usageCount - b.metadata.usageCount;
          break;
        case 'rating':
          comparison = a.metadata.rating - b.metadata.rating;
          break;
        case 'recent':
          comparison = new Date(a.metadata.updatedAt).getTime() - new Date(b.metadata.updatedAt).getTime();
          break;
        case 'downloads':
          comparison = a.metadata.downloads - b.metadata.downloads;
          break;
      }

      return searchParams.sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = templates.length;
    const offset = searchParams.offset || 0;
    const limit = searchParams.limit || 20;
    const paginatedTemplates = templates.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      templates: paginatedTemplates,
      total,
      hasMore
    };
  }

  // Generate component from template
  async generateFromTemplate(
    templateId: string,
    config: TemplateGenerationConfig
  ): Promise<GeneratedTemplate> {
    await this.ensureInitialized();

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const generatedFiles: Array<{ path: string; content: string; type: string }> = [];
    const instructions: string[] = [];
    const warnings: string[] = [];

    try {
      // Generate main component file
      const componentFile = await this.generateComponentFile(template, config);
      generatedFiles.push(componentFile);

      // Generate styles if requested
      if (config.includeStyles && template.structure.styling) {
        const styleFile = await this.generateStyleFile(template, config);
        generatedFiles.push(styleFile);
      }

      // Generate tests if requested
      if (config.includeTests) {
        const testFile = await this.generateTestFile(template, config);
        generatedFiles.push(testFile);
      }

      // Generate stories if requested
      if (config.includeStories) {
        const storyFile = await this.generateStoryFile(template, config);
        generatedFiles.push(storyFile);
      }

      // Generate documentation if requested
      if (config.includeDocs) {
        const docsFile = await this.generateDocumentationFile(template, config);
        generatedFiles.push(docsFile);
      }

      // Generate additional template files
      for (const templateFile of template.files) {
        if (this.shouldIncludeFile(templateFile, config)) {
          const processedFile = await this.processTemplateFile(templateFile, template, config);
          generatedFiles.push(processedFile);
        }
      }

      // Generate package.json if needed
      if (template.dependencies.length > 0) {
        const packageFile = await this.generatePackageFile(template, config);
        generatedFiles.push(packageFile);
      }

      // Update template usage
      template.metadata.usageCount++;
      this.templateUsage.set(templateId, (this.templateUsage.get(templateId) || 0) + 1);
      this.templates.set(templateId, template);

      // Generate instructions
      instructions.push('Component generated successfully!');
      instructions.push(`Install dependencies: npm install`);
      
      if (config.includeTests) {
        instructions.push('Run tests: npm test');
      }
      
      if (config.includeStories) {
        instructions.push('View in Storybook: npm run storybook');
      }

      const totalSize = generatedFiles.reduce((sum, file) => sum + file.content.length, 0);

      return {
        success: true,
        files: generatedFiles,
        dependencies: template.dependencies,
        instructions,
        warnings,
        metadata: {
          templateId,
          generatedAt: new Date().toISOString(),
          configuration: config,
          totalFiles: generatedFiles.length,
          totalSize
        }
      };

    } catch (error: any) {
      return {
        success: false,
        files: [],
        dependencies: [],
        instructions: [],
        warnings: [error.message],
        metadata: {
          templateId,
          generatedAt: new Date().toISOString(),
          configuration: config,
          totalFiles: 0,
          totalSize: 0
        }
      };
    }
  }

  // Update template
  async updateTemplate(
    templateId: string,
    updates: Partial<ComponentTemplate>,
    authorId: string
  ): Promise<ComponentTemplate> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    if (template.author.id !== authorId) {
      throw new Error('Only the author can update this template');
    }

    const updatedTemplate: ComponentTemplate = {
      ...template,
      ...updates,
      id: template.id, // Preserve ID
      metadata: {
        ...template.metadata,
        ...updates.metadata,
        updatedAt: new Date().toISOString(),
        version: this.incrementVersion(template.metadata.version)
      }
    };

    this.templates.set(templateId, updatedTemplate);
    console.log(`Updated template: ${templateId}`);
    return updatedTemplate;
  }

  // Delete template
  async deleteTemplate(templateId: string, authorId: string): Promise<boolean> {
    const template = this.templates.get(templateId);
    if (!template) {
      return false;
    }

    if (template.author.id !== authorId) {
      throw new Error('Only the author can delete this template');
    }

    this.templates.delete(templateId);

    // Remove from user's templates
    const userTemplates = this.userTemplates.get(authorId) || [];
    const updatedUserTemplates = userTemplates.filter(id => id !== templateId);
    this.userTemplates.set(authorId, updatedUserTemplates);

    this.templateUsage.delete(templateId);

    console.log(`Deleted template: ${templateId}`);
    return true;
  }

  // Get template categories
  async getCategories(): Promise<TemplateCategory[]> {
    await this.ensureInitialized();
    return Array.from(this.categories.values());
  }

  // Get user's templates
  async getUserTemplates(userId: string): Promise<ComponentTemplate[]> {
    await this.ensureInitialized();
    
    const userTemplateIds = this.userTemplates.get(userId) || [];
    return userTemplateIds
      .map(id => this.templates.get(id))
      .filter((template): template is ComponentTemplate => template !== undefined);
  }

  // Get featured templates
  async getFeaturedTemplates(limit: number = 10): Promise<ComponentTemplate[]> {
    await this.ensureInitialized();
    
    return Array.from(this.templates.values())
      .filter(template => template.isFeatured)
      .sort((a, b) => b.metadata.rating - a.metadata.rating)
      .slice(0, limit);
  }

  // Private helper methods
  private async generateComponentFile(
    template: ComponentTemplate,
    config: TemplateGenerationConfig
  ): Promise<{ path: string; content: string; type: string }> {
    let content = '';
    const { componentName, targetFramework, targetLanguage } = config;
    
    // Generate imports
    const imports = this.generateImports(template, config);
    content += imports + '\n\n';

    // Generate interfaces/types if TypeScript
    if (targetLanguage === 'typescript') {
      const interfaces = this.generateInterfaces(template, config);
      content += interfaces + '\n\n';
    }

    // Generate component
    const component = this.generateComponent(template, config);
    content += component;

    // Generate exports
    const exports = this.generateExports(template, config);
    content += '\n\n' + exports;

    const extension = targetLanguage === 'typescript' ? 
      (targetFramework === 'react' ? 'tsx' : 'ts') : 
      (targetFramework === 'react' ? 'jsx' : 'js');

    return {
      path: `${componentName}.${extension}`,
      content: this.processTemplateVariables(content, template, config),
      type: 'component'
    };
  }

  private async generateStyleFile(
    template: ComponentTemplate,
    config: TemplateGenerationConfig
  ): Promise<{ path: string; content: string; type: string }> {
    const styling = template.structure.styling;
    let content = '';
    let extension = 'css';

    switch (styling.type) {
      case 'scss':
        extension = 'scss';
        content = this.generateScssStyles(template, config);
        break;
      case 'styled-components':
        extension = 'ts';
        content = this.generateStyledComponentsStyles(template, config);
        break;
      case 'tailwind':
        // Tailwind classes are typically in the component file
        return { path: '', content: '', type: 'style' };
      default:
        content = this.generateCssStyles(template, config);
    }

    return {
      path: `${config.componentName}.${extension}`,
      content: this.processTemplateVariables(content, template, config),
      type: 'style'
    };
  }

  private async generateTestFile(
    template: ComponentTemplate,
    config: TemplateGenerationConfig
  ): Promise<{ path: string; content: string; type: string }> {
    const extension = config.targetLanguage === 'typescript' ? 'test.tsx' : 'test.jsx';
    
    let content = '';
    
    // Generate test imports
    content += `import React from 'react';\n`;
    content += `import { render, screen } from '@testing-library/react';\n`;
    content += `import { ${config.componentName} } from './${config.componentName}';\n\n`;

    // Generate test suites
    content += `describe('${config.componentName}', () => {\n`;
    content += `  it('renders without crashing', () => {\n`;
    content += `    render(<${config.componentName} />);\n`;
    content += `  });\n\n`;

    // Generate tests for each prop
    for (const prop of template.structure.props) {
      if (prop.required) {
        content += `  it('renders with ${prop.name} prop', () => {\n`;
        content += `    render(<${config.componentName} ${prop.name}={${this.getTestValue(prop.type)}} />);\n`;
        content += `  });\n\n`;
      }
    }

    content += `});\n`;

    return {
      path: `${config.componentName}.${extension}`,
      content: this.processTemplateVariables(content, template, config),
      type: 'test'
    };
  }

  private async generateStoryFile(
    template: ComponentTemplate,
    config: TemplateGenerationConfig
  ): Promise<{ path: string; content: string; type: string }> {
    const extension = config.targetLanguage === 'typescript' ? 'stories.tsx' : 'stories.jsx';
    
    let content = '';
    
    // Generate story imports
    content += `import type { Meta, StoryObj } from '@storybook/react';\n`;
    content += `import { ${config.componentName} } from './${config.componentName}';\n\n`;

    // Generate meta
    content += `const meta: Meta<typeof ${config.componentName}> = {\n`;
    content += `  title: 'Components/${config.componentName}',\n`;
    content += `  component: ${config.componentName},\n`;
    content += `  parameters: {\n`;
    content += `    layout: 'centered',\n`;
    content += `  },\n`;
    content += `  tags: ['autodocs'],\n`;
    
    // Generate argTypes
    if (template.structure.props.length > 0) {
      content += `  argTypes: {\n`;
      for (const prop of template.structure.props) {
        content += `    ${prop.name}: {\n`;
        content += `      description: '${prop.description}',\n`;
        content += `      control: { type: '${this.getStorybookControlType(prop.type)}' },\n`;
        content += `    },\n`;
      }
      content += `  },\n`;
    }
    
    content += `};\n\n`;
    content += `export default meta;\n`;
    content += `type Story = StoryObj<typeof meta>;\n\n`;

    // Generate default story
    content += `export const Default: Story = {\n`;
    if (template.structure.props.some(p => p.required)) {
      content += `  args: {\n`;
      for (const prop of template.structure.props.filter(p => p.required)) {
        content += `    ${prop.name}: ${JSON.stringify(prop.defaultValue || this.getDefaultValue(prop.type))},\n`;
      }
      content += `  },\n`;
    }
    content += `};\n`;

    // Generate variant stories from template
    for (const variant of template.structure.variants) {
      const storyName = variant.name.replace(/\s+/g, '');
      content += `\nexport const ${storyName}: Story = {\n`;
      content += `  args: {\n`;
      content += `    ...Default.args,\n`;
      
      for (const mod of variant.modifications) {
        if (mod.type === 'prop') {
          content += `    ${mod.target}: ${JSON.stringify(mod.value)},\n`;
        }
      }
      
      content += `  },\n`;
      content += `};\n`;
    }

    return {
      path: `${config.componentName}.${extension}`,
      content: this.processTemplateVariables(content, template, config),
      type: 'story'
    };
  }

  private async generateDocumentationFile(
    template: ComponentTemplate,
    config: TemplateGenerationConfig
  ): Promise<{ path: string; content: string; type: string }> {
    let content = `# ${config.componentName}\n\n`;
    content += `${template.description}\n\n`;
    
    content += `## Usage\n\n`;
    content += '```jsx\n';
    content += `import { ${config.componentName} } from './${config.componentName}';\n\n`;
    content += `<${config.componentName}`;
    
    const requiredProps = template.structure.props.filter(p => p.required);
    if (requiredProps.length > 0) {
      content += '\n';
      for (const prop of requiredProps) {
        content += `  ${prop.name}={${JSON.stringify(prop.defaultValue || this.getDefaultValue(prop.type))}}\n`;
      }
    }
    
    content += ` />\n`;
    content += '```\n\n';

    // Props documentation
    if (template.structure.props.length > 0) {
      content += `## Props\n\n`;
      content += `| Name | Type | Required | Default | Description |\n`;
      content += `|------|------|----------|---------|-------------|\n`;
      
      for (const prop of template.structure.props) {
        content += `| ${prop.name} | \`${prop.type}\` | ${prop.required ? '✅' : '❌'} | \`${prop.defaultValue || '-'}\` | ${prop.description} |\n`;
      }
      content += '\n';
    }

    // Examples from template
    if (template.examples.length > 0) {
      content += `## Examples\n\n`;
      for (const example of template.examples) {
        content += `### ${example.name}\n\n`;
        content += `${example.description}\n\n`;
        content += '```jsx\n';
        content += example.code;
        content += '\n```\n\n';
      }
    }

    return {
      path: `${config.componentName}.md`,
      content: this.processTemplateVariables(content, template, config),
      type: 'documentation'
    };
  }

  private async generatePackageFile(
    template: ComponentTemplate,
    config: TemplateGenerationConfig
  ): Promise<{ path: string; content: string; type: string }> {
    const packageJson = {
      name: `@components/${config.componentName.toLowerCase()}`,
      version: '1.0.0',
      description: template.description,
      main: `${config.componentName}.${config.targetLanguage === 'typescript' ? 'tsx' : 'jsx'}`,
      dependencies: template.dependencies
        .filter(dep => dep.type === 'runtime')
        .reduce((acc, dep) => ({ ...acc, [dep.name]: dep.version }), {}),
      devDependencies: template.dependencies
        .filter(dep => dep.type === 'development')
        .reduce((acc, dep) => ({ ...acc, [dep.name]: dep.version }), {}),
      peerDependencies: template.dependencies
        .filter(dep => dep.type === 'peer')
        .reduce((acc, dep) => ({ ...acc, [dep.name]: dep.version }), {}),
      keywords: template.tags,
      author: template.author.name
    };

    return {
      path: 'package.json',
      content: JSON.stringify(packageJson, null, 2),
      type: 'config'
    };
  }

  private processTemplateFile(
    templateFile: TemplateFile,
    template: ComponentTemplate,
    config: TemplateGenerationConfig
  ): { path: string; content: string; type: string } {
    let content = templateFile.content;
    
    if (templateFile.template) {
      content = this.processTemplateVariables(content, template, config);
    }

    return {
      path: templateFile.path.replace('{{componentName}}', config.componentName),
      content,
      type: templateFile.type
    };
  }

  private processTemplateVariables(
    content: string,
    template: ComponentTemplate,
    config: TemplateGenerationConfig
  ): string {
    const variables = {
      componentName: config.componentName,
      framework: config.targetFramework,
      language: config.targetLanguage,
      description: template.description,
      author: template.author.name,
      date: new Date().toISOString().split('T')[0],
      ...config.customization
    };

    let processed = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  private shouldIncludeFile(file: TemplateFile, config: TemplateGenerationConfig): boolean {
    switch (file.type) {
      case 'test':
        return config.includeTests;
      case 'story':
        return config.includeStories;
      case 'documentation':
        return config.includeDocs;
      case 'style':
        return config.includeStyles;
      default:
        return true;
    }
  }

  private generateImports(template: ComponentTemplate, config: TemplateGenerationConfig): string {
    const imports: string[] = [];
    
    if (config.targetFramework === 'react') {
      imports.push("import React from 'react';");
    }

    // Add dependency imports
    for (const dep of template.dependencies) {
      if (dep.type === 'runtime' && dep.name !== 'react') {
        imports.push(`import ${dep.name} from '${dep.name}';`);
      }
    }

    return imports.join('\n');
  }

  private generateInterfaces(template: ComponentTemplate, config: TemplateGenerationConfig): string {
    if (template.structure.props.length === 0) return '';
    
    let content = `interface ${config.componentName}Props {\n`;
    
    for (const prop of template.structure.props) {
      const optional = prop.required ? '' : '?';
      content += `  /** ${prop.description} */\n`;
      content += `  ${prop.name}${optional}: ${prop.type};\n`;
    }
    
    content += '}';
    return content;
  }

  private generateComponent(template: ComponentTemplate, config: TemplateGenerationConfig): string {
    const { componentName, targetFramework, targetLanguage } = config;
    
    if (targetFramework === 'react') {
      const hasProps = template.structure.props.length > 0;
      const propsParam = hasProps ? 
        (targetLanguage === 'typescript' ? `props: ${componentName}Props` : 'props') : '';
      
      let content = `const ${componentName} = (${propsParam}) => {\n`;
      
      // Add state if defined
      for (const state of template.structure.state) {
        content += `  const [${state.name}, set${state.name.charAt(0).toUpperCase() + state.name.slice(1)}] = React.useState(${JSON.stringify(state.initialValue)});\n`;
      }
      
      if (template.structure.state.length > 0) {
        content += '\n';
      }
      
      // Add methods
      for (const method of template.structure.methods) {
        if (method.implementation) {
          content += `  ${method.implementation}\n\n`;
        }
      }
      
      // Generate JSX return
      content += '  return (\n';
      content += `    <div className="${componentName.toLowerCase()}">\n`;
      content += `      {/* ${componentName} implementation */}\n`;
      content += '    </div>\n';
      content += '  );\n';
      content += '};';
      
      return content;
    }
    
    return `// ${componentName} component implementation`;
  }

  private generateExports(template: ComponentTemplate, config: TemplateGenerationConfig): string {
    return `export default ${config.componentName};\nexport { ${config.componentName} };`;
  }

  private generateCssStyles(template: ComponentTemplate, config: TemplateGenerationConfig): string {
    const className = config.componentName.toLowerCase();
    let content = `.${className} {\n`;
    
    // Add default styles from template
    for (const variable of template.structure.styling.variables) {
      const property = this.cssPropertyFromVariable(variable.name, variable.type);
      content += `  ${property}: ${variable.defaultValue};\n`;
    }
    
    content += '}\n';
    return content;
  }

  private generateScssStyles(template: ComponentTemplate, config: TemplateGenerationConfig): string {
    // Similar to CSS but with SCSS syntax
    return this.generateCssStyles(template, config);
  }

  private generateStyledComponentsStyles(template: ComponentTemplate, config: TemplateGenerationConfig): string {
    let content = `import styled from 'styled-components';\n\n`;
    content += `export const Styled${config.componentName} = styled.div\`\n`;
    
    for (const variable of template.structure.styling.variables) {
      const property = this.cssPropertyFromVariable(variable.name, variable.type);
      content += `  ${property}: ${variable.defaultValue};\n`;
    }
    
    content += '\`;\n';
    return content;
  }

  private cssPropertyFromVariable(name: string, type: string): string {
    const typeMap: Record<string, string> = {
      'color': 'color',
      'size': 'font-size',
      'spacing': 'margin',
      'typography': 'font-family',
      'shadow': 'box-shadow',
      'border': 'border'
    };
    
    return typeMap[type] || name.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  private getTestValue(type: string): string {
    const valueMap: Record<string, string> = {
      'string': '"test"',
      'number': '42',
      'boolean': 'true',
      'function': '() => {}',
      'object': '{}',
      'array': '[]'
    };
    
    return valueMap[type] || '"test"';
  }

  private getDefaultValue(type: string): any {
    const valueMap: Record<string, any> = {
      'string': '',
      'number': 0,
      'boolean': false,
      'function': null,
      'object': {},
      'array': []
    };
    
    return valueMap[type] || null;
  }

  private getStorybookControlType(type: string): string {
    const controlMap: Record<string, string> = {
      'string': 'text',
      'number': 'number',
      'boolean': 'boolean',
      'function': 'object',
      'object': 'object',
      'array': 'object'
    };
    
    return controlMap[type] || 'text';
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private async loadDefaultTemplates(): Promise<void> {
    const defaultTemplates: Omit<ComponentTemplate, 'id' | 'metadata'>[] = [
      {
        name: 'Basic Button',
        description: 'A customizable button component with variants and states',
        category: 'ui',
        framework: 'react',
        language: 'typescript',
        complexity: 'basic',
        tags: ['button', 'ui', 'interactive'],
        author: {
          id: 'system',
          name: 'System'
        },
        isPublic: true,
        isFeatured: true,
        structure: {
          componentName: 'Button',
          props: [
            {
              name: 'children',
              type: 'React.ReactNode',
              description: 'Button content',
              required: true,
              category: 'basic'
            },
            {
              name: 'variant',
              type: "'primary' | 'secondary' | 'danger'",
              description: 'Button variant',
              required: false,
              defaultValue: 'primary',
              category: 'styling'
            },
            {
              name: 'size',
              type: "'small' | 'medium' | 'large'",
              description: 'Button size',
              required: false,
              defaultValue: 'medium',
              category: 'styling'
            },
            {
              name: 'disabled',
              type: 'boolean',
              description: 'Whether button is disabled',
              required: false,
              defaultValue: false,
              category: 'behavior'
            },
            {
              name: 'onClick',
              type: '() => void',
              description: 'Click handler',
              required: false,
              category: 'event'
            }
          ],
          state: [],
          methods: [],
          lifecycle: [],
          styling: {
            type: 'css',
            customizable: true,
            variables: [
              {
                name: 'primary-color',
                type: 'color',
                description: 'Primary button color',
                defaultValue: '#007bff'
              },
              {
                name: 'border-radius',
                type: 'size',
                description: 'Button border radius',
                defaultValue: '4px'
              }
            ],
            breakpoints: []
          },
          variants: [
            {
              name: 'Primary Button',
              description: 'Default primary button',
              modifications: [
                {
                  type: 'prop',
                  target: 'variant',
                  value: 'primary'
                }
              ]
            },
            {
              name: 'Secondary Button',
              description: 'Secondary button variant',
              modifications: [
                {
                  type: 'prop',
                  target: 'variant',
                  value: 'secondary'
                }
              ]
            }
          ]
        },
        configuration: {
          customization: {
            allowedModifications: ['props', 'styling'],
            requiredProps: ['children'],
            optionalFeatures: ['icons', 'loading-state']
          },
          scaffolding: {
            generateTests: true,
            generateStories: true,
            generateDocs: true,
            includeStyles: true,
            includeTypes: true
          },
          integration: {
            supportedDesignSystems: ['material-ui', 'ant-design', 'chakra-ui'],
            compatibleLibraries: ['react-icons'],
            requiredPolyfills: []
          }
        },
        dependencies: [
          {
            name: 'react',
            version: '^18.0.0',
            type: 'peer',
            description: 'React library',
            optional: false
          }
        ],
        files: [],
        examples: [
          {
            id: 'basic',
            name: 'Basic Usage',
            description: 'Simple button example',
            code: '<Button onClick={() => alert("Clicked!")}>Click me</Button>',
            complexity: 'basic',
            configuration: {}
          }
        ],
        documentation: {
          readme: '# Button Component\n\nA versatile button component for React applications.',
          apiReference: 'API reference content...',
          guides: [],
          troubleshooting: [],
          changelog: []
        }
      }
    ];

    for (const templateData of defaultTemplates) {
      const template: ComponentTemplate = {
        ...templateData,
        id: this.generateId('template'),
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
          downloads: 0,
          rating: 4.5,
          reviews: 10,
          usageCount: 0
        }
      };
      this.templates.set(template.id, template);
    }

    console.log(`Loaded ${defaultTemplates.length} default templates`);
  }

  private async loadTemplateCategories(): Promise<void> {
    const categories: TemplateCategory[] = [
      {
        id: 'ui',
        name: 'UI Components',
        description: 'Basic user interface components',
        icon: 'component',
        templates: [],
        subcategories: [
          {
            id: 'buttons',
            name: 'Buttons',
            description: 'Button components and variants',
            templates: []
          },
          {
            id: 'inputs',
            name: 'Form Inputs',
            description: 'Input components for forms',
            templates: []
          }
        ]
      },
      {
        id: 'layout',
        name: 'Layout',
        description: 'Layout and container components',
        icon: 'layout',
        templates: [],
        subcategories: []
      },
      {
        id: 'form',
        name: 'Forms',
        description: 'Form components and utilities',
        icon: 'form',
        templates: [],
        subcategories: []
      },
      {
        id: 'data',
        name: 'Data Display',
        description: 'Components for displaying data',
        icon: 'table',
        templates: [],
        subcategories: []
      },
      {
        id: 'navigation',
        name: 'Navigation',
        description: 'Navigation and menu components',
        icon: 'menu',
        templates: [],
        subcategories: []
      }
    ];

    for (const category of categories) {
      this.categories.set(category.id, category);
    }

    console.log(`Loaded ${categories.length} template categories`);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    this.templates.clear();
    this.categories.clear();
    this.userTemplates.clear();
    this.templateUsage.clear();
  }
}

// Export singleton instance
export const templateService = new TemplateService();
export default TemplateService;