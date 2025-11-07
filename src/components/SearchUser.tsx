"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { User } from "@/lib/types";
import { Search } from "lucide-react";
import { useChatStore } from "@/lib/store";

interface SearchUserProps {
  placeholder?: string;
  onSelect: (user: User) => void;
  exactUsernameLookup?: boolean;
}

export default function SearchUser({
  placeholder = "Search by Username/Email",
  onSelect,
  exactUsernameLookup = false,
}: SearchUserProps) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const { sendSocketAction, state } = useChatStore();
  const searchTimeoutRef = useRef<number | null>(null);

  const resultsFromStore = state.searchResults ?? [];

  const doSearch = async () => {
    if (!q) return;
    setLoading(true);
    try {
      if (exactUsernameLookup) {
        sendSocketAction("getUserByUsername", { username: q });
      } else {
        sendSocketAction("searchUser", { username: q });
      }
    } catch (e) {}

    const tid = window.setTimeout(() => setLoading(false), 8000);
    searchTimeoutRef.current = tid;
  };

  useEffect(() => {
    if ((state.searchResults ?? []).length > 0) {
      setLoading(false);
      const tid = searchTimeoutRef.current;
      if (tid) {
        clearTimeout(tid);
        searchTimeoutRef.current = null;
      }
    }
  }, [state.searchResults]);

  return (
    <div>
      <div className="flex items-center border rounded overflow-hidden">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 outline-none"
        />
        <button onClick={doSearch} className="p-2 bg-gray-100">
          {loading ? "..." : <Search />}
        </button>
      </div>

      <div className="mt-2 space-y-2">
        {resultsFromStore.map((user) => (
          <SearchResultItem
            key={user.id || user.username}
            user={user}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function SearchResultItem({
  user,
  onSelect,
}: {
  user: User;
  onSelect: (user: User) => void;
}) {
  const [fallback, setFallback] = useState<string | null>(null);

  const profileSrc = user.profileImage
    ? user.profileImage.file?.startsWith("data:")
      ? user.profileImage.file
      : `data:image/*;base64,${user.profileImage.file}`
    : "/defaultImage.jpg";

  const srcToUse = fallback ?? profileSrc;

  return (
    <div className="p-2 border rounded flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-10 h-10 relative rounded-full overflow-hidden mr-3">
          <Image
            src={srcToUse}
            alt={user.username ?? user.displayName ?? "profile"}
            fill
            sizes="40px"
            className="object-cover"
            unoptimized
            onError={() => setFallback("/defaultImage.png")}
          />
        </div>
        <div>
          <div className="font-medium">
            {user.username ?? user.displayName}
          </div>
          <div className="text-sm text-muted-foreground">
            {user.email ?? ""}
          </div>
        </div>
      </div>
      <button
        onClick={() => onSelect(user)}
        className="px-3 py-1 bg-blue-500 text-white rounded"
      >
        Add
      </button>
    </div>
  );
}
