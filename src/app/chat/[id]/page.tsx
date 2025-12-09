"use client"

import React, { useEffect } from "react"
import { useParams } from "next/navigation"
import { useChatStore } from "@/lib/store/useChatStore"
import ConversationView from "@/components/chat-components/ConversationView"

export default function ConversationPage() {
  const params = useParams()
  const id = params?.id as string | undefined
  const setActiveConversation = useChatStore((s) => s.setActiveConversation)
  const  conversation = useChatStore((s) => s.state.conversations.find((c) => String(c.id) === String(id)))
  const {sendSocketAction} = useChatStore();
  const addOrUpdateConversation = useChatStore((s) => s.addOrUpdateConversation)
  
  useEffect(() => {
    try {
      setActiveConversation(id ?? null)

      // if conversation had unread messages, clear them locally and inform server
      try {
        if (conversation?.hasUnreadMessages) {
          // update local store so UI updates immediately
          addOrUpdateConversation({ ...conversation, hasUnreadMessages: false, unreadCount: 0 })
        }
      } catch (e) {}

      // notify server to mark messages as read for this conversation
      try {
        sendSocketAction(
          "markConversationMessagesAsRead",
          { conversationId: conversation?.id }
        );
      } catch (e) {}
      
    } catch (e) {}
    return () => {
      try {
        setActiveConversation(null)
      } catch (e) {}
    }
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
        <div>Conversation Not found or You are not a member of the conversation</div>
      </div>
    )
  }

  return <ConversationView conversation={conversation} />
}
