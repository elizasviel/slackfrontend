import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWorkspaces,
  createWorkspace,
  joinWorkspace,
} from "../../services/api";
import { Workspace } from "../../types";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChannelList } from "./ChannelList";
import { Header } from "../layout/Header";

export const Workspaces = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const [isJoining, setIsJoining] = useState(false);
  const queryClient = useQueryClient();

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspaces,
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: (name: string) => createWorkspace(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setIsCreating(false);
      setNewWorkspaceName("");
    },
    onError: (error: Error) => {
      console.error("Failed to create workspace:", error.message);
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWorkspaceName.trim()) {
      createWorkspaceMutation.mutate(newWorkspaceName);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white border-r shadow-sm overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900">Workspaces</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsJoining(true)}
                  className="p-2 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  title="Join Workspace"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1.5 0a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0zM8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setIsCreating(true)}
                  className="p-2 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  title="Create Workspace"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              {workspaces?.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => setSelectedWorkspace(workspace)}
                  className={`flex items-center w-full p-3 rounded-lg transition-all ${
                    selectedWorkspace?.id === workspace.id
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  title={`Workspace ID: ${workspace.id}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(workspace.id);
                  }}
                >
                  {workspace.iconUrl ? (
                    <img
                      src={workspace.iconUrl}
                      alt={workspace.name}
                      className="w-8 h-8 rounded-md mr-3"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center mr-3">
                      <span className="text-lg font-medium text-indigo-600">
                        {workspace.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{workspace.name}</span>
                    <span className="text-xs text-gray-500">
                      {workspace.channels?.length || 0} channels
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {selectedWorkspace ? (
            <ChannelList workspaceId={selectedWorkspace.id} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <svg
                className="w-16 h-16 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  No workspace selected
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Select a workspace to view its channels
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Workspace Creation Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create Workspace</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label
                    htmlFor="workspaceName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    id="workspaceName"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter workspace name"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
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
                    disabled={createWorkspaceMutation.isPending}
                  >
                    {createWorkspaceMutation.isPending
                      ? "Creating..."
                      : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isJoining && (
          <JoinWorkspaceModal onClose={() => setIsJoining(false)} />
        )}
      </div>
    </div>
  );
};

export const JoinWorkspaceModal = ({ onClose }: { onClose: () => void }) => {
  const [workspaceId, setWorkspaceId] = useState("");
  const queryClient = useQueryClient();

  const joinWorkspaceMutation = useMutation({
    mutationFn: joinWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      onClose();
    },
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (workspaceId.trim()) {
      joinWorkspaceMutation.mutate(workspaceId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Join Workspace</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleJoin}>
          <div className="mb-4">
            <label
              htmlFor="workspaceId"
              className="block text-sm font-medium text-gray-700"
            >
              Workspace ID
            </label>
            <input
              type="text"
              id="workspaceId"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter workspace ID"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              disabled={joinWorkspaceMutation.isPending}
            >
              {joinWorkspaceMutation.isPending ? "Joining..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
