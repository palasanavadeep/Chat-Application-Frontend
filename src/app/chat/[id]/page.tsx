"use client"

import React, { useEffect } from "react"
import { useParams } from "next/navigation"
import { useChatStore } from "@/lib/store/useChatStore"
import ConversationView from "@/components/chat-components/ConversationView"

export default function ConversationPage() {
  const params = useParams()
  const id = params?.id as string | undefined
  const setActiveConversation = useChatStore((s) => s.setActiveConversation)
  const conversation = useChatStore((s) => s.state.conversations.find((c) => c.id === id))

  useEffect(() => {
    try {
      setActiveConversation(id ?? null)
    } catch (e) {}
    return () => {
      try {
        setActiveConversation(null)
      } catch (e) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!id) {
    return (
      <div className="h-full flex items-center justify-center text-gray-600">
        <div>Select a chat to view details</div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center text-gray-600">
        <div>Loading conversation…</div>
      </div>
    )
  }

  return <ConversationView conversation={conversation} />
}
