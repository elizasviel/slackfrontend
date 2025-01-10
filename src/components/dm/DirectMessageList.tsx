import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, DirectMessage } from "../../types";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { DirectMessageChat } from "./DirectMessageChat";
import api from "../../services/api";
import { Avatar } from "../shared/Avatar";
import { Header } from "../layout/Header";

const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const DirectMessageList = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
              <span className="text-sm text-gray-500">
                {users?.length || 0} users
              </span>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search users..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div className="space-y-1">
              {users?.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center w-full p-3 rounded-lg transition-all ${
                    selectedUser?.id === user.id
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar user={user} size="md" />
                    <span
                      className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                        user.status === "ONLINE"
                          ? "bg-green-400"
                          : user.status === "AWAY"
                          ? "bg-yellow-400"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium truncate">
                        {user.fullName || user.username}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        12m
                      </span>
                    </div>
                    <div className="flex items-center">
                      <p className="text-xs text-gray-500 truncate">
                        {user.status === "ONLINE"
                          ? "Active now"
                          : user.status.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 bg-gray-50">
          {selectedUser ? (
            <DirectMessageChat user={selectedUser} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Your Messages
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Select a user from the list to start a conversation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
