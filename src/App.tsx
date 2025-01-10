import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { Workspaces } from "./components/workspace/Workspaces";
import { useAuthStore } from "./store/authstore";
import { ProfilePage } from "./pages/ProfilePage";
import { DirectMessageList } from "./components/dm/DirectMessageList";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/messages" element={<DirectMessageList />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
