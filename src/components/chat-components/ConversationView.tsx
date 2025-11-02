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
    <div className="flex-1 flex flex-col">
      <ConversationDetails conversation={conversation} />
      <MessagesList convId={conversation.id} />
      <MessageInput convId={conversation.id} />
    </div>
  )
}
