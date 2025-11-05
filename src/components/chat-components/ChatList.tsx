"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare, Users, Plus, User as UserIcon } from "lucide-react";
import { useChatStore } from "@/lib/store";
import ChatListItem from "./ChatListItem";
import React from "react";

export function ChatList() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, setConversationFilter } = useChatStore()

  const filter = state.conversationFilter ?? "all"

  const conversations = (state.conversations ?? []).filter(c => {
    if (filter === "all") return true
    if (filter === "group") return (c.type.lookupCode.toLowerCase() ?? "") === "group"
    if (filter === "personal") return (c.type.lookupCode.toLowerCase() ?? "") === "personal"
    if (filter === "broadcast") return (c.type.lookupCode.toLowerCase() ?? "") === "broadcast"
    return true
  })

  return (
    <div className="flex flex-col h-full">
      {/* Top row: title + new conversation button */}
      <div className="p-3 flex items-center justify-between border-b">
        <div className="font-semibold text-lg">Chat Application</div>
        <button
          aria-label="New Conversation"
          onClick={() => router.push('/chat/new')}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Icon column */}
        <div className="w-20 border-r flex flex-col items-center py-3">
          <div className="flex flex-col items-center space-y-3">
            <div className="flex flex-col items-center">
              <button onClick={() => setConversationFilter("all")} className="p-2 rounded-md hover:bg-gray-100">
                <MessageSquare />
              </button>
              <span className="text-[11px] mt-1 text-center">All</span>
            </div>

            <div className="flex flex-col items-center">
              <button onClick={() => setConversationFilter("group")} className="p-2 rounded-md hover:bg-gray-100">
                <Users />
              </button>
              <span className="text-[11px] mt-1 text-center">Groups</span>
            </div>
          </div>

          <div className="flex-1" />

          <div className="mb-3">
            <ProfileButton />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div key={c.id} onClick={() => router.push(`/chat/${c.id}`)}>
              <ChatListItem conversation={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push('/profile')}
      className="flex flex-col items-center p-1 rounded-md hover:bg-gray-100"
      aria-label="Profile"
    >
      <UserIcon />
      <span className="text-[11px] mt-1">Profile</span>
    </button>
  )
}
