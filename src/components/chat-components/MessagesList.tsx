"use client";

import React, { useEffect, useRef } from "react";
import { useChatStore } from "@/lib/store";
import type { Message } from "@/lib/types";
import MessageComponent from "./MessageComponent";

interface Props {
  convId: string | number;
}

export default function MessagesList({ convId }: Props) {
  const { state } = useChatStore();
  const messages: Message[] = state.chats?.[convId] ?? [];
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to bottom when messages change or component mounts
    const el = elRef.current;
    if (el) {
      // Wait for the DOM to fully render before scrolling
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]); // Re-run this effect whenever the messages array changes

  return (
    <div ref={elRef} className="h-full overflow-y-scroll p-4 space-y-3 bg-white max-w-lvw">
      {messages.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground">No messages. Say hello!</div>
      ) : (
        messages.map((m) => (
          <MessageComponent 
            key={m.id}
            message={m} 
            currentUserId={Number(state.user?.id)} 
          />
        ))
      )}
    </div>
  );
}
