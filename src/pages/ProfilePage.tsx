import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "../types";
import api from "../services/api";
import { useAuthStore } from "../store/authstore";
import { Avatar } from "../components/shared/Avatar";

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [_, setPreviewUrl] = useState<string | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { fullName: string; username: string }) => {
      const response = await api.patch("/users/profile", data);
      return response.data;
    },
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(["user"], updatedUser);
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await api.post("/users/avatar", formData);
      return response.data;
    },
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(["user"], updatedUser);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (avatarFile) {
      await updateAvatarMutation.mutateAsync(avatarFile);
    }

    await updateProfileMutation.mutateAsync({ fullName, username });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar
              user={user}
              size="lg"
              className="border-2 border-gray-200"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-input"
            />
            <label
              htmlFor="avatar-input"
              className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer hover:bg-indigo-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </label>
          </div>

          <div className="flex-1">
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              updateProfileMutation.isPending || updateAvatarMutation.isPending
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {updateProfileMutation.isPending || updateAvatarMutation.isPending
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};
