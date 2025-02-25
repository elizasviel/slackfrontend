import { DirectMessage } from "../../types";
import { DirectMessageItem } from "./DirectMessageItem";

interface DirectMessageViewProps {
  messages: DirectMessage[];
}

export const DirectMessageView = ({ messages }: DirectMessageViewProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <DirectMessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};
