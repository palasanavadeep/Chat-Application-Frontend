// "use client";

// import React, { useEffect, useRef } from "react";
// import { useChatStore } from "@/lib/ChatStoreInitializer";
// import type { Message } from "@/lib/types";
// import MessageComponent from "./MessageComponent";

// interface Props {
//   convId: string | number;
// }

// export default function MessagesList({ convId }: Props) {
//   const { state } = useChatStore();
//   const messages: Message[] = state.chats?.[convId] ?? [];
//   const elRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     // Scroll to bottom when messages change or component mounts
//     const el = elRef.current;
//     if (el) {
//       // Wait for the DOM to fully render before scrolling
//       el.scrollTop = el.scrollHeight;
//     }
//   }, [messages]); // Re-run this effect whenever the messages array changes

//   return (
//     <div ref={elRef} className="h-full overflow-y-scroll p-4 space-y-3 bg-white max-w-lvw">
//       {messages.length === 0 ? (
//         <div className="text-center text-sm text-muted-foreground">No messages. Say hello!</div>
//       ) : (
//         messages.map((m) => (
//           <MessageComponent 
//             key={m.id}
//             message={m} 
//             currentUserId={Number(state.user?.id)} 
//           />
//         ))
//       )}
//     </div>
//   );
// }
"use client";

import React, { useEffect, useRef, useMemo } from "react";
import { useChatStore } from "@/lib/ChatStoreInitializer";
import type { Message } from "@/lib/types";
import MessageComponent from "./MessageComponent";

interface Props {
  convId: string | number;
}

export default function MessagesList({ convId }: Props) {
  const { state } = useChatStore();
  const messages: Message[] = state.chats?.[convId] ?? [];
  const elRef = useRef<HTMLDivElement | null>(null);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    const dateMap = new Map<string, Message[]>();

    // Group messages by date
    messages.forEach((msg) => {
      if (!msg.createdAt) return; // Skip messages with null createdAt
      const date = new Date(Number(msg.createdAt)); // Convert milliseconds to Date
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }); // e.g., "November 12, 2025"

      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(msg);
    });

    // Convert map to array for rendering
    dateMap.forEach((msgs, date) => {
      groups.push({ date, messages: msgs });
    });

    // Sort groups by date (ascending)
    groups.sort((a, b) => {
      const dateA = new Date(a.messages[0].createdAt!).getTime();
      const dateB = new Date(b.messages[0].createdAt!).getTime();
      return dateA - dateB;
    });

    return groups;
  }, [messages]);

  // Scroll to bottom when messages change or component mounts
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      // Wait for DOM to render
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages]);

  return (
    <div
      ref={elRef}
      className="h-full overflow-y-scroll p-4 space-y-3 bg-white max-w-lvw"
    >
      {groupedMessages.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground">
          No messages. Say hello!
        </div>
      ) : (
        groupedMessages.map((group) => (
          <div key={group.date} className="space-y-3">
            {/* Date Header: Non-sticky, appears before first message */}
            <div className="text-center text-xs text-muted-foreground py-2">
              {group.date}
            </div>
            {/* Messages for this date */}
            {group.messages.map((m) => (
              <MessageComponent
                key={m.id}
                message={m}
                currentUserId={Number(state.user?.id)}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}