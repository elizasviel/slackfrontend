import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Message, Channel, Reaction } from "../../types";
import api from "../../services/api";
import { socket } from "../../services/socket";
import { MessageList } from "./MessageList";
import { ThreadView } from "./ThreadView";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ItalicIcon,
  CommandLineIcon,
  ListBulletIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import { SearchMessages } from "./SearchMessages";

interface ChatAreaProps {
  channel: Channel;
}

const getMessages = async (channelId: string): Promise<Message[]> => {
  const response = await api.get(`/messages?channelId=${channelId}`);
  return response.data;
};

interface RichTextEditorProps {
  onSendMessage: (content: string) => void;
}

export const RichTextEditor = ({ onSendMessage }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none max-w-none min-h-[40px] px-3 py-2",
      },
    },
  });

  const handleSubmit = () => {
    if (!editor) return;

    const content = editor.getHTML();
    if (content.trim()) {
      onSendMessage(content);
      editor.commands.setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!editor) return null;

  return (
    <div className="border-t bg-white shadow-sm mx-4 mb-4 rounded-lg border">
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-gray-50 rounded-t-lg">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md ${
            editor.isActive("bold")
              ? "bg-indigo-100 text-indigo-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          title="Bold"
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md ${
            editor.isActive("italic")
              ? "bg-indigo-100 text-indigo-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          title="Italic"
        >
          <ItalicIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-md ${
            editor.isActive("code")
              ? "bg-indigo-100 text-indigo-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          title="Code"
        >
          <CommandLineIcon className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md ${
            editor.isActive("bulletList")
              ? "bg-indigo-100 text-indigo-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          title="Bullet List"
        >
          <ListBulletIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md ${
            editor.isActive("orderedList")
              ? "bg-indigo-100 text-indigo-600"
              : "hover:bg-gray-100 text-gray-600"
          }`}
          title="Numbered List"
        >
          <NumberedListIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="px-4 py-3 bg-white rounded-b-lg">
        <EditorContent
          editor={editor}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] max-h-[200px] overflow-y-auto"
        />
      </div>
    </div>
  );
};

export const ChatArea = ({ channel }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<Message | null>(null);

  const { data: initialMessages } = useQuery({
    queryKey: ["messages", channel.id],
    queryFn: () => getMessages(channel.id),
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("channel:join", { channelId: channel.id });

    const handleNewMessage = (message: Message) => {
      if (message.channelId === channel.id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.emit("channel:leave", { channelId: channel.id });
      socket.off("message:new", handleNewMessage);
    };
  }, [channel.id]);

  useEffect(() => {
    const handleNewReaction = (reaction: Reaction) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id === reaction.messageId) {
            return {
              ...msg,
              reactions: [...(msg.reactions || []), reaction],
            };
          }
          return msg;
        })
      );
    };

    const handleReactionRemoved = (data: {
      messageId: string;
      reactionId: string;
    }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          if (msg.id === data.messageId) {
            return {
              ...msg,
              reactions: (msg.reactions || []).filter(
                (reaction) => reaction.id !== data.reactionId
              ),
            };
          }
          return msg;
        })
      );
    };

    socket.on("reaction:added", handleNewReaction);
    socket.on("reaction:removed", handleReactionRemoved);

    return () => {
      socket.off("reaction:added", handleNewReaction);
      socket.off("reaction:removed", handleReactionRemoved);
    };
  }, []);

  useEffect(() => {
    const handleMessageUpdate = (updatedMessage: Message) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMessage.id ? updatedMessage : msg
        )
      );
    };

    const handleMessageDelete = (data: { messageId: string }) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== data.messageId)
      );
    };

    socket.on("message:updated", handleMessageUpdate);
    socket.on("message:deleted", handleMessageDelete);

    return () => {
      socket.off("message:updated", handleMessageUpdate);
      socket.off("message:deleted", handleMessageDelete);
    };
  }, []);

  const sendMessage = (content: string) => {
    if (!socket.connected) {
      console.error("Socket is not connected!");
      return;
    }

    socket.emit("message:new", {
      channelId: channel.id,
      content,
    });
  };

  return (
    <div className="flex h-full">
      <div className={`flex flex-col ${selectedThread ? "w-7/12" : "w-full"}`}>
        <div className="flex-none p-4 border-b bg-white shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">
                #{channel.name}
              </h2>
              {channel.description && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {channel.description}
                </p>
              )}
            </div>
            <div className="flex-grow">
              <SearchMessages
                channelId={channel.id}
                onMessageClick={(messageId) => {
                  const element = document.getElementById(
                    `message-${messageId}`
                  );
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          <div className="h-full px-6 py-4">
            <MessageList
              messages={messages}
              onThreadClick={(message) => setSelectedThread(message)}
            />
          </div>
        </div>

        <div className="flex-none bg-gray-50 py-4">
          <RichTextEditor onSendMessage={sendMessage} />
        </div>
      </div>

      {selectedThread && (
        <div className="w-5/12 border-l bg-gray-50">
          <ThreadView
            parentMessage={selectedThread}
            onClose={() => setSelectedThread(null)}
          />
        </div>
      )}
    </div>
  );
};
