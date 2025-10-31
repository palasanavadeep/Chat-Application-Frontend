"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ChatList() {
  const router = useRouter();
  const pathname = usePathname();

  const chats = [
    { id: "1", name: "Alice", lastMessage: "Hey!", hasNew: true },
    { id: "2", name: "Group Project", lastMessage: "Let's start coding...", hasNew: false },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 font-semibold text-lg border-b">Chats</div>

      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <div
            key={chat.id}
            onClick={() => router.push(`/chat/${chat.id}`)}
            className={cn(
              "p-3 hover:bg-muted cursor-pointer border-b transition-all",
              pathname === `/chat/${chat.id}` && "bg-muted"
            )}
          >
            <div className="font-medium">{chat.name}</div>
            <div className="text-sm text-muted-foreground truncate">
              {chat.lastMessage}
            </div>
            {chat.hasNew && <span className="text-xs text-primary">● New</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
