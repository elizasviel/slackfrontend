import axios from "axios";
import { useAuthStore } from "../store/authstore";
import { Workspace } from "../types";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const getChannels = async () => {
  const response = await api.get("/channels");
  return response.data;
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
  const response = await api.get("/workspaces");
  return response.data;
};

export const createWorkspace = async (
  name: string,
  iconUrl?: string
): Promise<Workspace> => {
  try {
    const response = await api.post("/workspaces", { name, iconUrl });
    return response.data;
  } catch (error: any) {
    console.error("Create workspace error:", error.response?.data);
    throw new Error(
      error.response?.data?.error || "Failed to create workspace"
    );
  }
};

export const joinWorkspace = async (
  workspaceId: string
): Promise<Workspace> => {
  try {
    const response = await api.post(`/workspaces/${workspaceId}/join`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || "Failed to join workspace");
  }
};

interface RegisterData {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}

export const register = async (data: RegisterData) => {
  try {
    const response = await api.post("/auth/register", data);
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Registration failed. Please try again.");
  }
};

export default api;
