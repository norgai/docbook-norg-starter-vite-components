import type { QueueItem } from "../../types/chat.types";
import { QueueStatusIndicator } from "./QueueStatusIndicator";

interface QueueStatusListProps {
  queues: QueueItem[];
}

export function QueueStatusList({ queues }: QueueStatusListProps) {
  if (queues.length === 0) {
    return <></>;
  }

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-full flex flex-col gap-2">
        {queues.map((queue) => (
          <QueueStatusIndicator key={queue.id} status={queue.status} message={queue.message} prUrl={queue.prUrl} />
        ))}
      </div>
    </div>
  );
}
