import React from "react";
import { Clock, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { QueueStatus } from "../../types/chat.types";

interface QueueStatusIndicatorProps {
  status: QueueStatus;
  message: string;
  prUrl?: string;
}

export const QueueStatusIndicator: React.FC<QueueStatusIndicatorProps> = ({ status, message, prUrl }) => {
  const getStatusIcon = () => {
    switch (status) {
      case QueueStatus.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case QueueStatus.PROCESSING:
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case QueueStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case QueueStatus.FAILED:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case QueueStatus.PENDING:
        return `Position in queue: calculating...`;
      case QueueStatus.PROCESSING:
        return "AI is modifying your component...";
      case QueueStatus.COMPLETED:
        return "Changes completed successfully!";
      case QueueStatus.FAILED:
        return "Processing failed. Please try again.";
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
      {getStatusIcon()}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">Your request: {message}</p>
        <p className="text-xs text-gray-500">{getStatusMessage()}</p>
        {(status === QueueStatus.PENDING || status === QueueStatus.PROCESSING) && <p className="text-xs text-gray-500">Estimated time: 5 - 10 minutes</p>}
        {prUrl && status === QueueStatus.COMPLETED && (
          <a href={prUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
            View Pull Request →
          </a>
        )}
      </div>
    </div>
  );
};
