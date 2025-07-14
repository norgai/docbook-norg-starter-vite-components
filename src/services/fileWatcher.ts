// File Watcher Service for Component Changes
import { websocketService } from './websocketService';

export interface FileWatchConfig {
  enabled: boolean;
  watchPatterns: string[];
  debounceMs: number;
  maxFileSize: number; // in bytes
}

export interface FileChangeNotification {
  file: string;
  type: 'created' | 'modified' | 'deleted';
  timestamp: string;
  size?: number;
  content?: string;
}

class FileWatcherService {
  private config: FileWatchConfig;
  private watchedFiles: Set<string> = new Set();
  private debounceTimers: Map<string, number> = new Map();
  private isWatching = false;

  constructor(config: Partial<FileWatchConfig> = {}) {
    this.config = {
      enabled: true,
      watchPatterns: [
        'src/components/**/*.tsx',
        'src/components/**/*.ts',
        'src/pages/**/*.tsx',
        'src/pages/**/*.ts',
        'src/styles/**/*.css',
        'src/styles/**/*.scss'
      ],
      debounceMs: 300,
      maxFileSize: 1024 * 1024, // 1MB
      ...config
    };
  }

  startWatching(componentId?: string): void {
    if (!this.config.enabled || this.isWatching) {
      return;
    }

    this.isWatching = true;
    console.log('Starting file watcher for component changes');

    // In a real implementation, this would use the File System Access API
    // or a file watcher library. For now, we'll simulate with polling.
    this.setupFileSystemWatcher(componentId);
  }

  stopWatching(): void {
    this.isWatching = false;
    this.clearDebounceTimers();
    this.watchedFiles.clear();
    console.log('Stopped file watcher');
  }

  watchFile(filePath: string): void {
    if (this.watchedFiles.has(filePath)) {
      return;
    }

    this.watchedFiles.add(filePath);
    console.log(`Now watching file: ${filePath}`);

    // Subscribe to WebSocket file changes for this file
    websocketService.subscribeToFileChanges([filePath]);
  }

  unwatchFile(filePath: string): void {
    this.watchedFiles.delete(filePath);
    this.clearDebounceTimer(filePath);
    console.log(`Stopped watching file: ${filePath}`);
  }

  private setupFileSystemWatcher(componentId?: string): void {
    // Listen for file changes from WebSocket (N8N workflows can notify of changes)
    websocketService.on('fileChange', this.handleFileChange.bind(this));

    // If we have a specific component, watch its files
    if (componentId) {
      const componentFiles = this.getComponentFiles(componentId);
      componentFiles.forEach(file => this.watchFile(file));
    }

    // Setup browser-based file watching using Page Visibility API and focus events
    this.setupBrowserWatcher();
  }

  private setupBrowserWatcher(): void {
    // Watch for page visibility changes (user switching tabs/windows)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isWatching) {
        this.checkForChanges();
      }
    });

    // Watch for window focus events
    window.addEventListener('focus', () => {
      if (this.isWatching) {
        this.checkForChanges();
      }
    });

    // Periodic check for changes (fallback)
    setInterval(() => {
      if (this.isWatching && !document.hidden) {
        this.checkForChanges();
      }
    }, 5000); // Check every 5 seconds when active
  }

  private handleFileChange(change: any): void {
    const filePath = change.file;
    
    // Clear existing debounce timer
    this.clearDebounceTimer(filePath);

    // Set new debounce timer
    const timerId = window.setTimeout(() => {
      this.processFileChange(change);
      this.debounceTimers.delete(filePath);
    }, this.config.debounceMs);

    this.debounceTimers.set(filePath, timerId);
  }

  private processFileChange(change: any): void {
    const notification: FileChangeNotification = {
      file: change.file,
      type: change.type,
      timestamp: change.timestamp || new Date().toISOString(),
      size: change.size,
      content: change.content
    };

    console.log('File change detected:', notification);

    // Emit to components that are listening
    this.notifyFileChange(notification);

    // Trigger HMR if available
    if (this.shouldTriggerHMR(change.file)) {
      this.triggerHMR(change.file);
    }
  }

  private checkForChanges(): void {
    // Request file status from N8N/WebSocket
    websocketService.requestProgressUpdate('file-check');
  }

  private getComponentFiles(componentId: string): string[] {
    // Generate likely file paths for a component
    return [
      `src/components/${componentId}.tsx`,
      `src/components/${componentId}/index.tsx`,
      `src/components/${componentId}/${componentId}.tsx`,
      `src/pages/${componentId}.tsx`,
      `src/pages/${componentId}/index.tsx`,
    ];
  }

  private shouldTriggerHMR(filePath: string): boolean {
    // Check if file type supports HMR
    return filePath.endsWith('.tsx') || 
           filePath.endsWith('.jsx') || 
           filePath.endsWith('.ts') || 
           filePath.endsWith('.js') ||
           filePath.endsWith('.css') ||
           filePath.endsWith('.scss');
  }

  private triggerHMR(filePath: string): void {
    // In Vite, HMR is handled automatically, but we can trigger manual updates
    if (import.meta.hot) {
      console.log(`Triggering HMR for: ${filePath}`);
      
      // For CSS files
      if (filePath.endsWith('.css') || filePath.endsWith('.scss')) {
        import.meta.hot.invalidate();
      }
      
      // For component files, the HMR will be handled by React Fast Refresh
      // We can emit a custom event for components to react to
      window.dispatchEvent(new CustomEvent('component-updated', {
        detail: { file: filePath, timestamp: new Date().toISOString() }
      }));
    }
  }

  private notifyFileChange(notification: FileChangeNotification): void {
    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('file-changed', {
      detail: notification
    }));

    // Also notify through WebSocket if connected
    if (websocketService.isConnected()) {
      // Could send acknowledgment or request more details
    }
  }

  private clearDebounceTimer(filePath: string): void {
    const timerId = this.debounceTimers.get(filePath);
    if (timerId) {
      clearTimeout(timerId);
      this.debounceTimers.delete(filePath);
    }
  }

  private clearDebounceTimers(): void {
    this.debounceTimers.forEach(timerId => clearTimeout(timerId));
    this.debounceTimers.clear();
  }
}

// Default file watcher instance
export const fileWatcher = new FileWatcherService();
export default FileWatcherService;