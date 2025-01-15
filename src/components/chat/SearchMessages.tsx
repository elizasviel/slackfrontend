import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
  username: string;
  similarity: number;
}

interface SearchMessagesProps {
  channelId: string;
  onMessageClick: (messageId: string) => void;
}

export const SearchMessages = ({
  channelId,
  onMessageClick,
}: SearchMessagesProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ["messageSearch", channelId, query],
    queryFn: async () => {
      if (!query) return [];
      const response = await api.get(
        `/search/semantic?query=${query}&channelId=${channelId}`
      );
      return response.data as SearchResult[];
    },
    enabled: !!query,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            results && prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (results && results[selectedIndex]) {
            onMessageClick(results[selectedIndex].id);
            setIsOpen(false);
            setQuery("");
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onMessageClick]);

  return (
    <div className="relative max-w-2xl">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="SEMANTIC SEARCH..."
          className="w-full px-4 py-2 pl-10 pr-12 bg-gray-100 border border-transparent rounded-lg 
                   focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                   transition-all duration-200"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-2.5 p-0.5 hover:bg-gray-200 rounded-full transition-colors"
          >
            <XMarkIcon className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>

      {isOpen && (query || isLoading || (results && results.length > 0)) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
        >
          <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs text-gray-500 border-b">
            {isLoading
              ? "Searching..."
              : results?.length === 0
              ? "No results found"
              : `${results?.length} results found`}
          </div>

          {results && results.length > 0 && (
            <div className="divide-y divide-gray-100">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => {
                    onMessageClick(result.id);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150
                    ${index === selectedIndex ? "bg-indigo-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {result.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(result.created_at).toLocaleDateString()} at{" "}
                      {new Date(result.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {result.content}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Relevance: {Math.round((1 - result.similarity) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {results && results.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t">
              <div className="flex justify-between items-center">
                <span>Use arrow keys to navigate</span>
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 bg-white rounded shadow-sm">↑</kbd>
                  <kbd className="px-2 py-1 bg-white rounded shadow-sm">↓</kbd>
                  <kbd className="px-2 py-1 bg-white rounded shadow-sm">
                    Enter
                  </kbd>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
