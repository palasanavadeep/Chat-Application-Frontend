"use client"

import React, { useEffect, useRef } from "react"
import { useChatStore } from "@/lib/store"
import type { Message } from "@/lib/types"

interface Props {
  convId: string
}

export default function MessagesList({ convId }: Props) {
  const { state } = useChatStore()
  const messages: Message[] = state.chats?.[convId] ?? []
  const elRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // scroll to bottom when messages change
    try {
      const el = elRef.current
      if (el) el.scrollTop = el.scrollHeight
    } catch (e) {}
  }, [messages.length])

  return (
    <div ref={elRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
      {messages.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground">No messages. Say hello!</div>
      ) : (
        messages.map((m) => (
          <div key={m.id} className="p-2 rounded border">
            <div className="text-sm font-medium">{m.senderId}</div>
            <div className="text-base">{m.content}</div>
            <div className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        ))
      )}
    </div>
  )
}
