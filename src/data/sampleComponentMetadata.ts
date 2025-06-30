import { ComponentMetadata, ComponentStatus } from '../types/component.types';
import { defaultCategories } from '../services/componentMetadata.service';

// Sample metadata for existing components
export const sampleComponentMetadata: ComponentMetadata[] = [
  {
    id: 'motto-component',
    name: 'MottoComponent',
    displayName: 'Motto Component',
    description: 'A conversion-focused component displaying motivational text with customizable styling',
    category: defaultCategories[0], // Conversion
    tags: ['hero', 'cta', 'motivation', 'conversion'],
    version: '1.0.0',
    author: 'AI Assistant',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
    status: ComponentStatus.ACTIVE,
    aiModifiable: true,
    chatEnabled: true,
    usage: {
      examples: [
        {
          title: 'Basic Usage',
          code: `<MottoComponent 
  title="Transform Your Ideas" 
  subtitle="Into Reality"
  theme="gradient" 
/>`,
          language: 'jsx',
          preview: true
        },
        {
          title: 'With Custom Styling',
          code: `<MottoComponent 
  title="Build Amazing Things" 
  subtitle="Start Today"
  theme="dark"
  className="my-8"
/>`,
          language: 'jsx',
          preview: true
        }
      ],
      documentation: 'The Motto Component is designed for high-impact messaging in hero sections and landing pages.',
      bestPractices: [
        'Keep titles concise and impactful',
        'Use contrasting colors for better visibility',
        'Place above the fold for maximum impact'
      ]
    },
    properties: {
      props: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Main heading text'
        },
        {
          name: 'subtitle',
          type: 'string',
          required: false,
          description: 'Secondary text below the title'
        },
        {
          name: 'theme',
          type: "'light' | 'dark' | 'gradient'",
          required: false,
          default: 'light',
          description: 'Visual theme of the component'
        },
        {
          name: 'className',
          type: 'string',
          required: false,
          description: 'Additional CSS classes'
        }
      ],
      cssVariables: [
        {
          name: '--motto-primary-color',
          default: '#3B82F6',
          description: 'Primary color for the component',
          type: 'color'
        },
        {
          name: '--motto-text-size',
          default: '3rem',
          description: 'Base font size for the title',
          type: 'size'
        }
      ]
    },
    dependencies: ['react', 'tailwindcss']
  }
];

// Initialize metadata on first load
export function initializeSampleMetadata() {
  if (typeof window !== 'undefined' && !localStorage.getItem('metadata-initialized')) {
    // Import the service dynamically to avoid circular dependencies
    import('../services/componentMetadata.service').then(({ componentMetadataService, defaultCategories }) => {
      // Register default categories
      defaultCategories.forEach(category => {
        componentMetadataService.registerCategory(category);
      });

      // Register sample components
      sampleComponentMetadata.forEach(component => {
        componentMetadataService.registerComponent(component);
      });

      localStorage.setItem('metadata-initialized', 'true');
    });
  }
}