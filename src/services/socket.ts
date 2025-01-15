import { io } from "socket.io-client";
import { useAuthStore } from "../store/authstore";

const SOCKET_URL = "https://slackclone-4768892ccc31.herokuapp.com/";

export const socket = io(SOCKET_URL, {
  auth: {
    get token() {
      return useAuthStore.getState().token;
    },
  },
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Socket connected with ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("message:new", (message) => {
  console.log("New message received:", message);
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

export const initializeSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
