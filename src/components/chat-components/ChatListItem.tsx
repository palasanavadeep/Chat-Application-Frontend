"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import type { Conversation } from "@/lib/types";
import { useChatStore } from "@/lib/store";
import { base64ToDataUrl } from "@/lib/utils";

interface ChatListItemProps {
  conversation: Conversation;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ conversation }) => {
  // Determine display name and image depending on conversation type
  const isGroup =
    (conversation.type?.lookupCode ?? "").toLowerCase() === "group";
  const me = useChatStore((s) => s.state.user);
  const activeConversationId = useChatStore(
    (s) => s.state.activeConversationId
  );

  let displayName: string;
  let imageSrc: string;

  // useEffect(()=>{
  //     console.log(conversation)
  //     console.log(activeConversationId)
  // },[])

  if (isGroup) {
    displayName = conversation.name ?? `Group ${conversation.id}`;
    imageSrc = conversation.conversationImage?.file || "/defaultImage.jpg";
  } else {
    // personal: pick the other participant (user.id !== current user id)
    const parts = conversation.conversationParticipants ?? [];
    const myId = Number(me?.id);
    const otherPart =
      parts.find((p) => Number(p?.user?.id) !== myId) ?? parts[0];
    const otherUser = otherPart?.user;
    displayName =
      otherUser?.displayName ??
      otherUser?.username ??
      conversation.name ??
      `Conversation ${conversation.id}`;
    imageSrc =
      otherUser?.profileImage?.file ??
      conversation.conversationImage?.file ??
      "/defaultImage.jpg";
  }

  let lastMessage = conversation.lastMessage?.body ?? "Start Chat";
  const hasUnread =
    !!conversation.hasUnreadMessages || !!conversation.unreadCount;

  return (
    <div
      className={`flex items-center p-3 border-b border-gray-200 cursor-pointer select-none
      ${activeConversationId == conversation.id ? "bg-gray-200" : ""}
      hover:bg-gray-100 transition-colors`}
    >
      {/* Profile Image */}
      <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden mr-3">
        <Image
          src={
            imageSrc === "/defaultImage.jpg"
              ? "/defaultImage.jpg"
              : base64ToDataUrl(imageSrc)
          }
          alt={`${displayName} profile`}
          fill
          sizes="48px"
          className="object-cover"
          unoptimized
        />
      </div>

      {/* Text Section */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-base font-semibold text-gray-800 truncate">
          {displayName}
        </div>
        <div className="text-sm text-gray-600 truncate">{lastMessage}</div>
      </div>

      {/* Unread Indicator */}
      {hasUnread && (
        <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full ml-2" />
      )}
    </div>
  );
};

export default ChatListItem;
