import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '../services/websocketService';
import { fileWatcher } from '../services/fileWatcher';
import type { ProgressUpdate, FileChangeEvent } from '../services/websocketService';
import type { FileChangeNotification } from '../services/fileWatcher';

export interface RealTimeState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastProgress: ProgressUpdate | null;
  fileChanges: FileChangeNotification[];
  error: string | null;
}

export interface UseRealTimeUpdatesOptions {
  conversationId?: string;
  componentId?: string;
  autoConnect?: boolean;
  watchFiles?: boolean;
  maxFileChanges?: number;
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const {
    conversationId,
    componentId,
    autoConnect = true,
    watchFiles = true,
    maxFileChanges = 50
  } = options;

  const [state, setState] = useState<RealTimeState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    lastProgress: null,
    fileChanges: [],
    error: null
  });

  const connectionAttempted = useRef(false);
  const subscriptionsActive = useRef(false);

  // Connection management
  const connect = useCallback(async () => {
    if (state.isConnected || state.connectionStatus === 'connecting') {
      return;
    }

    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));

    try {
      await websocketService.connect();
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        connectionStatus: 'connected',
        error: null 
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        connectionStatus: 'error',
        error: error.message 
      }));
    }
  }, [state.isConnected, state.connectionStatus]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    if (watchFiles) {
      fileWatcher.stopWatching();
    }
    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      connectionStatus: 'disconnected',
      error: null 
    }));
    subscriptionsActive.current = false;
  }, [watchFiles]);

  // Subscription management
  const setupSubscriptions = useCallback(() => {
    if (subscriptionsActive.current) {
      return;
    }

    // Subscribe to chat updates
    if (conversationId && componentId) {
      websocketService.subscribeToChat(conversationId, componentId);
    }

    // Setup file watching
    if (watchFiles && componentId) {
      fileWatcher.startWatching(componentId);
    }

    subscriptionsActive.current = true;
  }, [conversationId, componentId, watchFiles]);

  const cleanupSubscriptions = useCallback(() => {
    if (conversationId) {
      websocketService.unsubscribeFromChat(conversationId);
    }
    
    if (watchFiles) {
      fileWatcher.stopWatching();
    }

    subscriptionsActive.current = false;
  }, [conversationId, watchFiles]);

  // Progress update handling
  const handleProgressUpdate = useCallback((update: ProgressUpdate) => {
    // Filter by conversation if specified
    if (conversationId && update.data?.conversationId !== conversationId) {
      return;
    }

    setState(prev => ({ ...prev, lastProgress: update }));

    // Emit custom event for components to listen to
    window.dispatchEvent(new CustomEvent('progress-update', { detail: update }));
  }, [conversationId]);

  // File change handling
  const handleFileChange = useCallback((change: FileChangeNotification) => {
    setState(prev => ({
      ...prev,
      fileChanges: [change, ...prev.fileChanges].slice(0, maxFileChanges)
    }));

    // Emit custom event
    window.dispatchEvent(new CustomEvent('file-changed', { detail: change }));
  }, [maxFileChanges]);

  // WebSocket event handlers
  const handleConnectionChange = useCallback((data: any) => {
    setState(prev => ({
      ...prev,
      isConnected: data.status === 'connected',
      connectionStatus: data.status,
      error: data.error || data.message || null
    }));
  }, []);

  const handleN8NStatus = useCallback((data: any) => {
    // Handle N8N workflow status updates
    if (data.type === 'workflow-progress') {
      handleProgressUpdate(data);
    }
  }, [handleProgressUpdate]);

  const handleComponentUpdate = useCallback((data: any) => {
    // Handle component update notifications
    window.dispatchEvent(new CustomEvent('component-updated', { detail: data }));
  }, []);

  // Setup event listeners
  useEffect(() => {
    // WebSocket events
    websocketService.on('connection', handleConnectionChange);
    websocketService.on('progress', handleProgressUpdate);
    websocketService.on('fileChange', (data: FileChangeEvent) => {
      handleFileChange({
        file: data.file,
        type: data.type === 'file-changed' ? 'modified' : 
              data.type === 'file-added' ? 'created' : 'deleted',
        timestamp: data.timestamp,
        content: data.content
      });
    });
    websocketService.on('n8nStatus', handleN8NStatus);
    websocketService.on('componentUpdate', handleComponentUpdate);

    // File watcher events
    const handleFileWatcherChange = (event: Event) => {
      const customEvent = event as CustomEvent<FileChangeNotification>;
      handleFileChange(customEvent.detail);
    };

    window.addEventListener('file-changed', handleFileWatcherChange);

    return () => {
      websocketService.off('connection', handleConnectionChange);
      websocketService.off('progress', handleProgressUpdate);
      websocketService.off('fileChange');
      websocketService.off('n8nStatus', handleN8NStatus);
      websocketService.off('componentUpdate', handleComponentUpdate);
      window.removeEventListener('file-changed', handleFileWatcherChange);
    };
  }, [
    handleConnectionChange,
    handleProgressUpdate,
    handleFileChange,
    handleN8NStatus,
    handleComponentUpdate
  ]);

  // Auto-connect and setup subscriptions
  useEffect(() => {
    if (autoConnect && !connectionAttempted.current) {
      connectionAttempted.current = true;
      connect();
    }
  }, [autoConnect, connect]);

  useEffect(() => {
    if (state.isConnected && (conversationId || componentId)) {
      setupSubscriptions();
    }

    return () => {
      if (subscriptionsActive.current) {
        cleanupSubscriptions();
      }
    };
  }, [state.isConnected, conversationId, componentId, setupSubscriptions, cleanupSubscriptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscriptions();
    };
  }, [cleanupSubscriptions]);

  // Utility functions
  const requestProgress = useCallback(() => {
    if (conversationId && state.isConnected) {
      websocketService.requestProgressUpdate(conversationId);
    }
  }, [conversationId, state.isConnected]);

  const clearFileChanges = useCallback(() => {
    setState(prev => ({ ...prev, fileChanges: [] }));
  }, []);

  const retry = useCallback(() => {
    if (state.connectionStatus === 'error') {
      setState(prev => ({ ...prev, error: null }));
      connect();
    }
  }, [state.connectionStatus, connect]);

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    requestProgress,
    clearFileChanges,
    retry,
    
    // Computed
    hasRecentProgress: !!state.lastProgress && 
      (Date.now() - new Date(state.lastProgress.data?.timestamp || 0).getTime()) < 60000,
    hasRecentFileChanges: state.fileChanges.length > 0 &&
      (Date.now() - new Date(state.fileChanges[0].timestamp).getTime()) < 30000,
  };
}