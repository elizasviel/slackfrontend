import { useState } from "react";
import { Message, Reaction } from "../../types";
import { format } from "date-fns";
import { socket } from "../../services/socket";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  PencilIcon,
  FaceSmileIcon,
  TrashIcon,
  CommandLineIcon,
  BoldIcon,
  ItalicIcon,
} from "@heroicons/react/24/outline";
import { ReactionPicker } from "./ReactionPicker";
import { Avatar } from "../shared/Avatar";
interface MessageItemProps {
  message: Message;
  onThreadClick?: (message: Message) => void;
}

export const MessageItem = ({ message, onThreadClick }: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionButtonRef, setReactionButtonRef] =
    useState<HTMLButtonElement | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: message.content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm focus:outline-none max-w-none min-h-[40px] px-3 py-2",
      },
    },
  });

  const handleEdit = () => {
    if (!editor) return;

    const content = editor.getHTML();
    if (content.trim() === message.content.trim()) {
      setIsEditing(false);
      return;
    }

    socket.emit("message:edit", {
      messageId: message.id,
      channelId: message.channelId,
      content: content,
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      socket.emit("message:delete", {
        messageId: message.id,
        channelId: message.channelId,
      });
    }
  };

  return (
    <div className="group hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">
      <div className="flex items-start gap-4">
        <Avatar user={message.user} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {message.user.fullName || message.user.username}
            </span>
            <span className="text-xs text-gray-500">
              {format(new Date(message.createdAt), "h:mm a")}
            </span>
            {message.edited && (
              <span className="text-xs text-gray-400 italic">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <div className="border bg-white shadow-sm rounded-lg">
                <div className="flex items-center gap-1 px-4 py-2 border-b bg-gray-50 rounded-t-lg">
                  <button
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-md ${
                      editor?.isActive("bold")
                        ? "bg-indigo-100 text-indigo-600"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                    title="Bold"
                  >
                    <BoldIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-md ${
                      editor?.isActive("italic")
                        ? "bg-indigo-100 text-indigo-600"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                    title="Italic"
                  >
                    <ItalicIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => editor?.chain().focus().toggleCode().run()}
                    className={`p-1.5 rounded-md ${
                      editor?.isActive("code")
                        ? "bg-indigo-100 text-indigo-600"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                    title="Code"
                  >
                    <CommandLineIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-4 py-3 bg-white rounded-b-lg">
                  <EditorContent
                    editor={editor}
                    className="min-h-[60px] max-h-[200px] overflow-y-auto"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={handleEdit} className="btn btn-primary">
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                className="prose prose-sm max-w-none mt-1"
                dangerouslySetInnerHTML={{ __html: message.content }}
              />

              {/* Reactions */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {message.reactions &&
                  message.reactions.length > 0 &&
                  Object.entries(
                    message.reactions.reduce(
                      (acc: { [key: string]: Reaction[] }, reaction) => {
                        if (!acc[reaction.emoji]) {
                          acc[reaction.emoji] = [];
                        }
                        acc[reaction.emoji].push(reaction);
                        return acc;
                      },
                      {}
                    )
                  ).map(([emoji, reactions]) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        socket.emit("reaction:add", {
                          channelId: message.channelId,
                          messageId: message.id,
                          emoji,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                      title={reactions
                        .map((r) => r.user.fullName || r.user.username)
                        .join(", ")}
                    >
                      <span>{emoji}</span>
                      <span className="text-gray-600">{reactions.length}</span>
                    </button>
                  ))}
                <div className="relative">
                  <button
                    ref={setReactionButtonRef}
                    onClick={() => setShowReactionPicker(!showReactionPicker)}
                    className="inline-flex items-center p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                  >
                    <FaceSmileIcon className="h-4 w-4" />
                  </button>
                  {showReactionPicker && reactionButtonRef && (
                    <div className="absolute bottom-full mb-2 left-0">
                      <ReactionPicker
                        messageId={message.id}
                        channelId={message.channelId}
                        onClose={() => setShowReactionPicker(false)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Thread link */}
              {onThreadClick && (
                <button
                  onClick={() => onThreadClick(message)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 mt-1"
                >
                  {message.threadParentId ? "View thread" : "Reply in thread"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Message actions */}
        <div className="flex items-center gap-2 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            title="Edit message"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
            title="Delete message"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
