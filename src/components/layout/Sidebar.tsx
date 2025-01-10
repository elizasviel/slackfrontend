import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export const Sidebar = () => {
  return (
    <div className="w-16 bg-gray-800 flex flex-col items-center py-4">
      {/* Existing workspace icons */}

      <div className="border-t border-gray-700 w-full my-4" />

      <Link
        to="/messages"
        className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-700 mb-4"
      >
        <ChatBubbleLeftIcon className="w-6 h-6 text-gray-300" />
      </Link>
    </div>
  );
};
