// app/chat/layout.tsx
import { ChatList } from "@/components/chat-components/ChatList";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Left section */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border flex flex-col">
        <ChatList />
      </div>

      {/* Right section (chat view or placeholder) */}
      <div className="hidden md:flex flex-1 flex-col">{children}</div>
    </div>
  );
}
