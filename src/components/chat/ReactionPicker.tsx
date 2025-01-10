import { socket } from "../../services/socket";

interface ReactionPickerProps {
  messageId: string;
  channelId: string;
  onClose: () => void;
}

const COMMON_EMOJIS = ["👍", "❤️", "😂", "🎉", "🤔", "👀", "🚀", "👋"];

export const ReactionPicker = ({
  messageId,
  channelId,
  onClose,
}: ReactionPickerProps) => {
  const addReaction = (emoji: string) => {
    console.log("Attempting to add reaction:", {
      channelId,
      messageId,
      emoji,
    });
    socket.emit("reaction:add", {
      channelId,
      messageId,
      emoji,
    });
    onClose();
  };

  return (
    <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border p-2">
      <div className="flex space-x-2">
        {COMMON_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => addReaction(emoji)}
            className="hover:bg-gray-100 p-1 rounded"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};
