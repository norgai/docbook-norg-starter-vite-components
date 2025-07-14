// Export Service
// Handles component export in various formats with dependency management

export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  description: string;
  supportedFrameworks: string[];
  options: ExportOption[];
}

export interface ExportOption {
  key: string;
  label: string;
  type: 'boolean' | 'string' | 'number' | 'select' | 'multiselect';
  defaultValue: any;
  options?: Array<{ value: any; label: string }>;
  description: string;
  required: boolean;
}

export interface ExportConfiguration {
  format: string;
  options: Record<string, any>;
  includeTypes?: boolean;
  includeDependencies?: boolean;
  includeTests?: boolean;
  includeStories?: boolean;
  includeDocumentation?: boolean;
  packageMetadata?: {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    keywords: string[];
  };
}

export interface ExportResult {
  success: boolean;
  files: ExportedFile[];
  packageInfo?: PackageInfo;
  warnings: string[];
  errors: string[];
  metadata: {
    exportedAt: string;
    format: string;
    totalSize: number;
    fileCount: number;
    dependencyCount: number;
  };
}

export interface ExportedFile {
  name: string;
  path: string;
  content: string;
  type: 'component' | 'types' | 'styles' | 'test' | 'story' | 'documentation' | 'config' | 'package';
  size: number;
  encoding: 'utf8' | 'base64';
  dependencies: string[];
}

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  main: string;
  types?: string;
  files: string[];
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts: Record<string, string>;
  keywords: string[];
  author: string;
  license: string;
  repository?: {
    type: string;
    url: string;
  };
}

class ExportService {
  private formats: Map<string, ExportFormat> = new Map();
  private isInitialized = false;

  // Initialize with supported formats
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await this.loadSupportedFormats();
    this.isInitialized = true;
    console.log('Export service initialized');
  }

  // Get available export formats
  async getAvailableFormats(framework?: string): Promise<ExportFormat[]> {
    await this.ensureInitialized();
    
    let formats = Array.from(this.formats.values());
    
    if (framework) {
      formats = formats.filter(format => 
        format.supportedFrameworks.includes(framework) || 
        format.supportedFrameworks.includes('universal')
      );
    }

    return formats;
  }

  // Export component
  async exportComponent(
    _componentId: string,
    componentData: any,
    config: ExportConfiguration
  ): Promise<ExportResult> {
    await this.ensureInitialized();

    const format = this.formats.get(config.format);
    if (!format) {
      throw new Error(`Unsupported export format: ${config.format}`);
    }

    // Track export start time (not used currently)
    Date.now();
    const files: ExportedFile[] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      // Generate main component file
      const componentFile = await this.generateComponentFile(componentData, format, config);
      files.push(componentFile);

      // Generate types if requested
      if (config.includeTypes && componentData.language === 'typescript') {
        const typesFile = await this.generateTypesFile(componentData, format, config);
        if (typesFile) files.push(typesFile);
      }

      // Generate styles if component has styling
      if (componentData.styles) {
        const stylesFile = await this.generateStylesFile(componentData, format, config);
        if (stylesFile) files.push(stylesFile);
      }

      // Generate tests if requested
      if (config.includeTests) {
        const testFile = await this.generateTestFile(componentData, format, config);
        if (testFile) files.push(testFile);
      }

      // Generate stories if requested
      if (config.includeStories) {
        const storyFile = await this.generateStoryFile(componentData, format, config);
        if (storyFile) files.push(storyFile);
      }

      // Generate documentation if requested
      if (config.includeDocumentation) {
        const docsFile = await this.generateDocumentationFile(componentData, format, config);
        if (docsFile) files.push(docsFile);
      }

      // Generate package.json if requested
      let packageInfo: PackageInfo | undefined;
      if (config.packageMetadata) {
        packageInfo = await this.generatePackageInfo(componentData, config);
        const packageFile = await this.generatePackageFile(packageInfo);
        files.push(packageFile);
      }

      // Generate additional config files
      const configFiles = await this.generateConfigFiles(componentData, format, config);
      files.push(...configFiles);

      // Calculate metadata
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const dependencies = new Set(files.flatMap(file => file.dependencies));

      return {
        success: true,
        files,
        packageInfo,
        warnings,
        errors,
        metadata: {
          exportedAt: new Date().toISOString(),
          format: config.format,
          totalSize,
          fileCount: files.length,
          dependencyCount: dependencies.size
        }
      };

    } catch (error: any) {
      errors.push(error.message);
      
      return {
        success: false,
        files,
        warnings,
        errors,
        metadata: {
          exportedAt: new Date().toISOString(),
          format: config.format,
          totalSize: 0,
          fileCount: 0,
          dependencyCount: 0
        }
      };
    }
  }

  // Generate component file
  private async generateComponentFile(
    componentData: any,
    format: ExportFormat,
    config: ExportConfiguration
  ): Promise<ExportedFile> {
    const { name, code, dependencies } = componentData;
    let content = code;

    // Apply format-specific transformations
    switch (format.id) {
      case 'react_typescript':
        content = await this.generateReactTypeScriptComponent(componentData, config);
        break;
      case 'react_javascript':
        content = await this.generateReactJavaScriptComponent(componentData, config);
        break;
      case 'vue_typescript':
        content = await this.generateVueTypeScriptComponent(componentData, config);
        break;
      case 'vue_javascript':
        content = await this.generateVueJavaScriptComponent(componentData, config);
        break;
      default:
        content = await this.generateGenericComponent(componentData, config);
    }

    const fileName = `${name}.${format.extension}`;
    
    return {
      name: fileName,
      path: fileName,
      content,
      type: 'component',
      size: content.length,
      encoding: 'utf8',
      dependencies: dependencies || []
    };
  }

  // Generate React TypeScript component
  private async generateReactTypeScriptComponent(
    componentData: any,
    config: ExportConfiguration
  ): Promise<string> {
    const { name, props, code } = componentData;
    
    // Clean and format the component code
    let cleanCode = code;
    
    // Add proper imports
    const imports = [`import React from 'react';`];
    
    if (config.options.includeStyleImports && componentData.styles) {
      imports.push(`import './${name}.css';`);
    }

    // Add prop types interface if not present
    let propsInterface = '';
    if (props && props.length > 0 && !code.includes('interface') && !code.includes('type')) {
      propsInterface = `
interface ${name}Props {
${props.map((prop: any) => `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};`).join('\n')}
}

`;
    }

    // Ensure proper export
    if (!cleanCode.includes('export')) {
      cleanCode = `export default ${cleanCode}`;
    }

    return `${imports.join('\n')}

${propsInterface}${cleanCode}`;
  }

  // Generate React JavaScript component
  private async generateReactJavaScriptComponent(
    componentData: any,
    config: ExportConfiguration
  ): Promise<string> {
    const { name, code } = componentData;
    
    let cleanCode = code;
    
    // Remove TypeScript syntax
    cleanCode = cleanCode.replace(/:\s*[A-Za-z<>[\]|&\s]+(?=\s*[=;,)])/g, '');
    cleanCode = cleanCode.replace(/interface\s+\w+\s*{[^}]*}/gs, '');
    
    const imports = [`import React from 'react';`];
    
    if (config.options.includeStyleImports && componentData.styles) {
      imports.push(`import './${name}.css';`);
    }

    if (!cleanCode.includes('export')) {
      cleanCode = `export default ${cleanCode}`;
    }

    return `${imports.join('\n')}

${cleanCode}`;
  }

  // Generate Vue TypeScript component
  private async generateVueTypeScriptComponent(
    componentData: any,
    _config: ExportConfiguration
  ): Promise<string> {
    const { name, props } = componentData;
    
    // Convert React component to Vue structure
    const vueProps = props?.map((prop: any) => ({
      name: prop.name,
      type: this.mapTypeScriptToVue(prop.type),
      required: prop.required
    })) || [];

    return `<template>
  <div class="${name.toLowerCase()}">
    <!-- Component content -->
  </div>
</template>

<script setup lang="ts">
interface Props {
${vueProps.map((prop: any) => `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};`).join('\n')}
}

const props = defineProps<Props>();
</script>

<style scoped>
/* Component styles */
</style>`;
  }

  // Generate Vue JavaScript component
  private async generateVueJavaScriptComponent(
    componentData: any,
    _config: ExportConfiguration
  ): Promise<string> {
    const { name, props } = componentData;
    
    const vueProps = props?.reduce((acc: any, prop: any) => {
      acc[prop.name] = {
        type: this.mapTypeToVueJS(prop.type),
        required: prop.required
      };
      return acc;
    }, {}) || {};

    return `<template>
  <div class="${name.toLowerCase()}">
    <!-- Component content -->
  </div>
</template>

<script>
export default {
  name: '${name}',
  props: ${JSON.stringify(vueProps, null, 2)}
}
</script>

<style scoped>
/* Component styles */
</style>`;
  }

  // Generate generic component
  private async generateGenericComponent(
    componentData: any,
    _config: ExportConfiguration
  ): Promise<string> {
    return componentData.code;
  }

  // Generate types file
  private async generateTypesFile(
    componentData: any,
    _format: ExportFormat,
    _config: ExportConfiguration
  ): Promise<ExportedFile | null> {
    if (!componentData.props || componentData.props.length === 0) {
      return null;
    }

    const { name, props } = componentData;
    
    const content = `// Type definitions for ${name}

export interface ${name}Props {
${props.map((prop: any) => {
  const optional = prop.required ? '' : '?';
  return `  /** ${prop.description || 'No description'} */
  ${prop.name}${optional}: ${prop.type};`;
}).join('\n')}
}

export default ${name}Props;
`;

    return {
      name: `${name}.types.ts`,
      path: `types/${name}.types.ts`,
      content,
      type: 'types',
      size: content.length,
      encoding: 'utf8',
      dependencies: []
    };
  }

  // Generate styles file
  private async generateStylesFile(
    componentData: any,
    _format: ExportFormat,
    config: ExportConfiguration
  ): Promise<ExportedFile | null> {
    if (!componentData.styles) return null;

    const { name, styles } = componentData;
    const extension = config.options.styleFormat || 'css';
    
    let content = styles;
    
    // Add CSS module wrapper if requested
    if (config.options.useCSSModules) {
      content = `.${name.toLowerCase()} {
${content.split('\n').map((line: string) => `  ${line}`).join('\n')}
}`;
    }

    return {
      name: `${name}.${extension}`,
      path: `styles/${name}.${extension}`,
      content,
      type: 'styles',
      size: content.length,
      encoding: 'utf8',
      dependencies: []
    };
  }

  // Generate test file
  private async generateTestFile(
    componentData: any,
    _format: ExportFormat,
    _config: ExportConfiguration
  ): Promise<ExportedFile | null> {
    const { name, framework } = componentData;
    
    let content = '';
    
    if (framework === 'react') {
      content = `import React from 'react';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
  });

  it('displays content correctly', () => {
    render(<${name} />);
    // Add specific test assertions here
  });
});
`;
    } else if (framework === 'vue') {
      content = `import { mount } from '@vue/test-utils';
import ${name} from './${name}.vue';

describe('${name}', () => {
  it('renders properly', () => {
    const wrapper = mount(${name});
    expect(wrapper.exists()).toBe(true);
  });

  it('displays content correctly', () => {
    const wrapper = mount(${name});
    // Add specific test assertions here
  });
});
`;
    }

    if (!content) return null;

    return {
      name: `${name}.test.${componentData.language === 'typescript' ? 'ts' : 'js'}`,
      path: `tests/${name}.test.${componentData.language === 'typescript' ? 'ts' : 'js'}`,
      content,
      type: 'test',
      size: content.length,
      encoding: 'utf8',
      dependencies: ['@testing-library/react', '@testing-library/jest-dom']
    };
  }

  // Generate Storybook story file
  private async generateStoryFile(
    componentData: any,
    _format: ExportFormat,
    _config: ExportConfiguration
  ): Promise<ExportedFile | null> {
    const { name, props, framework } = componentData;
    
    if (framework !== 'react') return null; // Currently only support React stories

    const hasProps = props && props.length > 0;
    
    const content = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
${hasProps ? `  argTypes: {
${props.map((prop: any) => `    ${prop.name}: {
      description: '${prop.description || 'No description'}',
      control: { type: '${this.getStorybookControlType(prop.type)}' },
    },`).join('\n')}
  },` : ''}
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
${hasProps ? `  args: {
${props.filter((p: any) => p.required).map((prop: any) => `    ${prop.name}: ${this.getDefaultValueForType(prop.type)},`).join('\n')}
  },` : ''}
};

${hasProps ? props.map((prop: any) => `
export const With${prop.name.charAt(0).toUpperCase() + prop.name.slice(1)}: Story = {
  args: {
    ...Default.args,
    ${prop.name}: ${this.getExampleValueForType(prop.type)},
  },
};`).join('') : ''}
`;

    return {
      name: `${name}.stories.ts`,
      path: `stories/${name}.stories.ts`,
      content,
      type: 'story',
      size: content.length,
      encoding: 'utf8',
      dependencies: ['@storybook/react']
    };
  }

  // Generate documentation file
  private async generateDocumentationFile(
    componentData: any,
    _format: ExportFormat,
    _config: ExportConfiguration
  ): Promise<ExportedFile | null> {
    const { name, description, props, usage } = componentData;
    
    const content = `# ${name}

${description || 'Component description'}

## Usage

\`\`\`${componentData.language}
${usage?.examples?.[0]?.code || `<${name} />`}
\`\`\`

${props && props.length > 0 ? `## Props

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
${props.map((prop: any) => `| ${prop.name} | \`${prop.type}\` | ${prop.required ? '✅' : '❌'} | ${prop.default || '-'} | ${prop.description || '-'} |`).join('\n')}
` : ''}

## Examples

${usage?.examples?.map((example: any, index: number) => `
### ${example.title || `Example ${index + 1}`}

${example.description || ''}

\`\`\`${componentData.language}
${example.code}
\`\`\`
`).join('') || ''}

## Best Practices

${usage?.bestPractices?.map((practice: string) => `- ${practice}`).join('\n') || '- Follow component naming conventions\n- Use proper prop types\n- Include accessible attributes'}
`;

    return {
      name: `${name}.md`,
      path: `docs/${name}.md`,
      content,
      type: 'documentation',
      size: content.length,
      encoding: 'utf8',
      dependencies: []
    };
  }

  // Generate package.json
  private async generatePackageInfo(
    componentData: any,
    config: ExportConfiguration
  ): Promise<PackageInfo> {
    const { name, dependencies, framework, language } = componentData;
    const { packageMetadata } = config;

    const mainFile = `${name}.${language === 'typescript' ? 'ts' : 'js'}`;
    const typesFile = language === 'typescript' ? `types/${name}.types.ts` : undefined;

    return {
      name: packageMetadata?.name || `@components/${name.toLowerCase()}`,
      version: packageMetadata?.version || '1.0.0',
      description: packageMetadata?.description || `${name} component`,
      main: mainFile,
      types: typesFile,
      files: [
        mainFile,
        ...(typesFile ? [typesFile] : []),
        `styles/${name}.css`,
        `docs/${name}.md`
      ],
      dependencies: {
        ...(framework === 'react' ? { 'react': '^18.0.0' } : {}),
        ...(framework === 'vue' ? { 'vue': '^3.0.0' } : {}),
        ...dependencies?.reduce((acc: any, dep: any) => ({ ...acc, [dep]: 'latest' }), {})
      },
      devDependencies: {
        ...(language === 'typescript' ? { 'typescript': '^5.0.0' } : {}),
        ...(framework === 'react' ? { '@types/react': '^18.0.0' } : {})
      },
      peerDependencies: {
        ...(framework === 'react' ? { 'react': '>=16.8.0', 'react-dom': '>=16.8.0' } : {}),
        ...(framework === 'vue' ? { 'vue': '>=3.0.0' } : {})
      },
      scripts: {
        build: 'tsc',
        test: 'jest',
        lint: 'eslint .',
        'storybook': 'storybook dev -p 6006'
      },
      keywords: packageMetadata?.keywords || [name.toLowerCase(), 'component', framework],
      author: packageMetadata?.author || 'Component Builder',
      license: packageMetadata?.license || 'MIT'
    };
  }

  private async generatePackageFile(packageInfo: PackageInfo): Promise<ExportedFile> {
    const content = JSON.stringify(packageInfo, null, 2);
    
    return {
      name: 'package.json',
      path: 'package.json',
      content,
      type: 'package',
      size: content.length,
      encoding: 'utf8',
      dependencies: []
    };
  }

  // Generate additional config files
  private async generateConfigFiles(
    componentData: any,
    _format: ExportFormat,
    _config: ExportConfiguration
  ): Promise<ExportedFile[]> {
    const files: ExportedFile[] = [];

    // TypeScript config
    if (componentData.language === 'typescript') {
      const tsConfig = {
        compilerOptions: {
          target: 'es5',
          lib: ['dom', 'dom.iterable', 'es6'],
          allowJs: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noFallthroughCasesInSwitch: true,
          module: 'esnext',
          moduleResolution: 'node',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: componentData.framework === 'react' ? 'react-jsx' : 'preserve'
        },
        include: ['**/*'],
        exclude: ['node_modules']
      };

      files.push({
        name: 'tsconfig.json',
        path: 'tsconfig.json',
        content: JSON.stringify(tsConfig, null, 2),
        type: 'config',
        size: JSON.stringify(tsConfig).length,
        encoding: 'utf8',
        dependencies: []
      });
    }

    // README.md
    const readme = `# ${componentData.name}

${componentData.description || 'Component description'}

## Installation

\`\`\`bash
npm install ${_config.packageMetadata?.name || `@components/${componentData.name.toLowerCase()}`}
\`\`\`

## Usage

\`\`\`${componentData.language}
import { ${componentData.name} } from '${_config.packageMetadata?.name || `@components/${componentData.name.toLowerCase()}`}';

<${componentData.name} />
\`\`\`

## Development

\`\`\`bash
npm install
npm run build
npm test
\`\`\`

## License

${_config.packageMetadata?.license || 'MIT'}
`;

    files.push({
      name: 'README.md',
      path: 'README.md',
      content: readme,
      type: 'documentation',
      size: readme.length,
      encoding: 'utf8',
      dependencies: []
    });

    return files;
  }

  // Helper methods
  private mapTypeScriptToVue(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'string[]': 'string[]',
      'number[]': 'number[]',
      'React.ReactNode': 'VNode',
      'React.ReactElement': 'VNode',
      'Function': 'Function',
      'object': 'object'
    };
    
    return typeMap[type] || 'unknown';
  }

  private mapTypeToVueJS(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': 'Number',
      'boolean': 'Boolean',
      'string[]': 'Array',
      'number[]': 'Array',
      'object': 'Object',
      'Function': 'Function'
    };
    
    return typeMap[type] || 'String';
  }

  private getStorybookControlType(type: string): string {
    const controlMap: Record<string, string> = {
      'string': 'text',
      'number': 'number',
      'boolean': 'boolean',
      'string[]': 'object',
      'object': 'object'
    };
    
    return controlMap[type] || 'text';
  }

  private getDefaultValueForType(type: string): string {
    const defaultMap: Record<string, string> = {
      'string': '""',
      'number': '0',
      'boolean': 'false',
      'string[]': '[]',
      'object': '{}'
    };
    
    return defaultMap[type] || '""';
  }

  private getExampleValueForType(type: string): string {
    const exampleMap: Record<string, string> = {
      'string': '"Example"',
      'number': '42',
      'boolean': 'true',
      'string[]': '["item1", "item2"]',
      'object': '{ key: "value" }'
    };
    
    return exampleMap[type] || '"Example"';
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // Load supported export formats
  private async loadSupportedFormats(): Promise<void> {
    const formats: ExportFormat[] = [
      {
        id: 'react_typescript',
        name: 'React TypeScript',
        extension: 'tsx',
        mimeType: 'text/typescript',
        description: 'React component with TypeScript support',
        supportedFrameworks: ['react'],
        options: [
          {
            key: 'includeStyleImports',
            label: 'Include style imports',
            type: 'boolean',
            defaultValue: true,
            description: 'Include CSS/SCSS imports in component',
            required: false
          },
          {
            key: 'useCSSModules',
            label: 'Use CSS Modules',
            type: 'boolean',
            defaultValue: false,
            description: 'Generate CSS Module compatible styles',
            required: false
          }
        ]
      },
      {
        id: 'react_javascript',
        name: 'React JavaScript',
        extension: 'jsx',
        mimeType: 'text/javascript',
        description: 'React component with JavaScript',
        supportedFrameworks: ['react'],
        options: [
          {
            key: 'includeStyleImports',
            label: 'Include style imports',
            type: 'boolean',
            defaultValue: true,
            description: 'Include CSS/SCSS imports in component',
            required: false
          }
        ]
      },
      {
        id: 'vue_typescript',
        name: 'Vue TypeScript',
        extension: 'vue',
        mimeType: 'text/vue',
        description: 'Vue 3 component with TypeScript',
        supportedFrameworks: ['vue'],
        options: [
          {
            key: 'useCompositionAPI',
            label: 'Use Composition API',
            type: 'boolean',
            defaultValue: true,
            description: 'Use Vue 3 Composition API syntax',
            required: false
          }
        ]
      },
      {
        id: 'vue_javascript',
        name: 'Vue JavaScript',
        extension: 'vue',
        mimeType: 'text/vue',
        description: 'Vue component with JavaScript',
        supportedFrameworks: ['vue'],
        options: [
          {
            key: 'useOptionsAPI',
            label: 'Use Options API',
            type: 'boolean',
            defaultValue: true,
            description: 'Use Vue Options API syntax',
            required: false
          }
        ]
      },
      {
        id: 'zip_package',
        name: 'ZIP Package',
        extension: 'zip',
        mimeType: 'application/zip',
        description: 'Complete package as ZIP archive',
        supportedFrameworks: ['universal'],
        options: [
          {
            key: 'includeNodeModules',
            label: 'Include node_modules',
            type: 'boolean',
            defaultValue: false,
            description: 'Include dependencies in package',
            required: false
          }
        ]
      },
      {
        id: 'npm_package',
        name: 'NPM Package',
        extension: 'tgz',
        mimeType: 'application/gzip',
        description: 'NPM-ready package',
        supportedFrameworks: ['universal'],
        options: [
          {
            key: 'publishReady',
            label: 'Publish ready',
            type: 'boolean',
            defaultValue: true,
            description: 'Include all files needed for NPM publish',
            required: false
          }
        ]
      }
    ];

    for (const format of formats) {
      this.formats.set(format.id, format);
    }

    console.log(`Loaded ${formats.length} export formats`);
  }
}

// Export singleton instance
export const exportService = new ExportService();
export default ExportService;