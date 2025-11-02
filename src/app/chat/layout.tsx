// app/chat/layout.tsx
"use client";


import { ChatList } from "@/components/chat-components/ChatList";
import React, { useState } from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [rightMode, setRightMode] = useState<"default" | "create">("default")

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Left section */}
      <div className="w-full md:w-2/5 lg:w-1/3 border-r border-border flex flex-col">
        <ChatList />
      </div>

      {/* Right section (chat view or creation panel) */}
      <div className="hidden md:flex flex-1 flex-col">
        {rightMode === "default" ? (
          children
        ) : (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create Conversation</h2>
            <div className="space-y-3">
              <button className="w-full p-3 border rounded" onClick={() => alert("Create personal - implement flow")}>Create Personal Conversation</button>
              <button className="w-full p-3 border rounded" onClick={() => alert("Create group - implement flow")}>Create Group Conversation</button>
              <div>
                <button className="mt-4 text-sm text-gray-500" onClick={() => setRightMode("default")}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
