import { Message } from "../../types";
import { MessageItem } from "./MessageItem";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface MessageListProps {
  messages: Message[];
  onThreadClick?: (message: Message) => void;
}

export const MessageList = ({ messages, onThreadClick }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [_, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollHeight, scrollTop, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      onScroll={handleScroll}
    >
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onThreadClick={onThreadClick}
        />
      ))}
      <div ref={messagesEndRef} />

      <button
        onClick={scrollToBottom}
        className="fixed bottom-48 right-8 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-50"
        title="Scroll to bottom"
      >
        <ChevronDownIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};
