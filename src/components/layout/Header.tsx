import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authstore";
import {
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { Avatar } from "../shared/Avatar";
export const Header = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <Link
          to="/workspaces"
          className="flex items-center space-x-2 text-xl font-bold text-indigo-600 hover:text-indigo-700"
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>Workspaces</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <Link
          to="/messages"
          className="flex items-center space-x-2 p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
          title="Messages"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:block">Messages</span>
        </Link>

        <div className="h-8 w-px bg-gray-200" />

        <div className="relative group">
          <button className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-full transition-all">
            <Avatar user={user} size="sm" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.username}
            </span>
          </button>

          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
            <Link
              to="/profile"
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <UserCircleIcon className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
