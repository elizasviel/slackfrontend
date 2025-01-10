import { DirectMessage } from "../../types";
import { format } from "date-fns";
import { Avatar } from "../shared/Avatar";

interface DirectMessageItemProps {
  message: DirectMessage;
}

export const DirectMessageItem = ({ message }: DirectMessageItemProps) => {
  return (
    <div className="flex items-start space-x-3">
      <Avatar user={message.from} size="md" />
      <div className="flex-1">
        <div className="flex items-baseline space-x-2">
          <span className="font-medium">
            {message.from.fullName || message.from.username}
          </span>
          <span className="text-xs text-gray-500">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
        </div>
        <div
          className="text-gray-900"
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
      </div>
    </div>
  );
};
