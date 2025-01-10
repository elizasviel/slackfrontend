import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Channel } from "../../types";
import { HashtagIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChatArea } from "../chat/ChatArea";
import api from "../../services/api";
import { socket } from "../../services/socket";

interface ChannelListProps {
  workspaceId: string;
}

const getChannels = async (workspaceId: string): Promise<Channel[]> => {
  const response = await api.get(`/channels?workspaceId=${workspaceId}`);
  return response.data;
};

const createChannel = async ({
  name,
  workspaceId,
  description,
  isPrivate = false,
}: {
  name: string;
  workspaceId: string;
  description?: string;
  isPrivate?: boolean;
}) => {
  const response = await api.post("/channels", {
    name,
    workspaceId,
    description,
    isPrivate,
  });
  return response.data;
};

export const ChannelList = ({ workspaceId }: ChannelListProps) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDescription, setNewChannelDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const queryClient = useQueryClient();

  const { data: channels, isLoading } = useQuery({
    queryKey: ["channels", workspaceId],
    queryFn: () => getChannels(workspaceId),
  });

  const createChannelMutation = useMutation({
    mutationFn: createChannel,
    onSuccess: (newChannel) => {
      queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
      socket.emit("channel:join", { channelId: newChannel.id });
      setSelectedChannel(newChannel);
      setIsCreating(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setNewChannelName("");
    setNewChannelDescription("");
    setIsPrivate(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChannelName.trim()) {
      createChannelMutation.mutate({
        name: newChannelName.trim(),
        workspaceId,
        description: newChannelDescription.trim() || undefined,
        isPrivate,
      });
    }
  };

  if (isLoading) return <div>Loading channels...</div>;

  return (
    <div className="flex h-full">
      <div className="w-64 border-r">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Channels
            </h3>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1 rounded-md hover:bg-gray-200"
              title="Create Channel"
            >
              <PlusIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="space-y-1">
            {channels?.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`flex items-center px-3 py-1.5 w-full text-gray-700 hover:bg-gray-100 rounded-md group ${
                  selectedChannel?.id === channel.id ? "bg-gray-100" : ""
                }`}
              >
                <HashtagIcon className="h-4 w-4 mr-2 text-gray-400 group-hover:text-gray-500" />
                <span className="truncate">{channel.name}</span>
                {channel.isPrivate && (
                  <span className="ml-2 text-xs text-gray-400">🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {selectedChannel ? (
          <ChatArea channel={selectedChannel} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a channel to start chatting
          </div>
        )}
      </div>

      {/* Channel Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Channel</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="channelName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Channel Name
                  </label>
                  <input
                    type="text"
                    id="channelName"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g. marketing"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="channelDescription"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="channelDescription"
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="What's this channel about?"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isPrivate"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Make private
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  disabled={createChannelMutation.isPending}
                >
                  {createChannelMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
