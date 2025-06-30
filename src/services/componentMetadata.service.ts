import {
  ComponentMetadata,
  ComponentCategory,
  ComponentRegistry,
  ComponentFilter,
  ComponentSortOptions,
  ComponentStatus
} from '../types/component.types';

class ComponentMetadataService {
  private registry: ComponentRegistry;
  private storageKey = 'component-metadata-registry';

  constructor() {
    this.registry = {
      components: new Map(),
      categories: new Map(),
      tags: new Set()
    };
    this.loadFromStorage();
  }

  // Load metadata from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.registry.components = new Map(data.components);
        this.registry.categories = new Map(data.categories);
        this.registry.tags = new Set(data.tags);
      }
    } catch (error) {
      console.error('Failed to load component metadata:', error);
    }
  }

  // Save metadata to localStorage
  private saveToStorage(): void {
    try {
      const data = {
        components: Array.from(this.registry.components.entries()),
        categories: Array.from(this.registry.categories.entries()),
        tags: Array.from(this.registry.tags)
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save component metadata:', error);
    }
  }

  // Register a new component
  registerComponent(metadata: ComponentMetadata): void {
    this.registry.components.set(metadata.id, metadata);
    
    // Update tags registry
    metadata.tags.forEach(tag => this.registry.tags.add(tag));
    
    this.saveToStorage();
  }

  // Register a category
  registerCategory(category: ComponentCategory): void {
    this.registry.categories.set(category.id, category);
    this.saveToStorage();
  }

  // Get component by ID
  getComponent(id: string): ComponentMetadata | undefined {
    return this.registry.components.get(id);
  }

  // Get all components
  getAllComponents(): ComponentMetadata[] {
    return Array.from(this.registry.components.values());
  }

  // Get components by filter
  getFilteredComponents(filter: ComponentFilter): ComponentMetadata[] {
    let components = this.getAllComponents();

    // Filter by categories
    if (filter.categories && filter.categories.length > 0) {
      components = components.filter(c => 
        filter.categories!.includes(c.category.id)
      );
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      components = components.filter(c =>
        filter.tags!.some(tag => c.tags.includes(tag))
      );
    }

    // Filter by status
    if (filter.status && filter.status.length > 0) {
      components = components.filter(c =>
        filter.status!.includes(c.status)
      );
    }

    // Filter by search term
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      components = components.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.displayName.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by AI modifiable
    if (filter.aiModifiable !== undefined) {
      components = components.filter(c => c.aiModifiable === filter.aiModifiable);
    }

    // Filter by chat enabled
    if (filter.chatEnabled !== undefined) {
      components = components.filter(c => c.chatEnabled === filter.chatEnabled);
    }

    return components;
  }

  // Sort components
  sortComponents(
    components: ComponentMetadata[],
    options: ComponentSortOptions
  ): ComponentMetadata[] {
    const sorted = [...components];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      switch (options.field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'category':
          comparison = a.category.name.localeCompare(b.category.name);
          break;
      }
      
      return options.order === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }

  // Get all categories
  getAllCategories(): ComponentCategory[] {
    return Array.from(this.registry.categories.values());
  }

  // Get category by ID
  getCategory(id: string): ComponentCategory | undefined {
    return this.registry.categories.get(id);
  }

  // Get categories hierarchy
  getCategoryHierarchy(): ComponentCategory[] {
    const categories = this.getAllCategories();
    const rootCategories = categories.filter(c => !c.parent);
    
    const buildHierarchy = (parent: string): ComponentCategory[] => {
      return categories
        .filter(c => c.parent === parent)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    };
    
    // Build nested structure
    const hierarchy: ComponentCategory[] = [];
    rootCategories.forEach(root => {
      hierarchy.push({
        ...root,
        // Add children property for UI rendering
        children: buildHierarchy(root.id)
      } as ComponentCategory & { children?: ComponentCategory[] });
    });
    
    return hierarchy;
  }

  // Get all tags
  getAllTags(): string[] {
    return Array.from(this.registry.tags).sort();
  }

  // Update component metadata
  updateComponent(id: string, updates: Partial<ComponentMetadata>): void {
    const component = this.getComponent(id);
    if (component) {
      const updated = {
        ...component,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.registerComponent(updated);
    }
  }

  // Delete component
  deleteComponent(id: string): void {
    this.registry.components.delete(id);
    this.saveToStorage();
  }

  // Clear all data
  clearAll(): void {
    this.registry.components.clear();
    this.registry.categories.clear();
    this.registry.tags.clear();
    this.saveToStorage();
  }
}

// Export singleton instance
export const componentMetadataService = new ComponentMetadataService();

// Export default categories
export const defaultCategories: ComponentCategory[] = [
  {
    id: 'conversion',
    name: 'Conversion',
    slug: 'conversion',
    description: 'Components optimized for conversion and CTAs',
    icon: '🎯',
    order: 1
  },
  {
    id: 'marketing',
    name: 'Marketing',
    slug: 'marketing',
    description: 'Marketing and promotional components',
    icon: '📢',
    order: 2
  },
  {
    id: 'layout',
    name: 'Layout',
    slug: 'layout',
    description: 'Layout and structure components',
    icon: '📐',
    order: 3
  },
  {
    id: 'forms',
    name: 'Forms',
    slug: 'forms',
    description: 'Form and input components',
    icon: '📝',
    order: 4
  },
  {
    id: 'navigation',
    name: 'Navigation',
    slug: 'navigation',
    description: 'Navigation and menu components',
    icon: '🧭',
    order: 5
  },
  {
    id: 'content',
    name: 'Content',
    slug: 'content',
    description: 'Content display components',
    icon: '📄',
    order: 6
  }
];