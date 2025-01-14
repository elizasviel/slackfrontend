import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Workspaces } from "./components/workspace/Workspaces";
import { useAuthStore } from "./store/authstore";
import { ProfilePage } from "./pages/ProfilePage";
import { DirectMessageList } from "./components/dm/DirectMessageList";
import { useState, useEffect } from "react";
import api from "./services/api";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!token) throw new Error("No token");
        const response = await api.get("/auth/me");
        useAuthStore.getState().setAuth(response.data, token);
        setIsLoading(false);
      } catch (error) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    };

    verifyAuth();
  }, [token]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return token ? children : <Navigate to="/login" />;
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/workspaces"
            element={
              <PrivateRoute>
                <Workspaces />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/workspaces" />} />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <DirectMessageList />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
