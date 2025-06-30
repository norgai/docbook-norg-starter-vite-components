import { useState, useEffect, useCallback } from 'react';
import {
  ComponentMetadata,
  ComponentCategory,
  ComponentFilter,
  ComponentSortOptions
} from '../types/component.types';
import { componentMetadataService } from '../services/componentMetadata.service';

export function useComponentMetadata() {
  const [components, setComponents] = useState<ComponentMetadata[]>([]);
  const [categories, setCategories] = useState<ComponentCategory[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = () => {
      setComponents(componentMetadataService.getAllComponents());
      setCategories(componentMetadataService.getAllCategories());
      setTags(componentMetadataService.getAllTags());
      setLoading(false);
    };

    loadData();
  }, []);

  // Get filtered components
  const getFilteredComponents = useCallback(
    (filter: ComponentFilter, sortOptions?: ComponentSortOptions) => {
      let filtered = componentMetadataService.getFilteredComponents(filter);
      
      if (sortOptions) {
        filtered = componentMetadataService.sortComponents(filtered, sortOptions);
      }
      
      return filtered;
    },
    []
  );

  // Register component
  const registerComponent = useCallback((metadata: ComponentMetadata) => {
    componentMetadataService.registerComponent(metadata);
    setComponents(componentMetadataService.getAllComponents());
    setTags(componentMetadataService.getAllTags());
  }, []);

  // Update component
  const updateComponent = useCallback(
    (id: string, updates: Partial<ComponentMetadata>) => {
      componentMetadataService.updateComponent(id, updates);
      setComponents(componentMetadataService.getAllComponents());
    },
    []
  );

  // Delete component
  const deleteComponent = useCallback((id: string) => {
    componentMetadataService.deleteComponent(id);
    setComponents(componentMetadataService.getAllComponents());
  }, []);

  // Get component by ID
  const getComponent = useCallback((id: string) => {
    return componentMetadataService.getComponent(id);
  }, []);

  // Get category hierarchy
  const getCategoryHierarchy = useCallback(() => {
    return componentMetadataService.getCategoryHierarchy();
  }, []);

  return {
    components,
    categories,
    tags,
    loading,
    getFilteredComponents,
    registerComponent,
    updateComponent,
    deleteComponent,
    getComponent,
    getCategoryHierarchy
  };
}

// Hook for managing component filters
export function useComponentFilter(initialFilter: ComponentFilter = {}) {
  const [filter, setFilter] = useState<ComponentFilter>(initialFilter);
  const [sortOptions, setSortOptions] = useState<ComponentSortOptions>({
    field: 'name',
    order: 'asc'
  });

  const updateFilter = useCallback((updates: Partial<ComponentFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({});
  }, []);

  const toggleCategory = useCallback((categoryId: string) => {
    setFilter(prev => {
      const categories = prev.categories || [];
      const index = categories.indexOf(categoryId);
      
      if (index > -1) {
        return {
          ...prev,
          categories: categories.filter(id => id !== categoryId)
        };
      } else {
        return {
          ...prev,
          categories: [...categories, categoryId]
        };
      }
    });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilter(prev => {
      const tags = prev.tags || [];
      const index = tags.indexOf(tag);
      
      if (index > -1) {
        return {
          ...prev,
          tags: tags.filter(t => t !== tag)
        };
      } else {
        return {
          ...prev,
          tags: [...tags, tag]
        };
      }
    });
  }, []);

  return {
    filter,
    sortOptions,
    updateFilter,
    clearFilter,
    toggleCategory,
    toggleTag,
    setSortOptions
  };
}