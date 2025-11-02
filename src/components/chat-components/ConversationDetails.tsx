"use client"

import React from "react"
import type { Conversation } from "@/lib/types"

interface Props {
  conversation: Conversation
}

export default function ConversationDetails({ conversation }: Props) {
  const title = conversation.name ?? conversation.title ?? (conversation.type === "personal" ? "Personal" : "Conversation")
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{conversation.lastMessage ? conversation.lastMessage.content : "No messages yet"}</div>
        </div>
      </div>
    </div>
  )
}
