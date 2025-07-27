import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComponentMetadata, useComponentFilter } from '../hooks/useComponentMetadata';
import { FilterBar } from '../components/filters';
import { ComponentGrid, ComponentDetailView } from '../components/component';
import { CategoryNavigation, Breadcrumb, TagCloud } from '../components/navigation';
import type { BreadcrumbItem } from '../components/navigation';
import type { ComponentMetadata } from '../types/component.types';

export function ComponentShowcase() {
  const { componentId, categoryId } = useParams<{ componentId?: string; categoryId?: string }>();
  const navigate = useNavigate();
  
  const {
    components,
    categories,
    tags,
    loading,
    getFilteredComponents,
    getComponent,
    getCategoryHierarchy
  } = useComponentMetadata();

  const {
    filter,
    sortOptions,
    updateFilter,
    clearFilter,
    toggleCategory,
    toggleTag,
    setSortOptions
  } = useComponentFilter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentMetadata | null>(null);

  // Handle URL parameters
  useEffect(() => {
    if (componentId) {
      const component = getComponent(componentId);
      setSelectedComponent(component || null);
    } else {
      setSelectedComponent(null);
    }
  }, [componentId, getComponent]);

  useEffect(() => {
    if (categoryId && !filter.categories?.includes(categoryId)) {
      toggleCategory(categoryId);
    }
  }, [categoryId, filter.categories, toggleCategory]);

  // Get filtered and sorted components
  const filteredComponents = getFilteredComponents(filter, sortOptions);

  // Build breadcrumb
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Components', href: '/components', icon: '🧩' }
  ];

  if (selectedComponent) {
    if (selectedComponent.category) {
      breadcrumbItems.push({
        label: selectedComponent.category.name,
        href: `/components/category/${selectedComponent.category.id}`,
        icon: selectedComponent.category.icon
      });
    }
    breadcrumbItems.push({
      label: selectedComponent.displayName,
      current: true
    });
  } else if (categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      breadcrumbItems.push({
        label: category.name,
        icon: category.icon,
        current: true
      });
    }
  }

  const handleComponentSelect = (component: ComponentMetadata) => {
    navigate(`/components/${component.id}`);
  };

  const handleCategorySelect = (categoryId: string) => {
    if (filter.categories?.includes(categoryId)) {
      toggleCategory(categoryId);
    } else {
      toggleCategory(categoryId);
      navigate(`/components/category/${categoryId}`);
    }
  };

  const handleBackToGrid = () => {
    navigate('/components');
  };

  const handleChatWithComponent = () => {
    if (selectedComponent) {
      navigate(`/components/${selectedComponent.id}/chat`);
    }
  };

  const handleEditComponent = () => {
    if (selectedComponent) {
      navigate(`/components/${selectedComponent.id}/edit`);
    }
  };

  // Calculate tag counts
  const tagCounts = tags.reduce((counts, tag) => {
    counts[tag] = components.filter(c => c.tags.includes(tag)).length;
    return counts;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Browse Components</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Category Navigation */}
            <CategoryNavigation
              categories={getCategoryHierarchy()}
              selectedCategories={filter.categories || []}
              onCategorySelect={handleCategorySelect}
              onClearSelection={() => {
                clearFilter();
                navigate('/components');
              }}
            />

            {/* Tag Cloud */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Tags</h3>
              <TagCloud
                tags={tags}
                selectedTags={filter.tags || []}
                onTagSelect={toggleTag}
                onTagDeselect={toggleTag}
                maxTags={20}
                showCount={true}
                tagCounts={tagCounts}
              />
            </div>

            {/* Component Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Library Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Components</span>
                  <span className="font-medium">{components.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-medium">{categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Modifiable</span>
                  <span className="font-medium">
                    {components.filter(c => c.aiModifiable).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chat Enabled</span>
                  <span className="font-medium">
                    {components.filter(c => c.chatEnabled).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-80">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Breadcrumb */}
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-3">
              {selectedComponent && (
                <button
                  onClick={handleBackToGrid}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back to Grid
                </button>
              )}
              
              <div className="text-sm text-gray-500">
                {filteredComponents.length} component{filteredComponents.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          {selectedComponent ? (
            /* Component Detail View */
            <ComponentDetailView
              component={selectedComponent}
              onChat={selectedComponent.chatEnabled ? handleChatWithComponent : undefined}
              onEdit={selectedComponent.aiModifiable ? handleEditComponent : undefined}
            />
          ) : (
            /* Component Grid View */
            <div className="space-y-6">
              {/* Filter Bar */}
              <FilterBar
                filter={filter}
                sortOptions={sortOptions}
                categories={categories}
                tags={tags}
                onUpdateFilter={updateFilter}
                onSortChange={setSortOptions}
                onClearFilter={clearFilter}
                onToggleCategory={toggleCategory}
                onToggleTag={toggleTag}
              />

              {/* Component Grid */}
              <ComponentGrid
                components={filteredComponents}
                onComponentClick={handleComponentSelect}
                loading={loading}
                emptyMessage={
                  filter.search || (filter.categories?.length || 0) > 0 || (filter.tags?.length || 0) > 0
                    ? "No components match your current filters. Try adjusting your search criteria."
                    : "No components available. Add some components to get started."
                }
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}