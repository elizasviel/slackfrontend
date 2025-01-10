import { Message } from "../../types";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  onThreadClick?: (message: Message) => void;
}

export const MessageList = ({ messages, onThreadClick }: MessageListProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onThreadClick={onThreadClick}
        />
      ))}
    </div>
  );
};
