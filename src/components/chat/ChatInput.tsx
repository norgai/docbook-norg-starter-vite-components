import React, { useState, useRef } from 'react';
import type { FileAttachment } from '../../types/chat.types';
import type { KeyboardEvent } from 'react';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  allowAttachments?: boolean;
  isTyping?: boolean;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 4000,
  allowAttachments = true,
  isTyping = false,
  className = ""
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;
    if (disabled || isTyping) return;

    onSendMessage(message.trim(), attachments);
    setMessage('');
    setAttachments([]);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const attachment: FileAttachment = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        uploadStatus: 'pending'
      };
      
      // Create preview for images
      if (attachment.type === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => 
            prev.map(a => 
              a.id === attachment.id 
                ? { ...a, preview: e.target?.result as string }
                : a
            )
          );
        };
        reader.readAsDataURL(file);
      }
      
      setAttachments(prev => [...prev, attachment]);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const canSend = (message.trim() || attachments.length > 0) && !disabled && !isTyping;

  return (
    <div className={`bg-white border-t border-gray-200 ${className}`}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {attachments.map(attachment => (
              <div
                key={attachment.id}
                className="relative bg-gray-100 rounded-lg p-2 flex items-center gap-2 max-w-48"
              >
                {attachment.type === 'image' && attachment.preview ? (
                  <img 
                    src={attachment.preview} 
                    alt={attachment.file.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {attachment.file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(attachment.file.size)}
                  </div>
                </div>
                
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-3">
          {/* Attachment Button */}
          {allowAttachments && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Attach files"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          )}

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "Chat is disabled" : placeholder}
              disabled={disabled}
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       disabled:bg-gray-100 disabled:cursor-not-allowed
                       placeholder-gray-500 text-gray-900"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Character count */}
            {message.length > maxLength * 0.8 && (
              <div className={`absolute -top-6 right-0 text-xs ${
                message.length > maxLength ? 'text-red-500' : 'text-gray-500'
              }`}>
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!canSend}
            className={`p-2 rounded-lg transition-colors ${
              canSend
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title={canSend ? "Send message" : "Enter a message to send"}
          >
            {isTyping ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            AI is typing...
          </div>
        )}
      </form>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}