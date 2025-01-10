import { useState, useRef } from "react";
import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/24/outline";

interface MessageInputProps {
  onSendMessage: (content: string, files?: FileList) => void;
}

export const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <PaperClipIcon className="h-5 w-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => {
            if (e.target.files?.length) {
              onSendMessage(message, e.target.files);
              setMessage("");
            }
          }}
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
};
