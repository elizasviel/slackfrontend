import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, DirectMessage } from "../../types";
import { socket } from "../../services/socket";
import { DirectMessageView } from "./DirectMessageView";
import { RichTextEditor } from "../chat/ChatArea";
import { Avatar } from "../shared/Avatar";
import { UserStatus } from "../../types";
import api from "../../services/api";

interface DirectMessageChatProps {
  user: User;
}

const getDirectMessages = async (userId: string): Promise<DirectMessage[]> => {
  const response = await api.get(`/messages/direct?userId=${userId}`);
  return response.data;
};

export const DirectMessageChat = ({ user }: DirectMessageChatProps) => {
  const [messages, setMessages] = useState<DirectMessage[]>([]);

  const { data: initialMessages } = useQuery({
    queryKey: ["directMessages", user.id],
    queryFn: () => getDirectMessages(user.id),
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    const handleNewMessage = (message: DirectMessage) => {
      if (message.fromId === user.id || message.toId === user.id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("dm:message", handleNewMessage);

    return () => {
      socket.off("dm:message", handleNewMessage);
    };
  }, [user.id]);

  const sendMessage = (content: string) => {
    socket.emit("dm:send", {
      toId: user.id,
      content,
    });
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "ONLINE":
        return "bg-green-400";
      case "AWAY":
        return "bg-yellow-400";
      case "DO_NOT_DISTURB":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-none p-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar user={user} size="lg" />
            <span
              className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${getStatusColor(
                user.status
              )}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {user.fullName || user.username}
            </h2>
            <p className="text-sm text-gray-500 capitalize">
              {user.status.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>

      <DirectMessageView messages={messages} />

      <div className="flex-none p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <RichTextEditor onSendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
};
