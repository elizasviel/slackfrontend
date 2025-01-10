import { useState, useEffect } from "react";
import { Message, Reaction } from "../../types";
import { socket } from "../../services/socket";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ThreadViewProps {
  parentMessage: Message;
  onClose: () => void;
}

export const ThreadView = ({ parentMessage, onClose }: ThreadViewProps) => {
  const [replies, setReplies] = useState<Message[]>([]);
  const [threadParent, setThreadParent] = useState<Message>(parentMessage);

  useEffect(() => {
    setThreadParent(parentMessage);
  }, [parentMessage]);

  useEffect(() => {
    socket.emit("thread:get", parentMessage.id);

    const handleReplies = (threadReplies: Message[]) => {
      setReplies(threadReplies);
    };

    const handleNewReply = (reply: Message) => {
      if (reply.threadParentId === parentMessage.id) {
        setReplies((prev) => [...prev, reply]);
      }
    };

    const handleMessageUpdate = (updatedMessage: Message) => {
      if (updatedMessage.id === parentMessage.id) {
        setThreadParent(updatedMessage);
      } else {
        setReplies((prevReplies) =>
          prevReplies.map((reply) =>
            reply.id === updatedMessage.id ? updatedMessage : reply
          )
        );
      }
    };

    const handleMessageDelete = (data: { messageId: string }) => {
      setReplies((prevReplies) =>
        prevReplies.filter((reply) => reply.id !== data.messageId)
      );
    };

    const handleNewReaction = (reaction: Reaction) => {
      if (reaction.messageId === parentMessage.id) {
        setThreadParent((prev) => ({
          ...prev,
          reactions: [...(prev.reactions || []), reaction],
        }));
      } else {
        setReplies((prevReplies) =>
          prevReplies.map((reply) => {
            if (reply.id === reaction.messageId) {
              return {
                ...reply,
                reactions: [...(reply.reactions || []), reaction],
              };
            }
            return reply;
          })
        );
      }
    };

    const handleReactionRemoved = (data: {
      messageId: string;
      reactionId: string;
    }) => {
      if (data.messageId === parentMessage.id) {
        setThreadParent((prev) => ({
          ...prev,
          reactions: (prev.reactions || []).filter(
            (reaction) => reaction.id !== data.reactionId
          ),
        }));
      } else {
        setReplies((prevReplies) =>
          prevReplies.map((reply) => {
            if (reply.id === data.messageId) {
              return {
                ...reply,
                reactions: (reply.reactions || []).filter(
                  (reaction) => reaction.id !== data.reactionId
                ),
              };
            }
            return reply;
          })
        );
      }
    };

    socket.on("thread:replies", handleReplies);
    socket.on("thread:reply", handleNewReply);
    socket.on("message:updated", handleMessageUpdate);
    socket.on("message:deleted", handleMessageDelete);
    socket.on("reaction:added", handleNewReaction);
    socket.on("reaction:removed", handleReactionRemoved);

    return () => {
      socket.off("thread:replies", handleReplies);
      socket.off("thread:reply", handleNewReply);
      socket.off("message:updated", handleMessageUpdate);
      socket.off("message:deleted", handleMessageDelete);
      socket.off("reaction:added", handleNewReaction);
      socket.off("reaction:removed", handleReactionRemoved);
    };
  }, [parentMessage.id]);

  const sendReply = (content: string) => {
    socket.emit("thread:reply", {
      channelId: parentMessage.channelId,
      parentId: parentMessage.id,
      content,
    });
  };

  return (
    <div className="flex flex-col h-full border-l">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">Thread</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b">
          <MessageList messages={[threadParent]} />
        </div>
        <MessageList messages={replies} />
      </div>
      <MessageInput onSendMessage={sendReply} />
    </div>
  );
};
