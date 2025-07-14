import type { ChatMessage } from '../../types/chat.types';
import { MessageType, MessageStatus } from '../../types/chat.types';

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

export function MessageBubble({ 
  message, 
  showTimestamp = true,
  className = ""
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.type === MessageType.SYSTEM;

  if (isSystem) {
    return (
      <div className={`flex justify-center my-4 ${className}`}>
        <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full max-w-md text-center">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-600 text-white'
          }`}>
            {isUser ? 'U' : 'AI'}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message Bubble */}
          <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
          }`}>
            <MessageContent message={message} />
            
            {/* Status indicator for user messages */}
            {isUser && message.status && (
              <MessageStatusIndicator status={message.status} />
            )}
          </div>

          {/* Timestamp */}
          {showTimestamp && (
            <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTimestamp(message.timestamp)}
            </div>
          )}

          {/* Metadata */}
          {message.metadata && (
            <MessageMetadata metadata={message.metadata} isUser={isUser} />
          )}
        </div>
      </div>
    </div>
  );
}

function MessageContent({ message }: { message: ChatMessage }) {
  switch (message.type) {
    case MessageType.CODE:
      return (
        <div>
          <div className="mb-2 text-sm">Code snippet:</div>
          <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
            <code>{message.content}</code>
          </pre>
        </div>
      );
    
    case MessageType.ERROR:
      return (
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="text-red-700 font-medium mb-1">Error</div>
            <div className="text-red-600">{message.content}</div>
          </div>
        </div>
      );
    
    case MessageType.IMAGE:
      return (
        <div>
          {message.content && (
            <div className="mb-2">{message.content}</div>
          )}
          {message.metadata?.imageUrl && (
            <img 
              src={message.metadata.imageUrl} 
              alt="Shared image" 
              className="max-w-full h-auto rounded-lg"
            />
          )}
        </div>
      );
    
    default:
      return (
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      );
  }
}

function MessageStatusIndicator({ status }: { status: MessageStatus }) {
  const getStatusInfo = () => {
    switch (status) {
      case MessageStatus.SENDING:
        return { icon: '○', color: 'text-blue-300', title: 'Sending...' };
      case MessageStatus.SENT:
        return { icon: '✓', color: 'text-blue-300', title: 'Sent' };
      case MessageStatus.RECEIVED:
        return { icon: '✓✓', color: 'text-blue-300', title: 'Delivered' };
      case MessageStatus.PROCESSING:
        return { icon: '⋯', color: 'text-blue-300', title: 'Processing...' };
      case MessageStatus.ERROR:
        return { icon: '!', color: 'text-red-300', title: 'Failed to send' };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <div 
      className={`absolute -bottom-4 right-0 text-xs ${statusInfo.color}`}
      title={statusInfo.title}
    >
      {statusInfo.icon}
    </div>
  );
}

function MessageMetadata({ metadata, isUser }: { metadata: any; isUser: boolean }) {
  if (!metadata.componentId && !metadata.requestType && !metadata.changes) {
    return null;
  }

  return (
    <div className={`mt-2 text-xs ${isUser ? 'text-right' : 'text-left'}`}>
      {metadata.componentId && (
        <div className="text-gray-500">
          Component: {metadata.componentId}
        </div>
      )}
      {metadata.requestType && (
        <div className="text-gray-500 capitalize">
          Type: {metadata.requestType}
        </div>
      )}
      {metadata.changes && metadata.changes.length > 0 && (
        <div className="text-gray-500">
          {metadata.changes.length} file{metadata.changes.length > 1 ? 's' : ''} modified
        </div>
      )}
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}