import { useState, useEffect } from 'react';
import type { ProgressUpdate } from '../../services/websocketService';

interface ProgressIndicatorProps {
  conversationId?: string;
  className?: string;
  showDetails?: boolean;
  position?: 'fixed' | 'relative' | 'absolute';
}

export function ProgressIndicator({
  conversationId,
  className = '',
  showDetails = true,
  position = 'relative'
}: ProgressIndicatorProps) {
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [stages, setStages] = useState<ProgressUpdate[]>([]);

  useEffect(() => {
    const handleProgress = (event: CustomEvent<ProgressUpdate>) => {
      const update = event.detail;
      
      // Only show progress for our conversation
      if (conversationId && update.data?.conversationId !== conversationId) {
        return;
      }

      setProgress(update);
      setIsVisible(true);

      // Add to stages history
      setStages(prev => {
        const updated = [...prev];
        const existingIndex = updated.findIndex(s => s.stage === update.stage);
        
        if (existingIndex >= 0) {
          updated[existingIndex] = update;
        } else {
          updated.push(update);
        }
        
        return updated.slice(-5); // Keep last 5 stages
      });

      // Auto-hide after completion
      if (update.type === 'completion' || update.type === 'error') {
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            setProgress(null);
            setStages([]);
          }, 300);
        }, 3000);
      }
    };

    // Listen for progress updates
    window.addEventListener('progress-update', handleProgress as EventListener);

    return () => {
      window.removeEventListener('progress-update', handleProgress as EventListener);
    };
  }, [conversationId]);

  if (!progress || !isVisible) {
    return null;
  }

  const positionClasses = {
    fixed: 'fixed top-4 right-4 z-50',
    relative: 'relative',
    absolute: 'absolute top-4 right-4'
  };

  const progressColor = progress.type === 'error' ? 'bg-red-500' : 
                       progress.type === 'completion' ? 'bg-green-500' : 
                       'bg-blue-500';

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-80 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {progress.type === 'error' ? 'Error' :
             progress.type === 'completion' ? 'Completed' :
             'Processing'}
          </h3>
          <div className="flex items-center space-x-2">
            {progress.type === 'progress' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
            {progress.type === 'completion' && (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {progress.type === 'error' && (
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>

        {/* Current Stage */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 font-medium">{progress.stage}</span>
            <span className="text-gray-500">{Math.round(progress.progress)}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className={`${progressColor} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-3">{progress.message}</p>

        {/* Stage History */}
        {showDetails && stages.length > 1 && (
          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Progress Steps</h4>
            <div className="space-y-1">
              {stages.map((stage, index) => (
                <div key={`${stage.stage}-${index}`} className="flex items-center text-xs">
                  <div className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${
                    stage.type === 'completion' ? 'bg-green-400' :
                    stage.type === 'error' ? 'bg-red-400' :
                    stage.progress === 100 ? 'bg-green-400' :
                    stage.progress > 0 ? 'bg-blue-400' :
                    'bg-gray-300'
                  }`} />
                  <span className={`${
                    stage.type === 'error' ? 'text-red-600' :
                    stage.progress === 100 ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {stage.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Data */}
        {progress.data && showDetails && (
          <div className="border-t border-gray-100 pt-3 mt-3">
            <details className="text-xs">
              <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                Technical Details
              </summary>
              <pre className="mt-1 text-gray-600 overflow-x-auto">
                {JSON.stringify(progress.data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// Mini progress indicator for inline use
export function MiniProgressIndicator({ 
  progress, 
  className = '',
  size = 'sm' 
}: { 
  progress: number; 
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}) {
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-2', 
    md: 'h-3'
  };

  return (
    <div className={`bg-gray-200 rounded-full ${sizeClasses[size]} ${className}`}>
      <div 
        className="bg-blue-500 h-full rounded-full transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
}

// Floating progress toast
export function ProgressToast({ 
  message, 
  progress, 
  type = 'info',
  onClose 
}: { 
  message: string; 
  progress?: number;
  type?: 'info' | 'success' | 'error' | 'warning';
  onClose?: () => void;
}) {
  const typeColors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  const progressColors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${typeColors[type]} min-w-80 max-w-md`}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium pr-2">{message}</p>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {typeof progress === 'number' && (
        <div className="mt-2 bg-white bg-opacity-50 rounded-full h-1">
          <div 
            className={`${progressColors[type]} h-1 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}