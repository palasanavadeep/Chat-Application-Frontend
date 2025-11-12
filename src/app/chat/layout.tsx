// app/chat/layout.tsx
"use client";

import { ChatList } from "@/components/chat-components/ChatList";
import React, { useState } from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [rightMode, setRightMode] = useState<"default" | "create">("default");
  const [showListMobile, setShowListMobile] = useState(false);

  return (
    <div className="h-screen flex bg-background text-foreground relative">
      {/* Left section - visible on md+ */}
      <div className="hidden md:flex w-full sm:w-1/5 md:w-2/5 lg:w-1/3 border-r border-border flex-col">
        <ChatList />
      </div>

      {/* Mobile overlay for chat list (WhatsApp style) */}
      {showListMobile && (
        <div className="fixed inset-0 z-50 md:hidden bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <h3 className="text-lg font-medium">Chats</h3>
            <button
              aria-label="Close chat list"
              className="text-sm text-muted-foreground"
              onClick={() => setShowListMobile(false)}
            >
              Close
            </button>
          </div>
          <div className="overflow-auto">
            <ChatList />
          </div>
        </div>
      )}

    {/* Right section (chat view or creation panel) */}
    {/* ensure the right column does not grow beyond the viewport by allowing
      its children to overflow internally (min-h-0) */}
    <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar for small devices: menu to open list and create button */}
        <div className="md:hidden flex items-center justify-between p-2 border-b border-border">
          <div className="flex items-center gap-2">
            <button
              aria-label="Open chat list"
              className="p-2 rounded hover:bg-accent/10"
              onClick={() => setShowListMobile(true)}
            >
              ☰
            </button>
            <h2 className="text-sm font-medium">Conversation</h2>
          </div>

          {/* <div>
            <button
              className="text-sm p-2 rounded hover:bg-accent/10"
              onClick={() => setRightMode("create")}
            >
              + New
            </button>
          </div> */}
        </div>

        {/* Content */}
        {/* Make the right pane a flex column so children control their own scrolling.
            Conversation pages should keep header and input visible while MessagesList
            handles overflowing messages. */}
        <div className="flex-1 flex flex-col min-h-0">
          {rightMode === "default" ? (
            children
          ) : (
            <div className="p-6 max-w-3xl mx-auto overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create Conversation</h2>
                <button
                  className="text-sm text-gray-500"
                  onClick={() => setRightMode("default")}
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <button
                  className="w-full p-3 border rounded"
                  onClick={() => alert("Create personal - implement flow")}
                >
                  Create Personal Conversation
                </button>
                <button
                  className="w-full p-3 border rounded"
                  onClick={() => alert("Create group - implement flow")}
                >
                  Create Group Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
