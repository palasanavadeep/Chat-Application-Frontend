"use client"

import React from "react"
import type { Conversation } from "@/lib/types"
import ConversationDetails from "./ConversationDetails"
import MessagesList from "./MessagesList"
import MessageInput from "./MessageInput"

interface Props {
  conversation: Conversation
}

export default function ConversationView({ conversation }: Props) {
  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* header - fixed height (flex-none) */}
      <div className="flex-none">
        <ConversationDetails conversation={conversation} />
      </div>

      {/* messages - takes remaining space and is scrollable */}
      <div className="flex-1 min-h-0">
        <MessagesList convId={conversation.id} />
      </div>

      {/* input - fixed at bottom */}
      <div className="flex-none">
        <MessageInput convId={conversation.id} />
      </div>
    </div>
  )
}
