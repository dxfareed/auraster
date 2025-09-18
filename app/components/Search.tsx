"use client";

import { useState } from "react";

export function Search({ onSearch }: { onSearch: (username: string) => void }) {
  const [username, setUsername] = useState("");

  const handleSearch = () => {
    if (username.trim() !== "") {
      onSearch(username);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="e.g. dwr.eth"
        className="flex-grow p-2 border-2 border-red-500 rounded-md bg-black text-white font-mono"
        style={{ boxShadow: "0 0 15px rgba(255, 77, 77, 0.7)" }}
      />
      <button
        onClick={handleSearch}
        className="p-2 bg-red-500 text-white rounded-md font-mono"
        style={{ boxShadow: "0 0 15px rgba(255, 77, 77, 0.7)" }}
      >
        Search
      </button>
    </div>
  );
}